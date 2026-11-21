import { prisma } from "../../db/client";
import { Request, Response } from "express";

export const createWorkflow = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { name, description } = req.body;

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        ownerId: user.id
      }
    });

    return res.json({ message: "Workflow created", workflow });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

export const listWorkflow = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let whereClause: any = {};

    // ADMIN → see all workflows
    if (user.role !== "ADMIN") {
      // CREATOR / VIEWER → only own workflows
      whereClause.ownerId = user.id;
    }
    const workflows = await prisma.workflow.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        owner: {
          select: { id: true, email: true, role: true },
        },
      },
    });
    res.json(workflows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list workflows" });
  }

}
export const getWorkflowById = async (req: Request, res: Response) => {
  const { workflowId } = req.params;

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    include: {
      nodes: true,
      edges: true,
      conditions: true,
    },
  });

  if (!workflow) {
    return res.status(404).json({ message: "Workflow not found" });
  }

  res.json(workflow);
};

export const deleteWorkflow = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const user = (req as any).user;

    const wf = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!wf) {
      return res.status(404).json({ message: "Workflow not found" });
    }

    if (wf.ownerId !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Delete in safe order edge condtion node run
    await prisma.edge.deleteMany({ where: { workflowId } });
    await prisma.condition.deleteMany({ where: { workflowId } });
    await prisma.nodeRun.deleteMany({
      where: { workflowRun: { workflowId } },
    });
    await prisma.workflowRun.deleteMany({ where: { workflowId } });
    await prisma.node.deleteMany({ where: { workflowId } });

    await prisma.workflow.delete({ where: { id: workflowId } });

    return res.json({ message: "Workflow deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};

