// src/execution/types.ts
export type JsonObject = { [key: string]: any };

export interface NodeConfig {
  // shape is flexible; each node reads what it needs
  [key: string]: any;
}

export interface NodeExecutionInput {
  // the context passed into node; keep as JSON object for flexibility
  [key: string]: any;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: JsonObject | null;
  errorMessage?: string | null;
}
