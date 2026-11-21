// src/modules/workflow/template.controller.ts
import { Request, Response } from "express";
import { WORKFLOW_TEMPLATES, instantiateTemplate } from "./template.service";

export async function listTemplates(req: Request, res: Response) {
  try {
    return res.json({
      templates: WORKFLOW_TEMPLATES,
      total: WORKFLOW_TEMPLATES.length,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}

export async function instantiate(req: Request, res: Response) {
  try {
    const { templateId } = req.params;
    const { name } = req.body || {};
    const userId = (req as any).user?.id || (req as any).user?.sub;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const workflow = await instantiateTemplate(templateId, userId, name);
    return res.status(201).json({
      success: true,
      message: `Workflow instantiated successfully from template '${templateId}'`,
      workflow,
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}
