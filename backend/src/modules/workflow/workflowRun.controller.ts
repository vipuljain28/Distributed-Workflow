import { Request, Response } from "express";
import { prisma } from "../../db/client";

export const getWorkflowRunStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const run = await prisma.workflowRun.findUnique({
            where: { id },
            include: {
                nodeRuns: {
                    orderBy: { createdAt: "asc" },
                    select: {
                        id: true,
                        nodeId: true,
                        status: true,
                        startedAt: true,
                        finishedAt: true,
                        errorMessage: true,
                    },
                },
            },
        });

        if (!run) {
            return res.status(404).json({ message: "WorkflowRun not found" });
        }

        return res.json({
            id: run.id,
            status: run.status,
            startedAt: run.startedAt,
            finishedAt: run.finishedAt,
            nodeRuns: run.nodeRuns,
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};
