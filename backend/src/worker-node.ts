// src/worker-node.ts
import dotenv from "dotenv";
import { createWorker } from "./queue/bull.config";
import { engine } from "./execution/engine";
import { logger } from "./lib/logger";

dotenv.config();

const processor = async (job: any) => {
  const nodeRunId: string = job.data?.nodeRunId;
  if (!nodeRunId) throw new Error("Missing nodeRunId");
  logger.info({ nodeRunId }, "node-worker processing");
  await engine.executeNodeRun(nodeRunId);
};

const worker = createWorker(processor);

// optional events
worker.on("completed", (job) => logger.info({ jobId: job.id }, "node job completed"));
worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "node job failed"));
