// src/modules/workflows/schedule.controller.ts
import { Request, Response } from "express";
import { prisma } from "../../db/client";
import { workflowQueue } from "../../queue/bull.config";

export async function scheduleWorkflow(req: Request, res: Response) {
  try {
    const { workflowId } = req.params;
    const { cron, input } = req.body; // e.g. "0 9 * * *" (every day at 9am)

    if (!cron || typeof cron !== "string") {
      return res.status(400).json({ message: "cron is required (string)" });
    }

    const wf = await prisma.workflow.findUnique({ where: { id: workflowId } });
    if (!wf) return res.status(404).json({ message: "Workflow not found" });

    // Optional: check owner vs current user from req.user

    const job = await workflowQueue.add(
      "run",
      {
        workflowId,
        input: input ?? {},
      },
      {
        // TS types may not include 'cron' on RepeatOptions depending on Bull/BullMQ version; cast to any
        repeat: { cron } as any, // BullMQ cron pattern
      }
    );

    return res.json({
      message: "Scheduled workflow",
      workflowId,
      cron,
      bullJobName: job.name,
      bullJobId: job.id,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: "Failed to schedule workflow", error: String(err.message ?? err) });
  }
}
