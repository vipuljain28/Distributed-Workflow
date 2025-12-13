// src/execution/node-registry.ts
import { ActionNode } from "./nodes/action.node";
import { HttpNode } from "./nodes/http.node";
import { DelayNode } from "./nodes/delay.node";
import { SlackNode } from "./nodes/slack.node";
import { SheetsNode } from "./nodes/sheets.node";
import { ConditionNode } from "./nodes/condition.node";
import { EmailNode } from "./nodes/email.node";

type ExecutorCtor = new (config: any) => { execute: (input: any) => Promise<any> };

class NodeRegistry {
  private map: Record<string, ExecutorCtor> = {
    START: ActionNode,
    ACTION: ActionNode,
    HTTP: HttpNode,
    DELAY: DelayNode,
    SLACK: SlackNode,
    SHEETS: SheetsNode,
    CONDITION: ConditionNode,
    EMAIL: EmailNode,
    END: ActionNode,
  };

  getExecutor(type: string | null | undefined): ExecutorCtor | undefined {
    if (!type) return undefined;
    return this.map[type.toUpperCase()];
  }

  // optional: register custom node at runtime
  register(type: string, ctor: ExecutorCtor) {
    this.map[type.toUpperCase()] = ctor;
  }
}

export const nodeRegistry = new NodeRegistry();
