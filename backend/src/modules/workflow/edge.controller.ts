import { Request, Response } from "express";
import { prisma } from "../../db/client";

/**
 * Create an edge between nodes in workflow
 * Body: { toNodeId, conditionId? }
 * fromNodeId is from the URL param :nodeId
 */
export const createEdge = async (req: Request, res: Response) => {
  try {
    const { workflowId, nodeId } = req.params;
    const user = (req as any).user;
    const { toNodeId, conditionId } = req.body;

    const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!wf) return res.status(404).json({ message: "Workflow not found" });
    if (wf.ownerId !== user.id && (user.role !== "ADMIN" && user.role !== "CREATOR")) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // validate nodes
    const fromNode = await prisma.node.findUnique({ where: { id: nodeId } });
    const toNode = await prisma.node.findUnique({ where: { id: toNodeId } });
    if (!fromNode || !toNode) return res.status(404).json({ message: "Node(s) not found" });

    const edge = await prisma.edge.create({
      data: {
        workflowId,
        fromNodeId: nodeId,
        toNodeId,
        conditionId
      }
    });

    return res.json({ message: "Edge created", edge });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};

export const deleteEdge = async (req: Request, res: Response) => {
  try {
    const { edgeId } = req.params;
    const user = (req as any).user;

    const edge = await prisma.edge.findUnique({
      where: { id: edgeId },
      include: { workflow: true },
    });

    if (!edge) {
      return res.status(404).json({ message: "Edge not found" });
    }

    if (edge.workflow.ownerId !== user.id && user.role !== "ADMIN") {
      return res.status(403).json({ message: "Not allowed" });
    }

    await prisma.edge.delete({ where: { id: edgeId } });

    return res.json({ message: "Edge deleted" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
};
