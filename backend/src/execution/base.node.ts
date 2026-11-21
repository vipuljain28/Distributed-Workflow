// src/execution/base.node.ts
export type NodeInput = Record<string, any>;
export type NodeOutput = Record<string, any>;

export abstract class BaseNode {
  id: string;
  type: string;
  config: any;

  constructor(id: string, type: string, config: any) {
    this.id = id;
    this.type = type;
    this.config = config ?? {};
  }

  /** execute node with input context, return output object */
  abstract execute(input: NodeInput): Promise<NodeOutput>;
}
