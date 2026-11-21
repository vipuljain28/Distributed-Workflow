// src/execution/nodes/condition.node.ts
import { NodeExecutionResult } from "../types";
import { evalExpression } from "../expression-evaluator";

export class ConditionNode {
  private config: any;
  constructor(config: any) { this.config = config ?? {}; }

  async execute(input: any): Promise<NodeExecutionResult> {
    const expr = this.config.expression ?? this.config.expr;
    if (!expr) return { success: false, errorMessage: "Condition node missing expression" };

    try {
      const result = await evalExpression(expr, input ?? {});
      // return boolean result in output
      return { success: true, output: { condition: Boolean(result) } };
    } catch (err: any) {
      return { success: false, errorMessage: String(err?.message ?? err) };
    }
  }
}
