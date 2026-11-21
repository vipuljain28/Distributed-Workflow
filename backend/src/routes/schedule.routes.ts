// src/routes/schedule.routes.ts
import { Router } from "express";
import { scheduleWorkflow } from "../modules/workflows/schedule.controller";
import { isAuthenticated, hasRole } from "../middleware/auth";

const router = Router({ mergeParams: true });

// POST /workflow/:workflowId/schedule
router.post("/", isAuthenticated, hasRole("ADMIN", "CREATOR"), scheduleWorkflow);

export default router;
