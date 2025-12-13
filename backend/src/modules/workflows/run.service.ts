// src/modules/workflows/run.service.ts
import { prisma } from "../../db/client";
import { workflowQueue } from "../../queue/bull.config";
import { v4 as uuidv4 } from "uuid";

export class RunService {
  async startRun(workflowId: string, input?: any, userId?: string) {
    const wf = await prisma.workflow.findUnique({ where: { id: workflowId },
    include: {
      nodes: true,
      edges: true,
    }, });
    
    if (!wf) throw new Error("Workflow not found");
      // --- VALIDATIONS ---
  const hasStart = wf.nodes.some((n) => n.type === "START");
  if (!hasStart) throw new Error("Workflow missing START node");

  const hasEnd = wf.nodes.some((n) => n.type === "END");
  if (!hasEnd) throw new Error("Workflow missing END node");
  // Optionally: ensure graph connectivity
  if (wf.nodes.length > 1 && wf.edges.length === 0) {
    throw new Error("Workflow has multiple nodes but no edges");
  }
    // create a WorkflowRun entry 
    const run = await prisma.workflowRun.create({
      data: {
        workflowId,
        status: "PENDING",
        input
      }
    });

    // enqueue job to process it
   let job = await workflowQueue.add(
      "run",
      { workflowRunId: run.id },
      { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
    );
   
    return run;
  }
}
