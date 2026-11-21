// src/execution/nodes/slack.node.ts
import axios from "axios";
import { NodeExecutionInput, NodeExecutionResult } from "../types";

interface SlackConfig {
  webhookUrl?: string;    
  token?: string;         // Bot token for advanced mode
  channel?: string;
  message?: string;
  blocks?: any[];
  threadTs?: string;
}

export class SlackNode {
  constructor(private config: SlackConfig = {}) {}

  async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    try {
      //  MODE 1: Incoming Webhook
      if (this.config.webhookUrl) {
        await axios.post(this.config.webhookUrl,
          { text: this.config.message ?? JSON.stringify(input) },
          { timeout: 8000 }
        );

        return { success: true, output: { sent: true, mode: "webhook" } };
      }

      //  MODE 2: Bot Token (Chat.postMessage)
      if (this.config.token && this.config.channel) {
        const payload: any = {
          channel: this.config.channel,
          text: this.config.message ?? "Workflow message",
          blocks: this.config.blocks ?? undefined,
          thread_ts: this.config.threadTs ?? undefined
        };

        const resp = await axios.post(
          "https://slack.com/api/chat.postMessage",
          payload,
          {
            headers: { Authorization: `Bearer ${this.config.token}` },
            timeout: 8000
          }
        );

        if (!resp.data.ok) {
          return { success: false, errorMessage: resp.data.error };
        }

        return { success: true, output: resp.data };
      }

      return { success: false, errorMessage: "Slack config incomplete" };
    } catch (err: any) {
      return { success: false, errorMessage: err.message };
    }
  }
}
