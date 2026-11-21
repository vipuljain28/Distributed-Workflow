// src/execution/nodes/approval-gate.node.ts
import { NodeExecutionInput, NodeExecutionResult } from "../types";

export class ApprovalGateNode {
  private config: any;

  constructor(config: any) {
    this.config = config || {};
  }

  async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    try {
      // Gather upstream payload (video, slides, title, captions, tags)
      const reviewPayload = {
        title: input.title || input.concept || "Architectural Review Video",
        caption: input.caption || input.description || "Here is a breakdown of the architectural flow.",
        tags: input.tags || ["systemdesign", "softwarearchitecture", "backend", "scalability"],
        video: input.video || input.videoUrl || null,
        slides: input.slides || [],
        readyForReviewAt: new Date().toISOString(),
        status: "WAITING_APPROVAL",
      };

      console.info("[APPROVAL_GATE] Pausing DAG execution for human review.", {
        title: reviewPayload.title,
        slidesCount: reviewPayload.slides?.length || 0,
      });

      return {
        success: true,
        output: reviewPayload,
      };
    } catch (err: any) {
      return {
        success: false,
        errorMessage: `ApprovalGateNode failed: ${err?.message || err}`,
      };
    }
  }
}
