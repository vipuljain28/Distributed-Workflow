// src/modules/workflow/approval.controller.ts
import { Request, Response } from "express";
import { prisma } from "../../db/client";
import { nodeQueue } from "../../queue/bull.config";
import { NodeRunStatus, WorkflowRunStatus } from "@prisma/client";

export const getPendingApprovals = async (req: Request, res: Response) => {
  try {
    const runs = await prisma.workflowRun.findMany({
      where: { status: WorkflowRunStatus.WAITING_APPROVAL },
      include: {
        workflow: { select: { id: true, name: true } },
        nodeRuns: {
          where: { status: NodeRunStatus.SUCCESS },
          orderBy: { finishedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ pendingCount: runs.length, runs });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const approveRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const { editedTitle, editedCaption, editedTags } = req.body || {};

    const run = await prisma.workflowRun.findUnique({
      where: { id: runId },
      include: {
        workflow: {
          include: {
            nodes: true,
            edges: true,
          },
        },
        nodeRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { node: true },
        },
      },
    });

    if (!run) {
      return res.status(404).json({ message: "Workflow run not found" });
    }

    if (run.status !== WorkflowRunStatus.WAITING_APPROVAL) {
      return res.status(400).json({ message: `Run is in status '${run.status}', not 'WAITING_APPROVAL'` });
    }

    // Find the approval gate node
    const approvalNode = run.workflow.nodes.find((n) => n.type === "APPROVAL_GATE") || run.nodeRuns[0]?.node;
    if (!approvalNode) {
      return res.status(400).json({ message: "No APPROVAL_GATE node found in workflow" });
    }

    // Merge human edits into payload
    const currentOutput = (run.output as Record<string, any>) || {};
    const mergedOutput = {
      ...currentOutput,
      title: editedTitle || currentOutput.title,
      caption: editedCaption || currentOutput.caption,
      tags: editedTags || currentOutput.tags,
      approvedAt: new Date().toISOString(),
      approvedBy: (req as any).user?.email || "master-admin",
    };

    // Update workflow run status back to RUNNING
    await prisma.workflowRun.update({
      where: { id: run.id },
      data: {
        status: WorkflowRunStatus.RUNNING,
        output: mergedOutput,
      },
    });

    // Enqueue outgoing edges from APPROVAL_GATE
    const outgoingEdges = run.workflow.edges.filter((e) => e.fromNodeId === approvalNode.id);
    for (const edge of outgoingEdges) {
      const nextNodeRun = await prisma.nodeRun.create({
        data: {
          workflowRunId: run.id,
          nodeId: edge.toNodeId,
          status: NodeRunStatus.PENDING,
          input: mergedOutput,
        },
      });

      await nodeQueue.add(
        "execute",
        { nodeRunId: nextNodeRun.id },
        { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
      );
    }

    return res.json({
      message: "Workflow run approved and resumed",
      runId: run.id,
      resumedEdgeCount: outgoingEdges.length,
      payload: mergedOutput,
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const rejectRun = async (req: Request, res: Response) => {
  try {
    const { runId } = req.params;
    const { reason } = req.body || {};

    const run = await prisma.workflowRun.findUnique({ where: { id: runId } });
    if (!run) return res.status(404).json({ message: "Run not found" });

    await prisma.workflowRun.update({
      where: { id: runId },
      data: {
        status: WorkflowRunStatus.CANCELLED,
        finishedAt: new Date(),
        output: {
          ...(run.output as any),
          rejectionReason: reason || "Rejected by admin reviewer",
        },
      },
    });

    return res.json({ message: "Workflow run rejected and canceled", runId });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
