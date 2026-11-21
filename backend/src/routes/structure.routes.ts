import { Router } from "express";
import { getStructure } from "../modules/workflow/structure.controller";
import { isAuthenticated, hasRole } from "../middleware/auth";

const router = Router({ mergeParams: true });

// GET /workflow/:workflowId/structure
router.get("/structure", isAuthenticated, hasRole("ADMIN", "CREATOR", "VIEWER"), getStructure);

export default router;
