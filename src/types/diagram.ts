import type { Edge, EdgeMarkerType, Node } from '@xyflow/react';

export type DiagramNodeType =
  | 'start'
  | 'end'
  | 'process'
  | 'decision'
  | 'input-output'
  | 'database'
  | 'document'
  | 'subprocess'
  | 'connector'
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'hexagon'
  | 'line'
  | 'arrow'
  | 'frame'
  | 'text'
  | 'title'
  | 'heading'
  | 'paragraph'
  | 'label'
  | 'caption'
  | 'callout'
  | 'note'
  | 'sticky-note'
  | 'comment'
  | 'warning'
  | 'info'
  | 'checklist'
  | 'icon'
  | 'group'
  | 'custom-input'
  | 'counter'
  | 'circle-compact'
  | 'svg-shape'
  | 'architecture'
  | 'toolbar';

export type DiagramNodeKind =
  | 'flow'
  | 'shape'
  | 'text'
  | 'note'
  | 'icon'
  | 'group';

export type DiagramEdgeType =
  | 'default'
  | 'smoothstep'
  | 'step'
  | 'straight'
  | 'bezier'
  | 'floating';

export type DiagramEdgeLineStyle = 'solid' | 'dashed' | 'dotted';
export type DiagramEdgeMarkerKind = 'none' | 'arrow' | 'circle' | 'diamond';
export type DiagramEdgeMarkerPosition = 'none' | 'start' | 'end' | 'both';

export interface DiagramComment {
  id: string;
  message: string;
  createdAt: string;
}

export interface DiagramNodeStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  textColor?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export type DiagramViewport = {
  x: number;
  y: number;
  zoom: number;
};

export type DiagramNodeData = {
  label: string;
  type: DiagramNodeType;
  /** When set, shown in the node badge instead of the built-in type label. */
  badgeLabel?: string;
  subtitle?: string;
  kind?: DiagramNodeKind;
  icon?: string;
  value?: string | number;
  status?: 'default' | 'success' | 'warning' | 'danger';
  tags?: string[];
  style?: DiagramNodeStyle;
  capabilities?: {
    resizable?: boolean;
    rotatable?: boolean;
    connectable?: boolean;
    toolbar?: boolean;
  };
  comments?: DiagramComment[];
  needsReview?: boolean;
  [key: string]: unknown;
};

export type DiagramNode = Node<DiagramNodeData> & {
  groupId?: string;
};

export type DiagramEdgeData = {
  label?: string;
  edgeType?: DiagramEdgeType;
  color?: string;
  width?: number;
  lineStyle?: DiagramEdgeLineStyle;
  markerKind?: DiagramEdgeMarkerKind;
  markerPosition?: DiagramEdgeMarkerPosition;
  /** When true, the edge path uses the built-in flow animation. */
  animated?: boolean;
  /** Edge label text color (hex or preset token id). */
  labelColor?: string;
  labelFontSize?: number;
  /** Label pill background (hex or preset); omit or `transparent` for no fill. */
  labelBackgroundColor?: string;
  /** Border around the label pill (hex or preset). */
  labelBorderColor?: string;
};

export type DiagramEdge = Edge<DiagramEdgeData> & {
  markerStart?: EdgeMarkerType;
  markerEnd?: EdgeMarkerType;
};

export interface DiagramVersionSnapshot {
  id: string;
  createdAt: string;
  summary: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export type Diagram = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport?: DiagramViewport;
  versions?: DiagramVersionSnapshot[];
  createdAt: string;
  updatedAt: string;
};

export type DiagramInput = Pick<
  Diagram,
  'name' | 'description' | 'tags' | 'nodes' | 'edges' | 'viewport'
>;

export type DiagramStorageEnvelopeV1 = {
  version: 'v1';
  diagrams: Diagram[];
};
