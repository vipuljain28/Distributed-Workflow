// src/queue/bull.config.ts
import { Queue, Worker, QueueEvents  } from "bullmq";
import IORedis from "ioredis";
import config from "../config";

export const connection = new IORedis(config.redisUrl,{
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

console.log("bullPrefix URL:", config.bullPrefix);
export const workflowQueue = new Queue("workflow_run", { connection, prefix: config.bullPrefix });
export const workflowQueueEvents  = new QueueEvents("workflow_run", { connection, prefix: config.bullPrefix });

// src/queue/bull.config.ts

export function createWorker(processor: (job: any) => Promise<void>) {
  console.log("Node Worker started...");
  return new Worker(
    "node_execute",          // ✅ CORRECT QUEUE FOR NODE EXECUTION
    async job => {
      await processor(job);
    },
    { connection, prefix: config.bullPrefix }
  );
}

// Optional event logging
workflowQueueEvents.on("completed", ({ jobId }) => {
  console.log(`Job ${jobId} completed`);
});

workflowQueueEvents.on("failed", ({ jobId, failedReason }) => {
  console.error(`Job ${jobId} failed: ${failedReason}`);
});
export const nodeQueue  = new Queue("node_execute", {
  connection,
  prefix: config.bullPrefix
});
export const nodeQueueEvents = new QueueEvents("node_execute", {
  connection,
  prefix: config.bullPrefix
});