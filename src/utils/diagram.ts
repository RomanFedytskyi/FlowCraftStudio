import {
  MarkerType,
  getNodesBounds,
  getViewportForBounds,
  type EdgeMarkerType,
  type ReactFlowInstance,
  type Rect,
  type XYPosition,
} from '@xyflow/react';

import { DEFAULT_NODE_POSITION_STEP } from '@configs/app';
import {
  getNodeDefinition,
  type DiagramNodeDefinition,
} from '@configs/diagramNodes';

import { createId } from '@utils/id';

import type {
  Diagram,
  DiagramEdge,
  DiagramEdgeData,
  DiagramEdgeLineStyle,
  DiagramEdgeMarkerKind,
  DiagramEdgeMarkerPosition,
  DiagramEdgeType,
  DiagramNode,
  DiagramNodeData,
  DiagramNodeStyle,
  DiagramNodeType,
  DiagramVersionSnapshot,
  DiagramViewport,
} from '../types/diagram';

export const NODE_BACKGROUND_PRESETS = {
  transparent: 'transparent',
  surface: '#FFFFFF',
  'surface-muted': '#F8FAFC',
  'primary-soft': '#DBEAFE',
  'accent-soft': '#EDE9FE',
  'success-soft': '#DCFCE7',
  'warning-soft': '#FEF3C7',
  'danger-soft': '#FEE2E2',
} as const;

export const NODE_BORDER_PRESETS = {
  transparent: 'transparent',
  border: '#CBD5E1',
  primary: '#2563EB',
  accent: '#7C3AED',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export const EDGE_COLOR_PRESETS = {
  'canvas-edge': '#64748B',
  primary: '#2563EB',
  accent: '#7C3AED',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
} as const;

export const EDGE_TYPE_OPTIONS: Array<{
  label: string;
  value: DiagramEdgeType;
}> = [
  { label: 'Smooth', value: 'smoothstep' },
  { label: 'Bezier', value: 'bezier' },
  { label: 'Floating', value: 'floating' },
  { label: 'Straight', value: 'straight' },
  { label: 'Step', value: 'step' },
  { label: 'Default', value: 'default' },
];

export const EDGE_LINE_STYLE_OPTIONS: Array<{
  label: string;
  value: DiagramEdgeLineStyle;
}> = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
];

export const EDGE_MARKER_KIND_OPTIONS: Array<{
  label: string;
  value: DiagramEdgeMarkerKind;
}> = [
  { label: 'None', value: 'none' },
  { label: 'Arrow', value: 'arrow' },
  { label: 'Circle', value: 'circle' },
  { label: 'Diamond', value: 'diamond' },
];

export const EDGE_MARKER_POSITION_OPTIONS: Array<{
  label: string;
  value: DiagramEdgeMarkerPosition;
}> = [
  { label: 'End', value: 'end' },
  { label: 'Start', value: 'start' },
  { label: 'Both', value: 'both' },
  { label: 'None', value: 'none' },
];

export const EDGE_COLOR_OPTIONS: Array<{
  label: string;
  value: string;
  preview: string;
}> = [
  { label: 'Slate', value: 'canvas-edge', preview: '#64748B' },
  { label: 'Blue', value: 'primary', preview: '#2563EB' },
  { label: 'Violet', value: 'accent', preview: '#7C3AED' },
  { label: 'Green', value: 'success', preview: '#16A34A' },
  { label: 'Amber', value: 'warning', preview: '#D97706' },
  { label: 'Red', value: 'danger', preview: '#DC2626' },
];

export const EDGE_WIDTH_OPTIONS = [1, 2, 3, 4, 6];

export const NODE_BACKGROUND_OPTIONS: Array<{
  label: string;
  value: string;
}> = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'Surface', value: 'surface' },
  { label: 'Muted surface', value: 'surface-muted' },
  { label: 'Blue', value: 'primary-soft' },
  { label: 'Violet', value: 'accent-soft' },
  { label: 'Green', value: 'success-soft' },
  { label: 'Amber', value: 'warning-soft' },
  { label: 'Red', value: 'danger-soft' },
];

export const NODE_BORDER_OPTIONS: Array<{
  label: string;
  value: string;
}> = [
  { label: 'Transparent', value: 'transparent' },
  { label: 'Neutral', value: 'border' },
  { label: 'Blue', value: 'primary' },
  { label: 'Violet', value: 'accent' },
  { label: 'Green', value: 'success' },
  { label: 'Amber', value: 'warning' },
  { label: 'Red', value: 'danger' },
];

export const DEFAULT_GROUP_WIDTH = 504;
export const DEFAULT_GROUP_HEIGHT = 336;
export const DEFAULT_GRID_SIZE = 29;
export const DEFAULT_FONT_SIZE = 17;
export const EXPORT_PADDING_PX = 43;

export function resolveNodeBackgroundColor(color?: string) {
  if (!color) {
    return NODE_BACKGROUND_PRESETS.surface;
  }

  return (
    NODE_BACKGROUND_PRESETS[color as keyof typeof NODE_BACKGROUND_PRESETS] ??
    color
  );
}

export function resolveNodeBorderColor(color?: string) {
  if (!color) {
    return NODE_BORDER_PRESETS.border;
  }

  return (
    NODE_BORDER_PRESETS[color as keyof typeof NODE_BORDER_PRESETS] ?? color
  );
}

export function resolveEdgeColor(color?: string) {
  if (!color) {
    return EDGE_COLOR_PRESETS['canvas-edge'];
  }

  return EDGE_COLOR_PRESETS[color as keyof typeof EDGE_COLOR_PRESETS] ?? color;
}

export interface DiagramSnapshot {
  name: string;
  description: string;
  tags: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport?: DiagramViewport;
}

export interface DiagramHistoryState {
  past: DiagramSnapshot[];
  future: DiagramSnapshot[];
  present: DiagramSnapshot;
}

export interface DiagramTemplate {
  id: string;
  label: string;
  description: string;
  snapshot: Pick<DiagramSnapshot, 'nodes' | 'edges'>;
}

export interface DiagramSearchResult {
  nodeId: string;
  label: string;
}

export interface SnapGuides {
  vertical: number[];
  horizontal: number[];
}

export interface DiagramExportBounds extends Rect {
  padding: number;
}

export function createEmptyDiagram(name: string): Diagram {
  const timestamp = new Date().toISOString();

  return {
    id: createId('diagram'),
    name,
    description: '',
    tags: [],
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    versions: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function renameDiagram(diagram: Diagram, name: string): Diagram {
  return {
    ...diagram,
    name: name.trim() || diagram.name,
    updatedAt: new Date().toISOString(),
  };
}

export function duplicateDiagram(diagram: Diagram): Diagram {
  const timestamp = new Date().toISOString();
  const nodeIdMap = new Map<string, string>();

  const duplicatedNodes = diagram.nodes.map((node) => {
    const nextId = createId('node');
    nodeIdMap.set(node.id, nextId);

    return {
      ...node,
      id: nextId,
      parentId: node.parentId ? nodeIdMap.get(node.parentId) : node.parentId,
      groupId: node.groupId ? nodeIdMap.get(node.groupId) : node.groupId,
    };
  });

  return {
    ...diagram,
    id: createId('diagram'),
    name: `${diagram.name} Copy`,
    nodes: duplicatedNodes,
    edges: diagram.edges.map((edge) => ({
      ...edge,
      id: createId('edge'),
      source: nodeIdMap.get(edge.source) ?? edge.source,
      target: nodeIdMap.get(edge.target) ?? edge.target,
    })),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function inferNodeStyle(nodeType: DiagramNodeType): DiagramNodeStyle {
  return (
    getNodeDefinition(nodeType).defaultStyle ?? {
      backgroundColor: 'surface',
      borderColor: 'border',
    }
  );
}

function getNodeSizeConfig(definition: DiagramNodeDefinition) {
  if (definition.type === 'group') {
    return {
      minWidth: DEFAULT_GROUP_WIDTH,
      minHeight: DEFAULT_GROUP_HEIGHT,
      maxWidth: 864,
      maxHeight: 768,
      paddingX: 101,
      paddingY: 115,
    };
  }

  if (definition.kind === 'text') {
    return {
      minWidth: 168,
      minHeight: 53,
      maxWidth: 864,
      maxHeight: 504,
      paddingX: 38,
      paddingY: 34,
    };
  }

  if (definition.kind === 'icon') {
    return {
      minWidth: 168,
      minHeight: 144,
      maxWidth: 312,
      maxHeight: 264,
      paddingX: 58,
      paddingY: 72,
    };
  }

  if (definition.kind === 'shape') {
    return {
      minWidth: 228,
      minHeight: 130,
      maxWidth: 504,
      maxHeight: 384,
      paddingX: 96,
      paddingY: 91,
    };
  }

  return {
    minWidth: 240,
    minHeight: 110,
    maxWidth: 504,
    maxHeight: 384,
    paddingX: 86,
    paddingY: 86,
  };
}

export function autoSizeNodeStyle(
  label: string,
  nodeType: DiagramNodeType = 'process',
  existingStyle?: DiagramNode['style'],
): DiagramNode['style'] {
  const definition = getNodeDefinition(nodeType);
  const sizeConfig = getNodeSizeConfig(definition);
  const lines = label.split('\n');
  const longestLine = lines.reduce(
    (current, line) => Math.max(current, line.length),
    0,
  );
  const fontSize = Number(
    (existingStyle?.fontSize as number | undefined) ??
      definition.defaultStyle?.fontSize ??
      DEFAULT_FONT_SIZE,
  );
  const width = Math.min(
    Math.max(
      sizeConfig.minWidth,
      longestLine * (fontSize * 0.62) + sizeConfig.paddingX,
    ),
    sizeConfig.maxWidth,
  );
  const height = Math.min(
    Math.max(
      sizeConfig.minHeight,
      lines.length * (fontSize * 1.7) + sizeConfig.paddingY,
    ),
    sizeConfig.maxHeight,
  );

  return {
    ...existingStyle,
    width,
    minHeight: height,
  };
}

function clampCircleNodeStyle(
  existingStyle: DiagramNode['style'] | undefined,
): DiagramNode['style'] {
  const baseSize = 160;
  const currentWidth = Number(existingStyle?.width ?? baseSize);
  const currentHeight = Number(
    existingStyle?.height ?? existingStyle?.minHeight ?? baseSize,
  );
  const size = Math.max(
    96,
    Number.isFinite(currentWidth) ? currentWidth : baseSize,
    Number.isFinite(currentHeight) ? currentHeight : baseSize,
  );

  return {
    ...(existingStyle ?? {}),
    width: size,
    height: size,
    minHeight: size,
  };
}

export function createNode(
  nodes: DiagramNode[],
  nodeType: DiagramNodeType = 'process',
  position?: XYPosition,
  dataPatch?: Partial<DiagramNodeData>,
): DiagramNode {
  const index = nodes.length;
  const definition = getNodeDefinition(nodeType);
  const label = dataPatch?.label ?? definition.defaultLabel;
  const style = {
    ...inferNodeStyle(nodeType),
    ...dataPatch?.style,
  };

  const node: DiagramNode = {
    id: createId('node'),
    type: nodeType,
    position:
      position ??
      ({
        x: 80 + (index % 5) * DEFAULT_NODE_POSITION_STEP,
        y: 80 + Math.floor(index / 5) * DEFAULT_NODE_POSITION_STEP,
      } satisfies XYPosition),
    selected: true,
    draggable: true,
    data: {
      label,
      type: nodeType,
      kind: definition.kind,
      icon: dataPatch?.icon ?? definition.iconName,
      tags: dataPatch?.tags ?? [],
      style,
      comments: [],
      needsReview: false,
      ...dataPatch,
    },
    style:
      nodeType === 'group'
        ? {
            width: DEFAULT_GROUP_WIDTH,
            minHeight: DEFAULT_GROUP_HEIGHT,
          }
        : nodeType === 'circle-compact'
          ? clampCircleNodeStyle(
              autoSizeNodeStyle(label, nodeType, {
                ...(style.fontSize ? { fontSize: style.fontSize } : {}),
              }),
            )
          : autoSizeNodeStyle(label, nodeType, {
              ...(style.fontSize ? { fontSize: style.fontSize } : {}),
            }),
  };

  const width = Number(dataPatch?.style?.width ?? style.width);
  const height = Number(dataPatch?.style?.height ?? style.height);

  if (Number.isFinite(width) || Number.isFinite(height)) {
    node.style = {
      ...(node.style ?? {}),
      ...(Number.isFinite(width) ? { width } : {}),
      ...(Number.isFinite(height) ? { height, minHeight: height } : {}),
    };
  }

  if (nodeType === 'circle-compact') {
    node.style = clampCircleNodeStyle(node.style);
  }

  return node;
}

export function clearSelection<T extends { selected?: boolean }>(items: T[]) {
  return items.map((item) => ({
    ...item,
    selected: false,
  }));
}

export function selectSingleNode(nodes: DiagramNode[], nodeId: string) {
  return nodes.map((node) => ({
    ...node,
    selected: node.id === nodeId,
  }));
}

export type NodeRect = { x: number; y: number; width: number; height: number };

function rectsIntersect(a: NodeRect, b: NodeRect) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

export function getNodeRect(node: DiagramNode): NodeRect {
  const width = Number(node.width ?? node.style?.width ?? 240);
  const height = Number(
    node.height ?? node.style?.height ?? node.style?.minHeight ?? 140,
  );

  return {
    x: node.position.x,
    y: node.position.y,
    width: Number.isFinite(width) ? width : 240,
    height: Number.isFinite(height) ? height : 140,
  };
}

export function detectNodeIntersections(
  nodes: DiagramNode[],
  nodeId: string,
): string[] {
  const moving = nodes.find((node) => node.id === nodeId);
  if (!moving) {
    return [];
  }

  const a = getNodeRect(moving);
  return nodes
    .filter((node) => node.id !== nodeId)
    .filter((node) => rectsIntersect(a, getNodeRect(node)))
    .map((node) => node.id);
}

export function createEdge(connection: {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}): DiagramEdge & { selected: boolean } {
  return {
    id: createId('edge'),
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle ?? null,
    targetHandle: connection.targetHandle ?? null,
    selected: false,
    type: 'smoothstep',
    data: {
      edgeType: 'smoothstep',
      color: EDGE_COLOR_PRESETS['canvas-edge'],
      width: 2,
      lineStyle: 'solid',
      markerKind: 'arrow',
      markerPosition: 'end',
      label: '',
      animated: false,
    },
    style: {
      stroke: EDGE_COLOR_PRESETS['canvas-edge'],
      strokeWidth: 2,
    },
  };
}

function resolveDashArray(style: DiagramEdgeLineStyle | undefined) {
  if (style === 'dashed') {
    return '8 6';
  }

  if (style === 'dotted') {
    return '2 6';
  }

  return undefined;
}

export function resolveEdgeMarker(
  markerKind: DiagramEdgeMarkerKind,
  placement: 'start' | 'end',
  color?: string,
): EdgeMarkerType | undefined {
  if (markerKind === 'none') {
    return undefined;
  }

  if (markerKind === 'arrow') {
    return {
      type: MarkerType.ArrowClosed,
      color: resolveEdgeColor(color),
    };
  }

  return `url(#flowcraft-marker-${markerKind}-${placement})`;
}

export function resolveEdgeMarkers(
  markerKind = 'arrow' as DiagramEdgeMarkerKind,
  markerPosition = 'end' as DiagramEdgeMarkerPosition,
  color?: string,
) {
  return {
    markerStart:
      markerPosition === 'start' || markerPosition === 'both'
        ? resolveEdgeMarker(markerKind, 'start', color)
        : undefined,
    markerEnd:
      markerPosition === 'end' || markerPosition === 'both'
        ? resolveEdgeMarker(markerKind, 'end', color)
        : undefined,
  };
}

export function buildEdgeStyle(data?: DiagramEdgeData) {
  const stroke = resolveEdgeColor(data?.color);
  const strokeWidth = data?.width ?? 2;

  return {
    stroke,
    strokeWidth,
    strokeDasharray: resolveDashArray(data?.lineStyle),
  };
}

const DEFAULT_EDGE_LABEL_TEXT = '#475569';

export function buildEdgeLabelOptions(
  data?: DiagramEdgeData,
): Pick<
  DiagramEdge,
  | 'labelStyle'
  | 'labelBgStyle'
  | 'labelShowBg'
  | 'labelBgPadding'
  | 'labelBgBorderRadius'
> {
  const hasFill =
    Boolean(data?.labelBackgroundColor) &&
    data?.labelBackgroundColor !== 'transparent';
  const hasBorder =
    Boolean(data?.labelBorderColor) && data?.labelBorderColor !== 'transparent';
  const showPill = hasFill || hasBorder;
  const textColor = data?.labelColor
    ? resolveEdgeColor(data.labelColor)
    : DEFAULT_EDGE_LABEL_TEXT;
  const fontSize = data?.labelFontSize ?? 13;

  return {
    labelStyle: {
      fill: textColor,
      fontSize,
      fontWeight: 500,
    },
    labelShowBg: showPill,
    labelBgStyle: showPill
      ? {
          fill: hasFill
            ? resolveNodeBackgroundColor(data?.labelBackgroundColor)
            : resolveNodeBackgroundColor('surface'),
          stroke: hasBorder
            ? resolveNodeBorderColor(data?.labelBorderColor)
            : undefined,
          strokeWidth: hasBorder ? 1 : 0,
        }
      : {},
    labelBgPadding: [4, 6],
    labelBgBorderRadius: 6,
  };
}

export function createRenderableEdge(edge: DiagramEdge): DiagramEdge {
  const markerKind = edge.data?.markerKind ?? 'arrow';
  const markerPosition = edge.data?.markerPosition ?? 'end';
  const color = edge.data?.color;

  return {
    ...edge,
    label: edge.data?.label ?? edge.label ?? '',
    type: edge.data?.edgeType ?? edge.type ?? 'smoothstep',
    style: buildEdgeStyle(edge.data),
    animated: Boolean(edge.data?.animated),
    ...buildEdgeLabelOptions(edge.data),
    ...resolveEdgeMarkers(markerKind, markerPosition, color),
  };
}

export function duplicateNodes(
  nodes: DiagramNode[],
  selectedIds: string[],
  offset: XYPosition = { x: 36, y: 36 },
) {
  const selectedIdSet = new Set(selectedIds);
  const idMap = new Map<string, string>();

  const duplicatedNodes = nodes
    .filter((node) => selectedIdSet.has(node.id))
    .map((node) => {
      const nextId = createId('node');
      idMap.set(node.id, nextId);

      return {
        ...node,
        id: nextId,
        selected: true,
        parentId: node.parentId ? idMap.get(node.parentId) : node.parentId,
        groupId: node.groupId ? idMap.get(node.groupId) : node.groupId,
        position: {
          x: node.position.x + offset.x,
          y: node.position.y + offset.y,
        },
      };
    });

  return { duplicatedNodes, idMap };
}

export function duplicateEdges(
  edges: DiagramEdge[],
  idMap: Map<string, string>,
): DiagramEdge[] {
  return edges
    .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
    .map((edge) =>
      createRenderableEdge({
        ...edge,
        id: createId('edge'),
        source: idMap.get(edge.source) ?? edge.source,
        target: idMap.get(edge.target) ?? edge.target,
        selected: true,
      }),
    );
}

export function updateNodeData(
  nodes: DiagramNode[],
  nodeId: string,
  updater: (current: DiagramNodeData) => DiagramNodeData,
) {
  return nodes.map((node) => {
    if (node.id !== nodeId) {
      return node;
    }

    const nextData = updater(node.data);
    const isPrimitiveShape =
      typeof node.type === 'string' && node.type.startsWith('shape-');

    return {
      ...node,
      data: nextData,
      style:
        node.type === 'group'
          ? node.style
          : isPrimitiveShape
            ? {
                ...(node.style ?? {}),
                ...(typeof nextData.style?.width === 'number'
                  ? { width: nextData.style.width }
                  : {}),
                ...(typeof nextData.style?.height === 'number'
                  ? {
                      height: nextData.style.height,
                      minHeight: nextData.style.height,
                    }
                  : {}),
              }
            : autoSizeNodeStyle(
                String(nextData.label ?? node.data.label),
                (node.type ?? 'process') as DiagramNodeType,
                {
                  ...node.style,
                  ...(nextData.style?.fontSize
                    ? { fontSize: nextData.style.fontSize }
                    : {}),
                },
              ),
    };
  });
}

export function updateNodeLabel(
  nodes: DiagramNode[],
  nodeId: string,
  label: string,
) {
  return updateNodeData(nodes, nodeId, (current) => ({
    ...current,
    label,
  }));
}

export function updateNodeStyle(
  nodes: DiagramNode[],
  nodeId: string,
  stylePatch: DiagramNodeStyle,
) {
  return updateNodeData(nodes, nodeId, (current) => ({
    ...current,
    style: {
      ...current.style,
      ...stylePatch,
    },
  }));
}

export function updateNodeTags(
  nodes: DiagramNode[],
  nodeId: string,
  tags: string[],
) {
  return updateNodeData(nodes, nodeId, (current) => ({
    ...current,
    tags,
  }));
}

export function updateNodeIcon(
  nodes: DiagramNode[],
  nodeId: string,
  icon?: string,
) {
  return updateNodeData(nodes, nodeId, (current) => ({
    ...current,
    icon,
  }));
}

export function updateNodeBadgeLabel(
  nodes: DiagramNode[],
  nodeId: string,
  badgeLabel: string | undefined,
) {
  return updateNodeData(nodes, nodeId, (current) => {
    const next: typeof current = { ...current };
    const trimmed = badgeLabel?.trim();

    if (!trimmed) {
      delete next.badgeLabel;
    } else {
      next.badgeLabel = trimmed;
    }

    return next;
  });
}

export function updateEdgeData(
  edges: DiagramEdge[],
  edgeId: string,
  patch: Partial<DiagramEdgeData>,
) {
  return edges.map((edge) =>
    edge.id === edgeId
      ? createRenderableEdge({
          ...edge,
          data: {
            ...edge.data,
            ...patch,
          },
        })
      : edge,
  );
}

export function getViewportSnapshot(
  instance: ReactFlowInstance,
): DiagramViewport {
  return instance.getViewport();
}

export function buildDiagramPatch(
  diagram: Diagram,
  snapshot: DiagramSnapshot,
): Diagram {
  return {
    ...diagram,
    name: snapshot.name,
    description: snapshot.description,
    tags: snapshot.tags,
    nodes: snapshot.nodes,
    edges: snapshot.edges,
    viewport: snapshot.viewport,
    updatedAt: new Date().toISOString(),
  };
}

export function createDiagramSnapshot(payload: {
  name: string;
  description?: string;
  tags?: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  viewport?: DiagramViewport;
}): DiagramSnapshot {
  return {
    name: payload.name,
    description: payload.description ?? '',
    tags: payload.tags ?? [],
    nodes: payload.nodes,
    edges: payload.edges,
    viewport: payload.viewport,
  };
}

export function createVersionSnapshot(
  snapshot: DiagramSnapshot,
  summary: string,
): DiagramVersionSnapshot {
  return {
    id: createId('version'),
    createdAt: new Date().toISOString(),
    summary,
    nodes: snapshot.nodes,
    edges: snapshot.edges,
  };
}

export function createHistoryState(
  snapshot: DiagramSnapshot,
): DiagramHistoryState {
  return {
    past: [],
    future: [],
    present: snapshot,
  };
}

export function pushHistory(
  history: DiagramHistoryState,
  snapshot: DiagramSnapshot,
): DiagramHistoryState {
  if (JSON.stringify(history.present) === JSON.stringify(snapshot)) {
    return history;
  }

  return {
    past: [...history.past, history.present].slice(-100),
    future: [],
    present: snapshot,
  };
}

export function undoHistory(history: DiagramHistoryState): DiagramHistoryState {
  const previous = history.past.at(-1);

  if (!previous) {
    return history;
  }

  return {
    past: history.past.slice(0, -1),
    future: [history.present, ...history.future],
    present: previous,
  };
}

export function redoHistory(history: DiagramHistoryState): DiagramHistoryState {
  const next = history.future[0];

  if (!next) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    future: history.future.slice(1),
    present: next,
  };
}

export function getSelectionBounds(selectedNodes: DiagramNode[]) {
  if (selectedNodes.length === 0) {
    return null;
  }

  const xValues = selectedNodes.map((node) => node.position.x);
  const yValues = selectedNodes.map((node) => node.position.y);
  const widths = selectedNodes.map((node) => Number(node.style?.width ?? 220));
  const heights = selectedNodes.map((node) =>
    Number(node.style?.minHeight ?? 96),
  );

  const minX = Math.min(...xValues);
  const minY = Math.min(...yValues);
  const maxX = Math.max(...xValues.map((x, index) => x + widths[index]));
  const maxY = Math.max(...yValues.map((y, index) => y + heights[index]));

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export function groupNodes(
  nodes: DiagramNode[],
  selectedIds: string[],
): DiagramNode[] {
  const selected = nodes.filter((node) => selectedIds.includes(node.id));

  if (selected.length < 2) {
    return nodes;
  }

  const bounds = getSelectionBounds(selected);

  if (!bounds) {
    return nodes;
  }

  const groupNode = createNode(nodes, 'group', {
    x: bounds.x - 36,
    y: bounds.y - 52,
  });

  groupNode.style = {
    width: bounds.width + 72,
    minHeight: bounds.height + 88,
  };

  const updatedNodes = nodes.map((node) => {
    if (!selectedIds.includes(node.id)) {
      return {
        ...node,
        selected: false,
      };
    }

    return {
      ...node,
      parentId: groupNode.id,
      groupId: groupNode.id,
      extent: 'parent' as const,
      selected: false,
      position: {
        x: node.position.x - groupNode.position.x,
        y: node.position.y - groupNode.position.y,
      },
    };
  });

  return [groupNode, ...updatedNodes];
}

export function ungroupNodes(nodes: DiagramNode[], groupId: string) {
  const group = nodes.find((node) => node.id === groupId);

  if (!group) {
    return nodes;
  }

  return nodes
    .filter((node) => node.id !== groupId)
    .map((node) => {
      if (node.parentId !== groupId) {
        return node;
      }

      return {
        ...node,
        parentId: undefined,
        groupId: undefined,
        extent: undefined,
        position: {
          x: node.position.x + group.position.x,
          y: node.position.y + group.position.y,
        },
      };
    });
}

export function searchDiagramNodes(
  nodes: DiagramNode[],
  query: string,
): DiagramSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return nodes
    .filter((node) =>
      String(node.data.label).toLowerCase().includes(normalizedQuery),
    )
    .map((node) => ({
      nodeId: node.id,
      label: String(node.data.label),
    }));
}

export function snapValue(value: number, gridSize = DEFAULT_GRID_SIZE) {
  return Math.round(value / gridSize) * gridSize;
}

export function getSnapGuides(
  draggingNode: DiagramNode,
  nodes: DiagramNode[],
  gridSize = DEFAULT_GRID_SIZE,
): SnapGuides {
  const guides: SnapGuides = {
    vertical: [snapValue(draggingNode.position.x, gridSize)],
    horizontal: [snapValue(draggingNode.position.y, gridSize)],
  };

  nodes.forEach((node) => {
    if (node.id === draggingNode.id || node.parentId) {
      return;
    }

    if (Math.abs(node.position.x - draggingNode.position.x) < 10) {
      guides.vertical.push(node.position.x);
    }

    if (Math.abs(node.position.y - draggingNode.position.y) < 10) {
      guides.horizontal.push(node.position.y);
    }
  });

  return guides;
}

export function snapNodePosition(
  draggingNode: DiagramNode,
  nodes: DiagramNode[],
  gridSize = DEFAULT_GRID_SIZE,
) {
  let nextX = snapValue(draggingNode.position.x, gridSize);
  let nextY = snapValue(draggingNode.position.y, gridSize);

  nodes.forEach((node) => {
    if (node.id === draggingNode.id || node.parentId) {
      return;
    }

    if (Math.abs(node.position.x - draggingNode.position.x) < 10) {
      nextX = node.position.x;
    }

    if (Math.abs(node.position.y - draggingNode.position.y) < 10) {
      nextY = node.position.y;
    }
  });

  return {
    x: nextX,
    y: nextY,
  };
}

export function calculateDiagramBounds(
  nodes: DiagramNode[],
  padding = EXPORT_PADDING_PX,
): DiagramExportBounds {
  if (nodes.length === 0) {
    return {
      x: 0,
      y: 0,
      width: 768,
      height: 576,
      padding,
    };
  }

  const bounds = getNodesBounds(nodes);

  return {
    x: bounds.x - padding,
    y: bounds.y - padding,
    width: Math.max(bounds.width + padding * 2, 384),
    height: Math.max(bounds.height + padding * 2, 288),
    padding,
  };
}

export function getExportViewport(
  nodes: DiagramNode[],
  width: number,
  height: number,
  padding = EXPORT_PADDING_PX,
) {
  const bounds = calculateDiagramBounds(nodes, padding);

  return getViewportForBounds(bounds, width, height, 0.1, 2, 0);
}

export function buildFlowchartTemplate(): DiagramTemplate {
  const start = createNode([], 'start', { x: 160, y: 80 });
  const process = createNode([start], 'process', { x: 160, y: 240 });
  const decision = createNode([start, process], 'decision', { x: 160, y: 400 });
  const end = createNode([start, process, decision], 'end', { x: 160, y: 560 });

  return {
    id: 'flowchart-template',
    label: 'Flowchart',
    description: 'Start, process, decision, and end nodes for process mapping.',
    snapshot: {
      nodes: [start, process, decision, end],
      edges: [
        createRenderableEdge(
          createEdge({ source: start.id, target: process.id }),
        ),
        createRenderableEdge(
          createEdge({ source: process.id, target: decision.id }),
        ),
        createRenderableEdge(
          createEdge({ source: decision.id, target: end.id }),
        ),
      ],
    },
  };
}

export function buildDecisionFlowTemplate(): DiagramTemplate {
  const start = createNode([], 'start', { x: 140, y: 80 });
  const decision = createNode([start], 'decision', { x: 140, y: 260 });
  const yes = createNode([start, decision], 'process', { x: 340, y: 440 });
  yes.data.label = 'Approved path';
  const no = createNode([start, decision, yes], 'process', { x: -40, y: 440 });
  no.data.label = 'Review path';
  const end = createNode([start, decision, yes, no], 'end', { x: 140, y: 620 });

  return {
    id: 'decision-flow-template',
    label: 'Decision Flow',
    description: 'A quick branching starter for binary decision trees.',
    snapshot: {
      nodes: [start, decision, yes, no, end],
      edges: [
        createRenderableEdge(
          createEdge({ source: start.id, target: decision.id }),
        ),
        createRenderableEdge(
          createEdge({ source: decision.id, target: yes.id }),
        ),
        createRenderableEdge(
          createEdge({ source: decision.id, target: no.id }),
        ),
        createRenderableEdge(createEdge({ source: yes.id, target: end.id })),
        createRenderableEdge(createEdge({ source: no.id, target: end.id })),
      ],
    },
  };
}

export function buildSystemDesignTemplate(): DiagramTemplate {
  const api = createNode([], 'process', { x: 260, y: 120 });
  api.data.label = 'API Service';
  const db = createNode([api], 'database', { x: 560, y: 120 });
  db.data.label = 'Primary Database';
  const worker = createNode([api, db], 'subprocess', { x: 560, y: 320 });
  worker.data.label = 'Worker';
  const note = createNode([api, db, worker], 'text', { x: 160, y: 340 });
  note.data.label = 'Add queues, caching,\nand auth layers here';

  return {
    id: 'system-design-template',
    label: 'System Architecture',
    description: 'A lightweight architecture starting point.',
    snapshot: {
      nodes: [api, db, worker, note],
      edges: [
        createRenderableEdge(createEdge({ source: api.id, target: db.id })),
        createRenderableEdge(createEdge({ source: api.id, target: worker.id })),
      ],
    },
  };
}

export function buildUserJourneyTemplate(): DiagramTemplate {
  const title = createNode([], 'title', { x: 80, y: 40 });
  title.data.label = 'User Journey';
  const discover = createNode([title], 'process', { x: 80, y: 200 });
  discover.data.label = 'Discover';
  const onboard = createNode([title, discover], 'process', { x: 320, y: 200 });
  onboard.data.label = 'Onboard';
  const adopt = createNode([title, discover, onboard], 'process', {
    x: 560,
    y: 200,
  });
  adopt.data.label = 'Adopt';
  const note = createNode([title, discover, onboard, adopt], 'sticky-note', {
    x: 320,
    y: 380,
  });
  note.data.label = 'Capture user emotions,\nfriction, and aha moments.';

  return {
    id: 'user-journey-template',
    label: 'User Journey',
    description: 'Journey map starter with stages and commentary.',
    snapshot: {
      nodes: [title, discover, onboard, adopt, note],
      edges: [
        createRenderableEdge(
          createEdge({ source: discover.id, target: onboard.id }),
        ),
        createRenderableEdge(
          createEdge({ source: onboard.id, target: adopt.id }),
        ),
      ],
    },
  };
}

export function buildOrgChartTemplate(): DiagramTemplate {
  const ceo = createNode([], 'start', { x: 300, y: 60 });
  ceo.data.label = 'CEO';
  const ops = createNode([ceo], 'process', { x: 120, y: 240 });
  ops.data.label = 'Operations';
  const eng = createNode([ceo, ops], 'process', { x: 300, y: 240 });
  eng.data.label = 'Engineering';
  const sales = createNode([ceo, ops, eng], 'process', { x: 480, y: 240 });
  sales.data.label = 'Sales';

  return {
    id: 'org-chart-template',
    label: 'Org Chart',
    description: 'A simple leadership tree structure.',
    snapshot: {
      nodes: [ceo, ops, eng, sales],
      edges: [
        createRenderableEdge(createEdge({ source: ceo.id, target: ops.id })),
        createRenderableEdge(createEdge({ source: ceo.id, target: eng.id })),
        createRenderableEdge(createEdge({ source: ceo.id, target: sales.id })),
      ],
    },
  };
}

export function buildDataPipelineTemplate(): DiagramTemplate {
  const source = createNode([], 'database', { x: 80, y: 220 });
  source.data.label = 'Raw source';
  const transform = createNode([source], 'subprocess', { x: 340, y: 220 });
  transform.data.label = 'Transform';
  const destination = createNode([source, transform], 'database', {
    x: 600,
    y: 220,
  });
  destination.data.label = 'Warehouse';
  const caption = createNode([source, transform, destination], 'caption', {
    x: 80,
    y: 80,
  });
  caption.data.label = 'Move data from source to analytics-ready storage.';

  return {
    id: 'data-pipeline-template',
    label: 'Data Pipeline',
    description: 'A source-transform-destination starter.',
    snapshot: {
      nodes: [source, transform, destination, caption],
      edges: [
        createRenderableEdge(
          createEdge({ source: source.id, target: transform.id }),
        ),
        createRenderableEdge(
          createEdge({ source: transform.id, target: destination.id }),
        ),
      ],
    },
  };
}

export const DIAGRAM_TEMPLATES = [
  buildFlowchartTemplate(),
  buildDecisionFlowTemplate(),
  buildSystemDesignTemplate(),
  buildUserJourneyTemplate(),
  buildOrgChartTemplate(),
  buildDataPipelineTemplate(),
];
