import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import config from "../config";

const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const nodeQueue = new Queue("node_execute", {
  connection,
  prefix: config.bullPrefix,
});

export const createNodeWorker = (processor:any) =>
  new Worker("node_execute", processor, {
    connection,
    prefix: config.bullPrefix,
  });
