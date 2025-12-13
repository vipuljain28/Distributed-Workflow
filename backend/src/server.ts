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

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors(
  {
    origin: "http://localhost:5173",
    Credential: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTOIN"],
    allowedHeaders: ['Content-type', "Authorization"]
  }
));
app.use("/health", healthRoute);

app.use("/auth", authRoutes);
app.use("/workflow", workflowRoutes);

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

const port = process.env.PORT || 4000;
app.listen(port, async () => {
  logger.info(`Server started on ${port}`);
  try {
    await prisma.$connect();
    logger.info("Connected to DB");
  } catch (err) {
    logger.error("DB connection failed", err);
  }
});
export default app;