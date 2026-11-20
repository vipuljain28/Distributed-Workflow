import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { prisma } from "./db/client";
import { logger } from "./lib/logger";
import healthRoute from "./routes/health";
import authRoutes from "./routes/auth.routes";
import workflowRoutes from "./routes/workflow.routes";
import nodeRoutes from "./routes/node.routes";
import edgeRoutes from "./routes/edge.routes";
import conditionRoutes from "./routes/condition.routes";
import structureRoutes from "./routes/structure.routes";
import runRoutes from "./routes/run.routes";
import scheduleRoutes from "./routes/schedule.routes";
import runStatusRoutes from "./routes/runStatus.routes";
import approvalRoutes from "./routes/approval.routes";
import path from "path";

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors(
  {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', "Authorization"]
  }
));
app.use("/health", healthRoute);
app.use("/media", express.static(path.join(process.cwd(), "temp_renders")));

app.use("/auth", authRoutes);
app.use("/workflow", workflowRoutes);
app.use("/approvals", approvalRoutes);

// Mount nested routes that need workflowId param
// nodes: POST /workflow/:workflowId/nodes
app.use("/workflow/:workflowId/nodes", nodeRoutes);

// edges: POST /workflow/:workflowId/nodes/:nodeId/edges
app.use("/workflow/:workflowId/nodes", edgeRoutes);

// conditions: POST /workflow/:workflowId/conditions
app.use("/workflow/:workflowId/conditions", conditionRoutes);

// structure: GET /workflow/:workflowId/structure
app.use("/workflow/:workflowId", structureRoutes);

// run: POST /workflow/:workflowId/run
app.use("/workflow/:workflowId/run", runRoutes);
app.use("/workflow/:workflowId/schedule", scheduleRoutes);
app.use("/workflowRun", runStatusRoutes);

// Static frontend serving if built
const frontendDist = path.join(process.cwd(), "../frontend/dist");
app.use(express.static(frontendDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/workflow") || req.path.startsWith("/auth") || req.path.startsWith("/approvals") || req.path.startsWith("/health")) {
    return next();
  }
  const indexPath = path.join(frontendDist, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

const port = process.env.PORT || 4000;
app.listen(port, async () => {
  logger.info(`Server started on ${port}`);
  try {
    await prisma.$connect();
    logger.info("Connected to DB");

    // Start in-process BullMQ worker if enabled (ensures 100% free tier compatibility on Render)
    if (process.env.RUN_WORKER !== "false") {
      logger.info("Initializing background execution workers...");
      import("./worker");
    }
  } catch (err: any) {
    logger.error(err, "DB connection failed");
  }
});
export default app;