import { getIconComponent } from '@configs/iconLibrary.config';
import {
  NODE_TYPE_DEFINITIONS,
  NODE_TYPE_MAP,
  type NodeTypeDefinition,
} from '@configs/nodeTypes.config';

import type { DiagramNodeType } from '../types/diagram';

export type DiagramNodeDefinition = NodeTypeDefinition;

export const DIAGRAM_NODE_DEFINITIONS: DiagramNodeDefinition[] =
  NODE_TYPE_DEFINITIONS;

export function getNodeDefinition(type: DiagramNodeType) {
  return NODE_TYPE_MAP[type] ?? NODE_TYPE_MAP.process;
}

export function getNodeIcon(type: DiagramNodeType, iconName?: string) {
  const definition = getNodeDefinition(type);
  return getIconComponent(iconName ?? definition.iconName);
}
