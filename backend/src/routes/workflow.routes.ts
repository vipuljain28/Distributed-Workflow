import { Router } from "express";
import { createWorkflow, listWorkflow, getWorkflowById, deleteWorkflow } from "../modules/workflow/workflow.controller";
import { isAuthenticated, hasRole } from "../middleware/auth";

const router = Router();

router.post("/", isAuthenticated, hasRole("ADMIN", "CREATOR"), createWorkflow);
router.get("/", isAuthenticated, hasRole("ADMIN", "CREATOR"), listWorkflow);
router.get("/:workflowId", isAuthenticated, hasRole("ADMIN", "CREATOR"), getWorkflowById);
router.delete("/:workflowId", isAuthenticated, hasRole("ADMIN", "CREATOR"), deleteWorkflow);

export default router;
