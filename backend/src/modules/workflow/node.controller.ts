import { Request, Response } from "express";
import { prisma } from "../../db/client";

/**
 * Create a node inside a workflow
 * Body: { name, type, config?, position? }
 */
export const createNode = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const user = (req as any).user;
    const { name, type, config, position } = req.body;

    // verify ownership or admin
    const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!wf) return res.status(404).json({ message: "Workflow not found" });
    if (wf.ownerId !== user.id && (user.role !== "ADMIN" && user.role !== "CREATOR")) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const node = await prisma.node.create({
      data: {
        workflowId,
        name,
        type,
        config,
        position
      }
    });

    return res.json({ message: "Node created", node });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

export const deleteNode = async (req: Request, res: Response) => {
  try {
    const { nodeId } = req.params;
    const user = (req as any).user;

    const node = await prisma.node.findUnique({
      where: { id: nodeId },
      include: { workflow: true },
    });

    if (!node) {
      return res.status(404).json({ message: "Node not found" });
    }

    if (node.workflow.ownerId !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Delete related edges
    await prisma.edge.deleteMany({
      where: {
        OR: [{ fromNodeId: nodeId }, { toNodeId: nodeId }],
      },
    });

    // Delete node runs
    await prisma.nodeRun.deleteMany({ where: { nodeId } });

    // Delete node
    await prisma.node.delete({ where: { id: nodeId } });

    return res.json({ message: "Node deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
