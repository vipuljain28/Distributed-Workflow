import { Router } from "express";
import { createCondition } from "../modules/workflow/condition.controller";
import { isAuthenticated, hasRole } from "../middleware/auth";

const router = Router({ mergeParams: true });

// POST /workflow/:workflowId/conditions
router.post("/", isAuthenticated, hasRole("ADMIN", "CREATOR"), createCondition);

export default router;
