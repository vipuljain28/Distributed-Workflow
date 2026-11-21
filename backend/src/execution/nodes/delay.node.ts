// src/execution/nodes/delay.node.ts
import { NodeExecutionResult } from "../types";

export class DelayNode {
  private config: any;
  constructor(config: any) { this.config = config ?? {}; }

  async execute(input: any): Promise<NodeExecutionResult> {
    const ms = typeof this.config.ms === "number" ? this.config.ms : (this.config.seconds ? this.config.seconds * 1000 : 1000);
    await new Promise<void>((res) => setTimeout(res, ms));
    return { success: true, output: { delayedMs: ms } };
  }
}
