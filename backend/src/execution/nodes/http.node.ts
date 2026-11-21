// src/execution/nodes/http.node.ts
import axios, { Method ,AxiosRequestConfig } from "axios";
import { NodeExecutionInput,NodeExecutionResult } from "../types";

interface HttpNodeConfig {
  url: string;
  method?: Method;
  headers?: Record<string, string>;
  body?: any;
  timeoutMs?: number;
}
export class HttpNode {
  private config: any;
  constructor(config: any) {
    this.config = {
      url: config.url,
      method: (config.method || "GET") as Method,
      headers: config.headers || {},
      body: config.body,
      timeoutMs: config.timeoutMs || 10000, // default 10s
    };
  }

async execute(input: NodeExecutionInput): Promise<NodeExecutionResult> {
    try {
      const response = await axios.request({
        url: this.config.url,
        method: this.config.method,
        headers: this.config.headers,
        data: this.config.body ?? input,
        timeout: this.config.timeoutMs,
      });

      return {
        success: true,
        output: {
          status: response.status,
          data: response.data,
          headers: response.headers,
        },
      };
    } catch (err: any) {
      const msg = err?.message || "HTTP request failed";
      return {
        success: false,
        errorMessage: msg,
      };
    }
  }
}
