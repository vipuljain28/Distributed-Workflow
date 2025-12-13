// src/worker.ts
import { WorkflowRunStatus, PrismaClient } from "@prisma/client";
import { logger } from "./lib/logger";
import dotenv from "dotenv";
import { Worker } from "bullmq";
import { workflowQueue, nodeQueue } from "./queue/bull.config";

dotenv.config();

const prisma = new PrismaClient();

// Use the SAME redis connection + prefix as bull.config.ts
const connection = {
  host: "localhost",
  port: 6379,
};

const prefix = process.env.BULL_PREFIX || "flow";

logger.info("🚀 Starting WorkflowRun Worker...");

/**
 * WORKFLOW RUN WORKER
 * - Picks jobs from workflow_run
 * - Finds START node
 * - Creates NodeRun
 * - Enqueues node_execute job
 */
const workflowWorker = new Worker(
  "workflow_run",
  async (job) => {


    const { workflowRunId, workflowId, input } = job.data || {};
    logger.info({ jobId: job.id, workflowRunId, workflowId }, "⚙ Processing workflow job");
    let wr = null;
    if (workflowRunId) {
      wr = await prisma.workflowRun.findUnique({
        where: { id: workflowRunId },
        include: {
          workflow: {
            include: {
              nodes: { orderBy: { position: "asc" } },
              edges: true,
              conditions: true,
            },
          },
        },
      });

      if (!wr) {
        logger.error("❌ WorkflowRun not found");
        return;
      }
    } else if (workflowId) {
      const wf = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: { orderBy: { position: "asc" } },
          edges: true,
          conditions: true,
        },
      });

      if (!wf) {
        logger.error({ workflowId }, "❌ Workflow not found for scheduled job");
        return;
      }
      wr = await prisma.workflowRun.create({
        data: {
          workflowId: wf.id,
          status: WorkflowRunStatus.PENDING,
          input: input ?? {},
        },
        include: {
          workflow: {
            include: {
              nodes: { orderBy: { position: "asc" } },
              edges: true,
              conditions: true,
            },
          },
        },
      });
      logger.info({ workflowRunId: wr.id }, "🆕 Created WorkflowRun for scheduled job");
    } else {
      logger.error("❌ Job missing workflowRunId and workflowId");
      return;
    }
    const effectiveWorkflowRunId: string = wr.id;
    const nodes = wr.workflow.nodes;
    if (!nodes.length) {
      logger.error("❌ No nodes in workflow");
      return;
    }

    const startNode = nodes.find((n) => n.type === "START");
    if (!startNode) {
      logger.error("❌ No START node found");
      return;
    }

    logger.info(`📌 START node = ${startNode.id}`);

    const nodeRun = await prisma.nodeRun.create({
      data: {
        nodeId: startNode.id,
        workflowRunId: effectiveWorkflowRunId,
        status: "PENDING",
        input: wr.input ?? {},
      },
    });

    logger.info(`🟢 NodeRun created ${nodeRun.id}`);

    // enqueue execution for node
    await nodeQueue.add(
      "execute",
      { nodeRunId: nodeRun.id },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
      }
    );

    await prisma.workflowRun.update({
      where: { id: effectiveWorkflowRunId },
      data: {
        status: WorkflowRunStatus.RUNNING,
        startedAt: new Date(),
      },
    });

    logger.info(` WorkflowRun ${effectiveWorkflowRunId} is now RUNNING`);
  },
  { connection, prefix }
);

// events
workflowWorker.on("completed", (job) => {
  logger.info(`✅ WorkflowRun job ${job.id} completed`);
});

workflowWorker.on("failed", (job, err) => {
  logger.error(`❌ WorkflowRun job ${job?.id} failed: ${err.message}`);
});

// Start node worker
logger.info("Starting Node Worker...");

