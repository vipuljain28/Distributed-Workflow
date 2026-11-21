// src/modules/actions/action-registry.ts
import axios from "axios";
import { logger } from "../../lib/logger";

/**
 * Action handlers return a plain object to be merged into context.
 * Add new handlers here.
 */
export const actionRegistry: Record<string, (context: any, config: any) => Promise<any>> = {
  // HTTP wrapper action (alternative to HTTP node)
  http_request: async (context, config) => {
    const method = (config.method || "GET").toUpperCase();
    const url = config.url;
    const payload = config.body ?? context;
    const headers = config.headers ?? {};
    const res = await axios.request({ method, url, data: payload, headers, timeout: 15000 });
    return { http_response: res.data };
  },

  // Simulated story generation (MVP stub)
  generate_story: async (context, config) => {
    const prompt = config.prompt || "Write a short Hindi story about courage.";
    const generated = {
      title: "Simulated Story",
      story: `Generated story for prompt: ${prompt}`,
      quality: "high"
    };
    logger.info({ generated }, "generate_story produced output");
    return { story: generated };
  },

  // Post to Slack via webhook
  post_to_slack: async (context, config) => {
    const webhookUrl = config.webhookUrl;
    const message = config.message ?? JSON.stringify(context);
    await axios.post(webhookUrl, { text: message });
    return { slack_sent: true };
  },

  // Write a row to Google Sheet via NoCodeAPI / Sheety
  write_sheet: async (context, config) => {
    const url = config.sheetUrl;
    const payload = config.row ?? {};
    await axios.post(url, payload);
    return { sheet_row_added: true };
  }
};
