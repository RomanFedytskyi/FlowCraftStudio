import type { DiagramNodeType } from '../types/diagram';

export type NodeCapabilities = {
  resizable?: boolean;
  rotatable?: boolean;
  connectable?: boolean;
  toolbar?: boolean;
};

/**
 * Capabilities are defaults per node type. Node data can override via
 * `data.capabilities`.
 */
export const NODE_CAPABILITIES: Record<DiagramNodeType, NodeCapabilities> = {
  start: { connectable: true, toolbar: true },
  end: { connectable: true, toolbar: true },
  process: { connectable: true, resizable: true, toolbar: true },
  decision: { connectable: true, resizable: true, toolbar: true },
  'input-output': { connectable: true, resizable: true, toolbar: true },
  database: { connectable: true, resizable: true, toolbar: true },
  document: { connectable: true, resizable: true, toolbar: true },
  subprocess: { connectable: true, resizable: true, toolbar: true },
  connector: { connectable: true, toolbar: true },
  rectangle: { connectable: true, resizable: true, toolbar: true },
  'rounded-rectangle': { connectable: true, resizable: true, toolbar: true },
  circle: { connectable: true, resizable: true, toolbar: true },
  ellipse: { connectable: true, resizable: true, toolbar: true },
  diamond: { connectable: true, resizable: true, toolbar: true },
  triangle: { connectable: true, resizable: true, toolbar: true },
  hexagon: { connectable: true, resizable: true, toolbar: true },
  line: { connectable: false, toolbar: true },
  arrow: { connectable: true, toolbar: true },
  frame: { connectable: true, resizable: true, toolbar: true },
  text: { connectable: false, resizable: true, toolbar: true },
  title: { connectable: false, resizable: true, toolbar: true },
  heading: { connectable: false, resizable: true, toolbar: true },
  paragraph: { connectable: false, resizable: true, toolbar: true },
  label: { connectable: false, resizable: true, toolbar: true },
  caption: { connectable: false, resizable: true, toolbar: true },
  callout: { connectable: false, resizable: true, toolbar: true },
  note: { connectable: true, resizable: true, toolbar: true },
  'sticky-note': { connectable: true, resizable: true, toolbar: true },
  comment: { connectable: true, resizable: true, toolbar: true },
  warning: { connectable: true, resizable: true, toolbar: true },
  info: { connectable: true, resizable: true, toolbar: true },
  checklist: { connectable: true, resizable: true, toolbar: true },
  icon: { connectable: false, toolbar: true },
  group: { connectable: true, resizable: true, toolbar: true },

  // Example-inspired node types
  'custom-input': { connectable: true, resizable: true, toolbar: true },
  counter: { connectable: true, resizable: true, toolbar: true },
  'circle-compact': { connectable: true, resizable: true, toolbar: true },
  'svg-shape': { connectable: true, resizable: true, toolbar: true },
  architecture: { connectable: true, resizable: true, toolbar: true },
  toolbar: { connectable: true, resizable: true, toolbar: true },
  'shape-circle': { connectable: true, resizable: true, toolbar: true },
  'shape-rectangle': { connectable: true, resizable: true, toolbar: true },
  'shape-rounded-rectangle': {
    connectable: true,
    resizable: true,
    toolbar: true,
  },
  'shape-diamond': { connectable: true, resizable: true, toolbar: true },
  'shape-hexagon': { connectable: true, resizable: true, toolbar: true },
  'shape-triangle': { connectable: true, resizable: true, toolbar: true },
  'shape-parallelogram': { connectable: true, resizable: true, toolbar: true },
  'shape-cylinder': { connectable: true, resizable: true, toolbar: true },
  'shape-arrow-rectangle': {
    connectable: true,
    resizable: true,
    toolbar: true,
  },
  'shape-plus': { connectable: false, resizable: true, toolbar: true },
  'shape-cloud': { connectable: true, resizable: true, toolbar: true },
  helper: { connectable: false, resizable: true, toolbar: true },
};

export function resolveNodeCapabilities(
  nodeType: DiagramNodeType,
  override?: NodeCapabilities,
): NodeCapabilities {
  return { ...NODE_CAPABILITIES[nodeType], ...override };
}
