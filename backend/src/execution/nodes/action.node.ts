// src/execution/nodes/action.node.ts
import { NodeExecutionResult } from "../types";
import { actionRegistry } from "../../modules/actions/action-registry"; // if exists; fallback handled

export class ActionNode {
  private config: any;
  constructor(config: any) {
    this.config = config ?? {};
  }

  async execute(input: any): Promise<NodeExecutionResult> {
    try {
      if (this.config.action && actionRegistry && typeof actionRegistry[this.config.action] === "function") {
        const out = await actionRegistry[this.config.action](input, this.config);
        return { success: true, output: out ?? {} };
      }
    } catch (err: any) {
      return { success: false, errorMessage: String(err?.message ?? err) };
    }

    // fallback: pass-through / transforms not implemented here
    return { success: true, output: input ?? {} };
  }
}
