import { Request, Response } from "express";
import { prisma } from "../../db/client";

/**
 * Returns nodes, edges, conditions in one shape for UI consumption
 */
export const getStructure = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const user = (req as any).user;

    const wf = await prisma.workflow.findUnique({ where: { id: workflowId }});
    if (!wf) return res.status(404).json({ message: "Workflow not found" });
    // allow owner or admin or viewer if public (for now enforce owner/admin)
    if (wf.ownerId !== user.id && (user.role !== "ADMIN" && user.role !== "CREATOR")) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const [nodes, edges, conditions] = await Promise.all([
      prisma.node.findMany({ where: { workflowId } }),
      prisma.edge.findMany({ where: { workflowId } }),
      prisma.condition.findMany({ where: { workflowId } })
    ]);

    return res.json({ nodes, edges, conditions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};
