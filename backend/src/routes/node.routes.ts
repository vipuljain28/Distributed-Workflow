import { Router } from "express";
import { createNode, deleteNode } from "../modules/workflow/node.controller";
import { isAuthenticated, hasRole } from "../middleware/auth";

const router = Router({ mergeParams: true });

// create node: POST /workflow/:workflowId/nodes
router.post("/", isAuthenticated, hasRole("ADMIN", "CREATOR"), createNode);

// delete node: DELETE /workflow/:workflowId/nodes/:nodeId
router.delete("/:nodeId", isAuthenticated, hasRole("ADMIN", "CREATOR"), deleteNode);

export default router;
