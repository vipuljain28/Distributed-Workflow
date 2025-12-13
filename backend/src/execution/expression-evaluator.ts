// src/execution/expression-evaluator.ts
import Jexl from "jexl";

/**
 * Lightweight expression evaluator wrapper using Jexl.
 * Returns evaluated value or throws descriptive error.
 */

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Evaluates a Jexl expression against a given context object.
 * Returns the evaluated value (can be any type) or throws an error if evaluation fails.
 * @param {string} expression - The Jexl expression to evaluate.
 * @param {any} [context] - The context object to use for evaluation. Optional.
 * @returns {Promise<any>} - The evaluated value or a rejected promise with an error.
 * @throws {Error} - If evaluation fails.
 */
/*******  5151bd3a-9e12-41f5-a39d-b9d3697e81a7  *******/export async function evalExpression(expression: string, context: any): Promise<any> {
  if (!expression || typeof expression !== "string") return false;
  try {
    const result = await Jexl.eval(expression, context || {});
    return result;
  } catch (err: any) {
    throw new Error(`Expression evaluation failed: ${String(err.message ?? err)}`);
  }
}

/**
 * Evaluate transforms: map of key -> expression string.
 * Returns object with evaluated values.
 */
export async function evalTransforms(transforms: Record<string, string> | undefined, context: any) {
  const out: Record<string, any> = {};
  if (!transforms) return out;
  for (const key of Object.keys(transforms)) {
    try {
      out[key] = await evalExpression(transforms[key], context);
    } catch (err) {
      out[key] = null;
    }
  }
  return out;
}
