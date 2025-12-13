import { Request, Response } from "express";
import { prisma } from "../../db/client";

/**
 * Create a condition for a workflow
 * Body: { name, type, params (JSON) }
 */
export const createCondition = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const user = (req as any).user;
    const { name, type, params } = req.body;

    const wf = await prisma.workflow.findUnique({ where: { id: workflowId }});
    if (!wf) return res.status(404).json({ message: "Workflow not found" });
    if (wf.ownerId !== user.id && (user.role !== "ADMIN" && user.role !== "CREATOR")) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const condition = await prisma.condition.create({
      data: {
        workflowId,
        name,
        type,
        params
      }
    });

    return res.json({ message: "Condition created", condition });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err });
  }
};
