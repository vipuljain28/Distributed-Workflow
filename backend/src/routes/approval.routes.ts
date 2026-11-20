// src/routes/approval.routes.ts
import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  getPendingApprovals,
  approveRun,
  rejectRun,
} from "../modules/workflow/approval.controller";

const router = Router();

// GET /approvals/pending
router.get("/pending", isAuthenticated, getPendingApprovals);

// POST /approvals/:runId/approve
router.post("/:runId/approve", isAuthenticated, approveRun);

// POST /approvals/:runId/reject
router.post("/:runId/reject", isAuthenticated, rejectRun);

export default router;
