import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { getWorkflowRunStatus } from "../modules/workflow/workflowRun.controller";

const router = Router();

// GET /workflowRun/:id
router.get("/:id", isAuthenticated, getWorkflowRunStatus);

export default router;
