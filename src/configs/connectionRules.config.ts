import type { DiagramNode, DiagramNodeType } from '../types/diagram';
import type { Connection } from '@xyflow/react';

export type ConnectionValidationResult = {
  allowed: boolean;
  reason?: string;
};

export type ConnectionRuleContext = {
  nodesById: Map<string, DiagramNode>;
};

export type ConnectionRule = (args: {
  connection: Connection;
  ctx: ConnectionRuleContext;
}) => ConnectionValidationResult;

export const DEFAULT_CONNECTION_RULES: ConnectionRule[] = [
  ({ connection, ctx }) => {
    if (!connection.source || !connection.target) {
      return { allowed: false, reason: 'Missing endpoints' };
    }

    if (connection.source === connection.target) {
      return { allowed: false, reason: 'Cannot connect node to itself' };
    }

    const source = ctx.nodesById.get(connection.source);
    const target = ctx.nodesById.get(connection.target);

    if (!source || !target) {
      return { allowed: false, reason: 'Unknown node' };
    }

    const sourceType = (source.type ?? source.data.type) as DiagramNodeType;
    const targetType = (target.type ?? target.data.type) as DiagramNodeType;

    if (sourceType === 'end') {
      return { allowed: false, reason: 'End cannot have outgoing edges' };
    }

    if (targetType === 'start') {
      return { allowed: false, reason: 'Start cannot have incoming edges' };
    }

    if (sourceType === 'helper' || targetType === 'helper') {
      return {
        allowed: false,
        reason: 'Annotation helpers cannot connect to flow nodes',
      };
    }

    return { allowed: true };
  },
];

export function validateConnection(
  connection: Connection,
  nodes: DiagramNode[],
  rules: ConnectionRule[] = DEFAULT_CONNECTION_RULES,
): ConnectionValidationResult {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const ctx: ConnectionRuleContext = { nodesById };

  for (const rule of rules) {
    const result = rule({ connection, ctx });
    if (!result.allowed) {
      return result;
    }
  }

  return { allowed: true };
}
