// src/execution/nodes/webhook-dispatch.node.ts
import { NodeExecutionInput, NodeExecutionResult } from "../types";
import axios from "axios";
import crypto from "crypto";

export interface WebhookDispatchConfig {
  webhookUrl?: string;
  method?: "POST" | "PUT" | "PATCH";
  secret?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export class WebhookDispatchNode {
  private config: WebhookDispatchConfig;

  constructor(config: any) {
    this.config = {
      webhookUrl: config?.webhookUrl,
      method: config?.method || "POST",
      secret: config?.secret,
      headers: config?.headers || {},
      timeoutMs: config?.timeoutMs || 15000,
    };
  }

  async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    try {
      const url = input.webhookUrl || this.config.webhookUrl;
      if (!url) {
        return {
          success: false,
          error: "WebhookDispatchNode: No target webhook URL specified in config or input",
        };
      }

      const payload = {
        event: "WORKFLOW_NODE_COMPLETED",
        timestamp: new Date().toISOString(),
        data: input,
      };

      const payloadStr = JSON.stringify(payload);
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...this.config.headers,
      };

      // Optional HMAC-SHA256 signature for enterprise payload verification
      const secret = input.webhookSecret || this.config.secret;
      if (secret) {
        const signature = crypto.createHmac("sha256", secret).update(payloadStr).digest("hex");
        headers["X-Workflow-Signature"] = `sha256=${signature}`;
      }

      console.log(`[WebhookDispatch] Dispatching payload to ${url}...`);
      const response = await axios({
        method: this.config.method || "POST",
        url,
        data: payload,
        headers,
        timeout: this.config.timeoutMs || 15000,
      });

      return {
        success: true,
        output: {
          dispatched: true,
          targetUrl: url,
          statusCode: response.status,
          responseData: response.data,
        },
      };
    } catch (err: any) {
      console.error("[WebhookDispatch] Error dispatching payload:", err.message);
      return {
        success: false,
        error: err.response?.data || err.message,
      };
    }
  }
}
