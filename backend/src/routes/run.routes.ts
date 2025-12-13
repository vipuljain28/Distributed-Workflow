// src/routes/run.routes.ts
import { Router } from "express";
import { isAuthenticated, hasRole } from "../middleware/auth";
import { RunService } from "../modules/workflows/run.service";
const router = Router({ mergeParams: true });
const svc = new RunService();

// POST /workflow/:workflowId/run
router.post("/", isAuthenticated, hasRole("ADMIN", "CREATOR"), async (req: any, res) => {
  const workflowId = req.params.workflowId;
  const input = req.body;
  try {

    const run = await svc.startRun(workflowId, input, req.user.id);
    res.json(run);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
