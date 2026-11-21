// src/routes/template.routes.ts
import { Router } from "express";
import { listTemplates, instantiate } from "../modules/workflow/template.controller";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Public/authenticated template listing
router.get("/", isAuthenticated, listTemplates);

// 1-Click instantiate template
router.post("/:templateId/instantiate", isAuthenticated, instantiate);

export default router;
