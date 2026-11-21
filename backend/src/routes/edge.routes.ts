import { Router } from "express";
import { createEdge, deleteEdge } from "../modules/workflow/edge.controller";
import { isAuthenticated, hasRole } from "../middleware/auth";

const router = Router({ mergeParams: true });

// create edge from nodeId: POST /workflow/:workflowId/nodes/:nodeId/edges
router.post("/:nodeId/edges", isAuthenticated, hasRole("ADMIN", "CREATOR"), createEdge);

// delete edge: DELETE /workflow/:workflowId/nodes/:nodeId/edges/:edgeId
router.delete("/:nodeId/edges/:edgeId", isAuthenticated, hasRole("ADMIN", "CREATOR"), deleteEdge);

export default router;
