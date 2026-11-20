// src/execution/engine.ts
import { prisma } from "../db/client";
import { nodeRegistry } from "./node-registry";
import { nodeQueue } from "../queue/bull.config";
import { WorkflowRunStatus, NodeRunStatus } from "@prisma/client";
import { evalExpression } from "./expression-evaluator";
import { NodeExecutionResult, NodeExecutionInput } from "./types";
import { logger } from "../lib/logger";

export class Engine {
  // execute a single nodeRun (by id)
  async executeNodeRun(nodeRunId: string): Promise<void> {
    logger.info({ nodeRunId }, "Engine.executeNodeRun: start");

    const nodeRun = await prisma.nodeRun.findUnique({
      where: { id: nodeRunId },
      include: {
        node: true,
        workflowRun: {
          include: {
            workflow: {
              include: { edges: true, conditions: true, nodes: true }
            }
          }
        }
      }
    });

    if (!nodeRun) throw new Error(`NodeRun ${nodeRunId} not found`);

    const node = nodeRun.node;
    const workflowRun = nodeRun.workflowRun;
    const workflow = workflowRun.workflow;

    // mark node running
    await prisma.nodeRun.update({
      where: { id: nodeRunId },
      data: { status: NodeRunStatus.RUNNING, startedAt: new Date() }
    });

    // resolve executor
    const ExecutorCtor = nodeRegistry.getExecutor(node.type);
    if (!ExecutorCtor) {
      await this.failNode(nodeRunId, `No executor for node type ${node.type}`);
      return;
    }

    // create executor and run
    const executor = new ExecutorCtor(node.config ?? {});
    let result: NodeExecutionResult;
    try {
      const input: NodeExecutionInput =
        typeof nodeRun.input === "object" && nodeRun.input !== null
          ? nodeRun.input as Record<string, any>
          : { value: nodeRun.input };
      result = await executor.execute(input);
    } catch (err: any) {
      await this.failNode(nodeRunId, String(err?.message ?? err));
      return;
    }

    if (!result || result.success !== true) {
      const message = result?.errorMessage ?? "Node execution failed";
      await this.failNode(nodeRunId, message);
      return;
    }

    // success: update nodeRun output + finishedAt
    await prisma.nodeRun.update({
      where: { id: nodeRunId },
      data: {
        status: NodeRunStatus.SUCCESS,
        output: result.output !== undefined
          ? JSON.parse(JSON.stringify(result.output))
          : null,
        finishedAt: new Date()
      }
    });

    // compute next edges from this node
    const outgoingEdges = workflow.edges.filter(e => e.fromNodeId === node.id);

    // If node is an APPROVAL_GATE, pause DAG execution until human approves
    if (node.type === "APPROVAL_GATE") {
      await prisma.workflowRun.update({
        where: { id: workflowRun.id },
        data: {
          status: WorkflowRunStatus.WAITING_APPROVAL,
          output: result.output !== undefined
            ? JSON.parse(JSON.stringify(result.output))
            : null,
        }
      });
      logger.info({ workflowRunId: workflowRun.id, nodeRunId }, "Workflow paused at APPROVAL_GATE. Awaiting human intervention.");
      return;
    }

    if (!outgoingEdges || outgoingEdges.length === 0) {
      // If node type is END or no outgoing edges, finish workflow
      if (node.type === "END") {
        await this.finishWorkflowRun(workflowRun.id, result.output ?? {});
      }
      return;
    }

    // For each outgoing edge, evaluate condition if present, and enqueue NodeRun
    const ctx = { input: nodeRun.input ?? {}, output: result.output ?? {} };

    for (const edge of outgoingEdges) {
      if (edge.conditionId) {
        const cond = workflow.conditions.find(c => c.id === edge.conditionId)
          ?? await prisma.condition.findUnique({ where: { id: edge.conditionId } });
        const params = cond?.params as Record<string, any> | null;
        const expr = params?.expression ?? params?.expr ?? null;
        if (!expr) {
          // skip branch if no expression
          continue;
        }
        let pass = false;
        try {
          pass = Boolean(await evalExpression(expr, ctx));
        } catch (e: any) {
          logger.error({ err: e, edgeId: edge.id }, "Condition eval failed");
          pass = false;
        }
        if (!pass) continue;
      }

      // create next NodeRun
      const nextNode = workflow.nodes.find((n) => n.id === edge.toNodeId);
      const nextConfig = (nextNode?.config ?? {}) as any;
      const retryCfg = (nextConfig.retry ?? {}) as { attempts?: number; delayMs?: number };

      const attempts = retryCfg.attempts && retryCfg.attempts > 0 ? retryCfg.attempts : 3;
      const delay = retryCfg.delayMs && retryCfg.delayMs > 0 ? retryCfg.delayMs : 2000;

      const nextNodeRun = await prisma.nodeRun.create({
        data: {
          workflowRunId: workflowRun.id,
          nodeId: edge.toNodeId,
          status: NodeRunStatus.PENDING,
          input: result.output ?? {},
        },
      });

      await nodeQueue.add(
        "execute",
        { nodeRunId: nextNodeRun.id },
        {
          attempts,
          backoff: { type: "exponential", delay },
        }
      );

      logger.info({ nextNodeRunId: nextNodeRun.id, attempts, delay }, "Enqueued next nodeRun");
    }
  }

  private async failNode(nodeRunId: string, message: string) {
    try {
      await prisma.nodeRun.update({
        where: { id: nodeRunId },
        data: { status: NodeRunStatus.FAILED, errorMessage: message, finishedAt: new Date() }
      });

      const nr = await prisma.nodeRun.findUnique({ where: { id: nodeRunId } });
      if (nr) {
        await prisma.workflowRun.update({
          where: { id: nr.workflowRunId },
          data: { status: WorkflowRunStatus.FAILED, finishedAt: new Date() }
        });
      }
      logger.error({ nodeRunId, message }, "Node failed and workflow marked FAILED");
    } catch (err) {
      logger.error({ err, nodeRunId }, "failNode: DB update failed");
    }
  }

  private async finishWorkflowRun(workflowRunId: string, output: object) {
    await prisma.workflowRun.update({
      where: { id: workflowRunId },
      data: { status: WorkflowRunStatus.SUCCEEDED, finishedAt: new Date(), output }
    });
    logger.info({ workflowRunId }, "Workflow run finished SUCCEEDED");
  }
}

export const engine = new Engine();
