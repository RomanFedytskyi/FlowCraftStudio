import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  SelectionMode,
  reconnectEdge,
  useReactFlow,
  useViewport,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type NodeTypes,
  type XYPosition,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { Navigate, useParams } from 'react-router-dom';

import { EdgeMarkerDefs } from '@pages/DiagramEditorPage/components/EdgeMarkerDefs';
import { EditorPropertiesPanel } from '@pages/DiagramEditorPage/components/EditorPropertiesPanel';
import { EditorSidebar } from '@pages/DiagramEditorPage/components/EditorSidebar';
import { EditorToolbar } from '@pages/DiagramEditorPage/components/EditorToolbar';
import { FloatingEdge } from '@pages/DiagramEditorPage/components/FloatingEdge';
import {
  FlowNode,
  type FlowNodeData,
} from '@pages/DiagramEditorPage/components/FlowNode';
import { KeyboardShortcutsModal } from '@pages/DiagramEditorPage/components/KeyboardShortcutsModal';

import { HelperAnnotationNode } from '@components/diagram/nodes/HelperAnnotationNode';
import { ShapePrimitiveNode } from '@components/diagram/nodes/shapes/ShapePrimitiveNode';

import {
  createCleanExportTarget,
  exportDiagram,
} from '@services/export/exportService';

import { useDiagram } from '@hooks/useDiagram';
import { useUpdateDiagram } from '@hooks/useDiagramMutations';

import { AUTO_SAVE_DELAY_MS } from '@configs/app';
import type { BlockLibraryNodeItem } from '@configs/blockLibrary.config';
import { validateConnection } from '@configs/connectionRules.config';

import {
  DEFAULT_GRID_SIZE,
  buildDiagramPatch,
  clearSelection,
  createDiagramSnapshot,
  createEdge,
  createHistoryState,
  createNode,
  createRenderableEdge,
  createVersionSnapshot,
  detectNodeIntersections,
  duplicateEdges,
  duplicateNodes,
  getSelectionBounds,
  getSnapGuides,
  getViewportSnapshot,
  groupNodes,
  pushHistory,
  redoHistory,
  selectSingleNode,
  snapValue,
  type DiagramHistoryState,
  type DiagramSnapshot,
  type SnapGuides,
  undoHistory,
  ungroupNodes,
  updateNodeData,
  updateEdgeData,
  updateNodeBadgeLabel,
  updateNodeIcon,
  updateNodeLabel,
  updateNodeStyle,
  updateNodeTags,
} from '@utils/diagram';

import { useToast } from '../../contexts/ToastContext';

import type {
  Diagram,
  DiagramEdge,
  DiagramEdgeLineStyle,
  DiagramEdgeMarkerKind,
  DiagramEdgeMarkerPosition,
  DiagramEdgeType,
  DiagramNode,
  DiagramNodeData,
  DiagramNodeStyle,
  DiagramNodeType,
} from '../../types/diagram';
import type { ExportFormat, ExportScope } from '../../types/export';

type SaveState = 'Saved' | 'Unsaved changes' | 'Saving...';

const nodeTypes: NodeTypes = {
  start: FlowNode,
  end: FlowNode,
  process: FlowNode,
  decision: FlowNode,
  'input-output': FlowNode,
  database: FlowNode,
  document: FlowNode,
  subprocess: FlowNode,
  connector: FlowNode,
  rectangle: FlowNode,
  'rounded-rectangle': FlowNode,
  circle: FlowNode,
  ellipse: FlowNode,
  diamond: FlowNode,
  triangle: FlowNode,
  hexagon: FlowNode,
  line: FlowNode,
  arrow: FlowNode,
  frame: FlowNode,
  text: FlowNode,
  title: FlowNode,
  heading: FlowNode,
  paragraph: FlowNode,
  label: FlowNode,
  caption: FlowNode,
  callout: FlowNode,
  note: FlowNode,
  'sticky-note': FlowNode,
  comment: FlowNode,
  warning: FlowNode,
  info: FlowNode,
  checklist: FlowNode,
  icon: FlowNode,
  group: FlowNode,
  'custom-input': FlowNode,
  counter: FlowNode,
  'circle-compact': FlowNode,
  'svg-shape': FlowNode,
  architecture: FlowNode,
  toolbar: FlowNode,
  'shape-circle': ShapePrimitiveNode,
  'shape-rectangle': ShapePrimitiveNode,
  'shape-rounded-rectangle': ShapePrimitiveNode,
  'shape-diamond': ShapePrimitiveNode,
  'shape-hexagon': ShapePrimitiveNode,
  'shape-triangle': ShapePrimitiveNode,
  'shape-parallelogram': ShapePrimitiveNode,
  'shape-cylinder': ShapePrimitiveNode,
  'shape-arrow-rectangle': ShapePrimitiveNode,
  'shape-plus': ShapePrimitiveNode,
  'shape-cloud': ShapePrimitiveNode,
  helper: HelperAnnotationNode,
};

const edgeTypes = {
  floating: FloatingEdge,
} as const;

function getSnapshotFromDiagram(diagram: Diagram): DiagramSnapshot {
  return createDiagramSnapshot({
    name: diagram.name,
    description: diagram.description,
    tags: diagram.tags,
    nodes: diagram.nodes,
    edges: diagram.edges,
    viewport: diagram.viewport,
  });
}

function FlowZoomReporter({ onZoom }: { onZoom: (zoom: number) => void }) {
  const { zoom } = useViewport();

  useEffect(() => {
    onZoom(zoom);
  }, [onZoom, zoom]);

  return null;
}

function EditorCanvas({ diagram }: { diagram: Diagram }) {
  const reactFlow = useReactFlow();
  const updateDiagram = useUpdateDiagram();
  const toast = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const baselineRef = useRef('');
  const clipboardRef = useRef<{ nodes: DiagramNode[]; edges: DiagramEdge[] }>({
    nodes: [],
    edges: [],
  });
  const dragStartRef = useRef<DiagramSnapshot | null>(null);

  const [history, setHistory] = useState<DiagramHistoryState>(() =>
    createHistoryState(getSnapshotFromDiagram(diagram)),
  );
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('Saved');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [toolbarZoomPercent, setToolbarZoomPercent] = useState(100);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [screenGuides, setScreenGuides] = useState<SnapGuides>({
    vertical: [],
    horizontal: [],
  });
  const [intersectingNodeIds, setIntersectingNodeIds] = useState<string[]>([]);

  const handleFlowZoom = useCallback((zoom: number) => {
    setToolbarZoomPercent(Math.round(zoom * 100));
  }, []);

  const present = history.present;

  useEffect(() => {
    const snapshot = getSnapshotFromDiagram(diagram);
    setHistory(createHistoryState(snapshot));
    baselineRef.current = JSON.stringify(snapshot);
    setSaveState('Saved');
    setEditingNodeId(null);
  }, [diagram]);

  const applySnapshot = useCallback(
    (
      updater: (snapshot: DiagramSnapshot) => DiagramSnapshot,
      options?: {
        recordHistory?: boolean;
      },
    ) => {
      setHistory((current) => {
        const nextSnapshot = updater(current.present);

        if (options?.recordHistory === false) {
          return {
            ...current,
            present: nextSnapshot,
          };
        }

        return pushHistory(current, nextSnapshot);
      });
    },
    [],
  );

  const selectedNodes = useMemo(
    () => present.nodes.filter((node) => node.selected),
    [present.nodes],
  );
  const selectedEdges = useMemo(
    () => present.edges.filter((edge) => edge.selected),
    [present.edges],
  );
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;
  const selectedEdge = selectedEdges.length === 1 ? selectedEdges[0] : null;
  const neighborHighlight = true;
  const neighborhood = useMemo(() => {
    if (!neighborHighlight || !selectedNode) {
      return null;
    }

    const focusId = selectedNode.id;
    const neighborIds = new Set<string>([focusId]);
    const neighborEdgeIds = new Set<string>();

    for (const edge of present.edges) {
      if (edge.source === focusId || edge.target === focusId) {
        neighborIds.add(edge.source);
        neighborIds.add(edge.target);
        neighborEdgeIds.add(edge.id);
      }
    }

    return { neighborIds, neighborEdgeIds };
  }, [neighborHighlight, present.edges, selectedNode]);
  const selectedNodeIds = useMemo(
    () => selectedNodes.map((node) => node.id),
    [selectedNodes],
  );

  const canGroup =
    selectedNodes.filter((node) => node.type !== 'group').length >= 2;
  const canUngroup = Boolean(
    (selectedNode?.type === 'group' && selectedNode.id) ||
    selectedNodes.some((node) => node.groupId),
  );

  const renderNodes = useMemo(
    () =>
      present.nodes.map((node) => ({
        ...node,
        style: {
          ...node.style,
          opacity: neighborhood
            ? neighborhood.neighborIds.has(node.id)
              ? 1
              : 0.25
            : 1,
        },
        data: {
          ...node.data,
          isEditing: editingNodeId === node.id,
          isIntersecting: intersectingNodeIds.includes(node.id),
          onStartEdit: (nodeId: string) => setEditingNodeId(nodeId),
          onDelete: (nodeId: string) => {
            applySnapshot((snapshot) => ({
              ...snapshot,
              nodes: snapshot.nodes.filter((n) => n.id !== nodeId),
              edges: snapshot.edges.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId,
              ),
            }));
          },
          onDuplicate: (nodeId: string) => {
            applySnapshot((snapshot) => {
              const { duplicatedNodes, idMap } = duplicateNodes(
                snapshot.nodes,
                [nodeId],
              );
              const duplicatedLinkedEdges = duplicateEdges(
                snapshot.edges,
                idMap,
              );
              return {
                ...snapshot,
                nodes: [...clearSelection(snapshot.nodes), ...duplicatedNodes],
                edges: [
                  ...clearSelection(snapshot.edges),
                  ...duplicatedLinkedEdges,
                ],
              };
            });
          },
          onBringToFront: (nodeId: string) => {
            applySnapshot((snapshot) => {
              const idx = snapshot.nodes.findIndex((n) => n.id === nodeId);
              if (idx < 0) {
                return snapshot;
              }
              const node = snapshot.nodes[idx];
              if (!node) {
                return snapshot;
              }
              const next = snapshot.nodes.filter((n) => n.id !== nodeId);
              return { ...snapshot, nodes: [...next, node] };
            });
          },
          onSendToBack: (nodeId: string) => {
            applySnapshot((snapshot) => {
              const idx = snapshot.nodes.findIndex((n) => n.id === nodeId);
              if (idx < 0) {
                return snapshot;
              }
              const node = snapshot.nodes[idx];
              if (!node) {
                return snapshot;
              }
              const next = snapshot.nodes.filter((n) => n.id !== nodeId);
              return { ...snapshot, nodes: [node, ...next] };
            });
          },
          onQuickColor: (nodeId: string, color: string) => {
            applySnapshot((snapshot) => {
              const current = snapshot.nodes.find((n) => n.id === nodeId);
              if (!current) {
                return snapshot;
              }
              const isPrimitiveShape =
                typeof current.type === 'string' &&
                current.type.startsWith('shape-');
              const stylePatch = isPrimitiveShape
                ? { fillColor: color }
                : { backgroundColor: color };
              return {
                ...snapshot,
                nodes: updateNodeStyle(snapshot.nodes, nodeId, stylePatch),
              };
            });
          },
          onGroup: (nodeId: string) => {
            applySnapshot((snapshot) => {
              const selected = snapshot.nodes.filter((n) => n.selected);
              const selectedIds = selected.map((n) => n.id);
              const ids = selectedIds.includes(nodeId) ? selectedIds : [nodeId];

              if (ids.length < 2) {
                return snapshot;
              }

              return {
                ...snapshot,
                nodes: groupNodes(snapshot.nodes, ids),
              };
            });
          },
          onFocus: (nodeId: string) => {
            const target = reactFlow.getNode(nodeId);
            if (!target) {
              return;
            }
            void reactFlow.setCenter(
              target.position.x + (Number(target.width ?? 0) / 2 || 0),
              target.position.y + (Number(target.height ?? 0) / 2 || 0),
              {
                zoom: Math.max(1.1, reactFlow.getViewport().zoom),
                duration: 220,
              },
            );
          },
          onPatchData: (
            nodeId: string,
            patch: Partial<DiagramNode['data']>,
            options?: { recordHistory?: boolean },
          ) => {
            applySnapshot(
              (snapshot) => ({
                ...snapshot,
                nodes: snapshot.nodes.map((current) => {
                  if (current.id !== nodeId) {
                    return current;
                  }

                  const mergedStyle =
                    patch.style !== undefined
                      ? { ...(current.data.style ?? {}), ...patch.style }
                      : current.data.style;

                  const nextData: DiagramNodeData = {
                    ...current.data,
                    ...patch,
                    ...(mergedStyle !== undefined
                      ? { style: mergedStyle }
                      : {}),
                  };

                  let nextNodeWrapperStyle = { ...(current.style ?? {}) };
                  const w = mergedStyle?.width;
                  const h = mergedStyle?.height;
                  if (typeof w === 'number' && Number.isFinite(w)) {
                    nextNodeWrapperStyle = {
                      ...nextNodeWrapperStyle,
                      width: w,
                    };
                  }
                  if (typeof h === 'number' && Number.isFinite(h)) {
                    nextNodeWrapperStyle = {
                      ...nextNodeWrapperStyle,
                      height: h,
                      minHeight: h,
                    };
                  }

                  return {
                    ...current,
                    style: nextNodeWrapperStyle,
                    data: nextData,
                  };
                }),
              }),
              { recordHistory: options?.recordHistory ?? false },
            );
          },
          onFinishEdit: (nodeId: string, label: string) => {
            applySnapshot(
              (snapshot) => ({
                ...snapshot,
                nodes: updateNodeLabel(snapshot.nodes, nodeId, label),
              }),
              { recordHistory: true },
            );
            setEditingNodeId(null);
          },
        } satisfies FlowNodeData,
      })),
    [
      applySnapshot,
      editingNodeId,
      intersectingNodeIds,
      neighborhood,
      present.nodes,
      reactFlow,
    ],
  );

  const renderEdges = useMemo(
    () =>
      present.edges.map((edge) => {
        const renderable = createRenderableEdge(edge);
        return {
          ...renderable,
          style: {
            ...(renderable.style ?? {}),
            opacity: neighborhood
              ? neighborhood.neighborEdgeIds.has(edge.id)
                ? 1
                : 0.15
              : 1,
          },
        };
      }),
    [neighborhood, present.edges],
  );

  const persist = useCallback(
    async (mode: 'auto' | 'manual' = 'auto') => {
      setSaveState('Saving...');
      const viewport = getViewportSnapshot(reactFlow);
      const resolvedSnapshot: DiagramSnapshot = {
        ...present,
        viewport,
      };

      await updateDiagram.mutateAsync({
        diagramId: diagram.id,
        updater: (current) => {
          const nextDiagram = buildDiagramPatch(current, resolvedSnapshot);

          if (mode === 'manual') {
            return {
              ...nextDiagram,
              versions: [
                ...(current.versions ?? []),
                createVersionSnapshot(
                  resolvedSnapshot,
                  `Manual save: ${resolvedSnapshot.name}`,
                ),
              ].slice(-25),
            };
          }

          return nextDiagram;
        },
      });

      baselineRef.current = JSON.stringify(resolvedSnapshot);
      applySnapshot((snapshot) => ({ ...snapshot, viewport }), {
        recordHistory: false,
      });
      setSaveState('Saved');
    },
    [applySnapshot, diagram.id, present, reactFlow, updateDiagram],
  );

  useEffect(() => {
    const serialized = JSON.stringify(present);

    if (!baselineRef.current || baselineRef.current === serialized) {
      return;
    }

    setSaveState('Unsaved changes');
    const timeout = window.setTimeout(() => {
      void persist('auto');
    }, AUTO_SAVE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [persist, present]);

  const handleAddNode = useCallback(
    (
      nodeType: DiagramNodeType,
      position?: XYPosition,
      dataPatch?: Partial<DiagramNode['data']>,
    ) => {
      applySnapshot((snapshot) => ({
        ...snapshot,
        edges: clearSelection(snapshot.edges),
        nodes: [
          ...clearSelection(snapshot.nodes),
          createNode(snapshot.nodes, nodeType, position, dataPatch),
        ],
      }));
      setEditingNodeId(null);
    },
    [applySnapshot],
  );

  const handleAddBlock = useCallback(
    (item: BlockLibraryNodeItem, position?: XYPosition) => {
      handleAddNode(item.nodeType, position, {
        label: item.defaultData?.label ?? item.label,
        icon: item.defaultData?.icon ?? item.iconName,
        style: item.defaultData?.style,
        tags: item.defaultData?.tags ?? [],
        badgeLabel: item.defaultData?.badgeLabel,
        helperType: item.defaultData?.helperType,
        showHelperTypeBadge: item.defaultData?.showHelperTypeBadge,
      });
    },
    [handleAddNode],
  );

  const addBlockAtCenter = useCallback(
    (item: BlockLibraryNodeItem) => {
      const wrapper = canvasRef.current;

      if (!wrapper) {
        handleAddBlock(item);
        return;
      }

      const rect = wrapper.getBoundingClientRect();
      const center = reactFlow.screenToFlowPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });

      handleAddBlock(item, {
        x: center.x + present.nodes.length * 18,
        y: center.y + present.nodes.length * 18,
      });
    },
    [handleAddBlock, present.nodes.length, reactFlow],
  );

  const handleNodeChanges = useCallback(
    (changes: NodeChange<DiagramNode>[]) => {
      const effectiveChanges = snapToGrid
        ? changes.map((change) => {
            if (
              change.type === 'position' &&
              change.position &&
              typeof change.position.x === 'number' &&
              typeof change.position.y === 'number'
            ) {
              return {
                ...change,
                position: {
                  x: snapValue(change.position.x),
                  y: snapValue(change.position.y),
                },
              };
            }
            return change;
          })
        : changes;

      applySnapshot(
        (snapshot) => ({
          ...snapshot,
          nodes: applyNodeChanges(effectiveChanges, snapshot.nodes).map(
            (node) => {
              if (node.type === 'helper') {
                const width = Number(node.width ?? node.style?.width);
                const height = Number(
                  node.height ?? node.style?.height ?? node.style?.minHeight,
                );

                if (!Number.isFinite(width) && !Number.isFinite(height)) {
                  return node;
                }

                const nextStyle = { ...(node.data.style ?? {}) };

                if (Number.isFinite(width)) {
                  nextStyle.width = width;
                }
                if (Number.isFinite(height)) {
                  nextStyle.height = height;
                }

                return {
                  ...node,
                  style: {
                    ...(node.style ?? {}),
                    ...(Number.isFinite(width) ? { width } : {}),
                    ...(Number.isFinite(height)
                      ? { height, minHeight: height }
                      : {}),
                  },
                  data: { ...node.data, style: nextStyle },
                };
              }

              if (
                typeof node.type !== 'string' ||
                !node.type.startsWith('shape-')
              ) {
                return node;
              }

              const width = Number(node.width ?? node.style?.width);
              const height = Number(
                node.height ?? node.style?.height ?? node.style?.minHeight,
              );

              if (!Number.isFinite(width) && !Number.isFinite(height)) {
                return node;
              }

              const nextStyle = { ...(node.data.style ?? {}) };

              if (node.type === 'shape-circle') {
                const size = Math.max(
                  96,
                  Number.isFinite(width) ? width : 0,
                  Number.isFinite(height) ? height : 0,
                );
                nextStyle.width = size;
                nextStyle.height = size;
                return {
                  ...node,
                  style: {
                    ...(node.style ?? {}),
                    width: size,
                    height: size,
                    minHeight: size,
                  },
                  data: { ...node.data, style: nextStyle },
                };
              }

              if (Number.isFinite(width)) {
                nextStyle.width = width;
              }
              if (Number.isFinite(height)) {
                nextStyle.height = height;
              }

              return {
                ...node,
                style: {
                  ...(node.style ?? {}),
                  ...(Number.isFinite(width) ? { width } : {}),
                  ...(Number.isFinite(height)
                    ? { height, minHeight: height }
                    : {}),
                },
                data: { ...node.data, style: nextStyle },
              };
            },
          ),
        }),
        { recordHistory: false },
      );
    },
    [applySnapshot, snapToGrid],
  );

  const handleEdgeChanges = useCallback(
    (changes: EdgeChange<DiagramEdge>[]) => {
      applySnapshot(
        (snapshot) => ({
          ...snapshot,
          edges: applyEdgeChanges(changes, snapshot.edges),
        }),
        { recordHistory: false },
      );
    },
    [applySnapshot],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      applySnapshot((snapshot) => ({
        ...snapshot,
        edges: addEdge(
          createRenderableEdge({
            ...createEdge({
              source: connection.source,
              target: connection.target,
              sourceHandle: connection.sourceHandle,
              targetHandle: connection.targetHandle,
            }),
            selected: true,
          }),
          clearSelection(snapshot.edges),
        ),
      }));
    },
    [applySnapshot],
  );

  const handleReconnect = useCallback(
    (oldEdge: DiagramEdge, connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }

      applySnapshot((snapshot) => ({
        ...snapshot,
        edges: reconnectEdge(oldEdge, connection, snapshot.edges).map((edge) =>
          createRenderableEdge(edge),
        ),
      }));
    },
    [applySnapshot],
  );

  const deleteSelection = useCallback(() => {
    const selectedNodeIdSet = new Set(selectedNodeIds);
    const selectedEdgeIdSet = new Set(selectedEdges.map((edge) => edge.id));

    applySnapshot((snapshot) => ({
      ...snapshot,
      nodes: snapshot.nodes.filter((node) => !selectedNodeIdSet.has(node.id)),
      edges: snapshot.edges.filter(
        (edge) =>
          !selectedEdgeIdSet.has(edge.id) &&
          !selectedNodeIdSet.has(edge.source) &&
          !selectedNodeIdSet.has(edge.target),
      ),
    }));
    setEditingNodeId(null);
  }, [applySnapshot, selectedEdges, selectedNodeIds]);

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdge) {
      return;
    }

    applySnapshot((snapshot) => ({
      ...snapshot,
      edges: snapshot.edges.filter((edge) => edge.id !== selectedEdge.id),
    }));
  }, [applySnapshot, selectedEdge]);

  const duplicateSelection = useCallback(() => {
    if (selectedNodeIds.length === 0) {
      return;
    }

    applySnapshot((snapshot) => {
      const { duplicatedNodes, idMap } = duplicateNodes(
        snapshot.nodes,
        selectedNodeIds,
      );
      const duplicatedLinkedEdges = duplicateEdges(snapshot.edges, idMap);

      return {
        ...snapshot,
        nodes: [...clearSelection(snapshot.nodes), ...duplicatedNodes],
        edges: [...clearSelection(snapshot.edges), ...duplicatedLinkedEdges],
      };
    });
  }, [applySnapshot, selectedNodeIds]);

  const copySelection = useCallback(() => {
    if (selectedNodeIds.length === 0) {
      return;
    }

    const selectedIdSet = new Set(selectedNodeIds);
    clipboardRef.current = {
      nodes: present.nodes.filter((node) => selectedIdSet.has(node.id)),
      edges: present.edges.filter(
        (edge) =>
          selectedIdSet.has(edge.source) && selectedIdSet.has(edge.target),
      ),
    };
  }, [present.edges, present.nodes, selectedNodeIds]);

  const pasteSelection = useCallback(() => {
    if (clipboardRef.current.nodes.length === 0) {
      return;
    }

    applySnapshot((snapshot) => {
      const { duplicatedNodes, idMap } = duplicateNodes(
        clipboardRef.current.nodes,
        clipboardRef.current.nodes.map((node) => node.id),
        { x: 48, y: 48 },
      );
      const duplicatedLinkedEdges = duplicateEdges(
        clipboardRef.current.edges,
        idMap,
      );

      return {
        ...snapshot,
        nodes: [...clearSelection(snapshot.nodes), ...duplicatedNodes],
        edges: [...clearSelection(snapshot.edges), ...duplicatedLinkedEdges],
      };
    });
  }, [applySnapshot]);

  const handleGroupSelection = useCallback(() => {
    if (!canGroup) {
      return;
    }

    applySnapshot((snapshot) => ({
      ...snapshot,
      nodes: groupNodes(snapshot.nodes, selectedNodeIds),
    }));
  }, [applySnapshot, canGroup, selectedNodeIds]);

  const handleUngroupSelection = useCallback(() => {
    const groupId =
      selectedNode?.type === 'group'
        ? selectedNode.id
        : selectedNodes.find((node) => node.groupId)?.groupId;

    if (!groupId) {
      return;
    }

    applySnapshot((snapshot) => ({
      ...snapshot,
      nodes: ungroupNodes(snapshot.nodes, groupId),
    }));
  }, [applySnapshot, selectedNode, selectedNodes]);

  const handleNodeDragStart = useCallback(() => {
    dragStartRef.current = history.present;
  }, [history.present]);

  const handleNodeDrag = useCallback(
    (_event: React.MouseEvent, draggingNode: DiagramNode) => {
      const wrapper = canvasRef.current;
      const nodesWithDragPosition = present.nodes.map((node) =>
        node.id === draggingNode.id
          ? { ...node, position: draggingNode.position }
          : node,
      );
      const nextGuides = snapToGrid
        ? getSnapGuides(draggingNode, present.nodes)
        : { vertical: [] as number[], horizontal: [] as number[] };

      if (wrapper && snapToGrid) {
        const rect = wrapper.getBoundingClientRect();
        setScreenGuides({
          vertical: nextGuides.vertical.map(
            (x) => reactFlow.flowToScreenPosition({ x, y: 0 }).x - rect.left,
          ),
          horizontal: nextGuides.horizontal.map(
            (y) => reactFlow.flowToScreenPosition({ x: 0, y }).y - rect.top,
          ),
        });
      } else {
        setScreenGuides({ vertical: [], horizontal: [] });
      }

      setIntersectingNodeIds(
        detectNodeIntersections(nodesWithDragPosition, draggingNode.id),
      );
    },
    [present.nodes, reactFlow, snapToGrid],
  );

  const handleNodeDragStop = useCallback(() => {
    setScreenGuides({ vertical: [], horizontal: [] });
    setIntersectingNodeIds([]);
    setHistory((current) => {
      const start = dragStartRef.current;

      if (!start || JSON.stringify(start) === JSON.stringify(current.present)) {
        return current;
      }

      return {
        past: [...current.past, start].slice(-100),
        future: [],
        present: current.present,
      };
    });
    dragStartRef.current = null;
  }, []);

  const handleUndo = useCallback(() => {
    setHistory((current) => undoHistory(current));
  }, []);

  const handleRedo = useCallback(() => {
    setHistory((current) => redoHistory(current));
  }, []);

  const handleZoomToSelection = useCallback(() => {
    if (selectedNodes.length === 0) {
      return;
    }

    void reactFlow.fitView({
      nodes: selectedNodes.map((node) => ({ id: node.id })),
      padding: 0.4,
      duration: 200,
    });
  }, [reactFlow, selectedNodes]);

  const handleCenterSelection = useCallback(() => {
    if (selectedNodes.length === 0) {
      return;
    }

    const bounds = getSelectionBounds(selectedNodes);

    if (!bounds) {
      return;
    }

    void reactFlow.setCenter(
      bounds.x + bounds.width / 2,
      bounds.y + bounds.height / 2,
      {
        duration: 200,
        zoom: 1.15,
      },
    );
  }, [reactFlow, selectedNodes]);

  const handleNodeLabelChange = useCallback(
    (label: string) => {
      if (!selectedNode) {
        return;
      }

      applySnapshot(
        (snapshot) => ({
          ...snapshot,
          nodes: updateNodeLabel(snapshot.nodes, selectedNode.id, label),
        }),
        { recordHistory: false },
      );
    },
    [applySnapshot, selectedNode],
  );

  const handleNodeStyleChange = useCallback(
    (style: DiagramNodeStyle) => {
      if (!selectedNode) {
        return;
      }

      applySnapshot((snapshot) => ({
        ...snapshot,
        nodes: updateNodeStyle(snapshot.nodes, selectedNode.id, style),
      }));
    },
    [applySnapshot, selectedNode],
  );

  const handleNodeDataPatch = useCallback(
    (patch: Partial<DiagramNodeData>) => {
      if (!selectedNode) {
        return;
      }

      applySnapshot((snapshot) => ({
        ...snapshot,
        nodes: updateNodeData(snapshot.nodes, selectedNode.id, (current) => ({
          ...current,
          ...patch,
          style: {
            ...current.style,
            ...(patch.style ?? {}),
          },
        })),
      }));
    },
    [applySnapshot, selectedNode],
  );

  const handleEdgeLabelChange = useCallback(
    (label: string) => {
      if (!selectedEdge) {
        return;
      }

      applySnapshot(
        (snapshot) => ({
          ...snapshot,
          edges: updateEdgeData(snapshot.edges, selectedEdge.id, { label }),
        }),
        { recordHistory: false },
      );
    },
    [applySnapshot, selectedEdge],
  );

  const handleEdgeStyleChange = useCallback(
    (payload: {
      edgeType?: DiagramEdgeType;
      color?: string;
      width?: number;
      lineStyle?: DiagramEdgeLineStyle;
      markerKind?: DiagramEdgeMarkerKind;
      markerPosition?: DiagramEdgeMarkerPosition;
      animated?: boolean;
      labelColor?: string;
      labelFontSize?: number;
      labelBackgroundColor?: string;
      labelBorderColor?: string;
    }) => {
      if (!selectedEdge) {
        return;
      }

      applySnapshot((snapshot) => ({
        ...snapshot,
        edges: updateEdgeData(snapshot.edges, selectedEdge.id, payload),
      }));
    },
    [applySnapshot, selectedEdge],
  );

  const handleNodeTagsChange = useCallback(
    (tags: string[]) => {
      if (!selectedNode) {
        return;
      }

      applySnapshot((snapshot) => ({
        ...snapshot,
        nodes: updateNodeTags(snapshot.nodes, selectedNode.id, tags),
      }));
    },
    [applySnapshot, selectedNode],
  );

  const handleNodeIconChange = useCallback(
    (icon?: string | null) => {
      if (!selectedNode) {
        return;
      }

      applySnapshot((snapshot) => ({
        ...snapshot,
        nodes: updateNodeIcon(snapshot.nodes, selectedNode.id, icon),
      }));
    },
    [applySnapshot, selectedNode],
  );

  const handleNodeBadgeLabelChange = useCallback(
    (value: string | undefined) => {
      if (!selectedNode) {
        return;
      }

      applySnapshot((snapshot) => ({
        ...snapshot,
        nodes: updateNodeBadgeLabel(snapshot.nodes, selectedNode.id, value),
      }));
    },
    [applySnapshot, selectedNode],
  );

  const handleDiagramDescriptionChange = useCallback(
    (value: string) => {
      applySnapshot(
        (snapshot) => ({
          ...snapshot,
          description: value,
        }),
        { recordHistory: false },
      );
    },
    [applySnapshot],
  );

  const handleDiagramTagsChange = useCallback(
    (value: string) => {
      applySnapshot(
        (snapshot) => ({
          ...snapshot,
          tags: value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
        { recordHistory: false },
      );
    },
    [applySnapshot],
  );

  const handleExport = useCallback(
    async ({
      format,
      includeBackground,
      scope,
    }: {
      format: ExportFormat;
      includeBackground: boolean;
      scope: ExportScope;
    }) => {
      const wrapper = canvasRef.current;

      if (!wrapper) {
        return;
      }

      setEditingNodeId(null);
      const exportTarget = createCleanExportTarget({
        canvasElement: wrapper,
        nodes: present.nodes,
        viewport: getViewportSnapshot(reactFlow),
        scope,
        includeBackground,
      });

      try {
        await exportDiagram(format, exportTarget, {
          fileName: `${present.name || 'diagram'}-${scope}`,
          includeBackground,
          scope,
        });
        const ext = format === 'png' ? 'PNG' : 'PDF';
        toast({
          message: `Exported "${present.name || 'diagram'}" as ${ext}.`,
          tone: 'success',
        });
      } catch {
        toast({
          message:
            'Export failed. Try a smaller diagram or a different format.',
          tone: 'error',
        });
      } finally {
        exportTarget.cleanup();
      }
    },
    [present.name, present.nodes, reactFlow, toast],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable;

      if (isTypingTarget) {
        if (
          (event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === 's'
        ) {
          event.preventDefault();
          void persist('manual');
        }

        return;
      }

      const modifierPressed = event.metaKey || event.ctrlKey;

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelection();
      }

      if (!modifierPressed) {
        return;
      }

      if (event.key === '/') {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        copySelection();
      }

      if (event.key.toLowerCase() === 'v') {
        event.preventDefault();
        pasteSelection();
      }

      if (event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicateSelection();
      }

      if (event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault();
        handleRedo();
      } else if (event.key.toLowerCase() === 'z') {
        event.preventDefault();
        handleUndo();
      }

      if (event.key.toLowerCase() === 's') {
        event.preventDefault();
        void persist('manual');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    copySelection,
    deleteSelection,
    duplicateSelection,
    handleRedo,
    handleUndo,
    pasteSelection,
    persist,
    setShortcutsOpen,
  ]);

  return (
    <div className="space-y-4" data-testid="editor-page">
      <EditorToolbar
        diagramName={present.name}
        saveStatus={saveState}
        zoomPercent={toolbarZoomPercent}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        leftSidebarOpen={leftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        onRenameDiagram={(name) =>
          applySnapshot(
            (snapshot) => ({
              ...snapshot,
              name,
            }),
            { recordHistory: false },
          )
        }
        onSave={() => void persist('manual')}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onFitView={() =>
          void reactFlow.fitView({ duration: 250, padding: 0.2 })
        }
        onZoomIn={() => void reactFlow.zoomIn({ duration: 200 })}
        onZoomOut={() => void reactFlow.zoomOut({ duration: 200 })}
        onZoomTo100={() => {
          const viewport = reactFlow.getViewport();
          void reactFlow.setViewport(
            { ...viewport, zoom: 1 },
            { duration: 200 },
          );
        }}
        onZoomToSelection={handleZoomToSelection}
        onCenterSelection={handleCenterSelection}
        onToggleLeftSidebar={() => setLeftSidebarOpen((current) => !current)}
        onToggleRightSidebar={() => setRightSidebarOpen((current) => !current)}
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        onToggleGrid={() => setShowGrid((current) => !current)}
        onToggleSnap={() => setSnapToGrid((current) => !current)}
        onShowShortcuts={() => setShortcutsOpen(true)}
        onExport={handleExport}
      />
      <div className="flex min-h-[calc(100vh-12rem)] items-stretch gap-4">
        {leftSidebarOpen ? (
          <div className="w-full max-w-[384px] shrink-0">
            <EditorSidebar
              selectedNodeCount={selectedNodes.length}
              selectedEdgeCount={selectedEdges.length}
              canGroup={canGroup}
              canUngroup={canUngroup}
              onAddBlock={addBlockAtCenter}
              onDeleteSelection={deleteSelection}
              onDuplicateSelection={duplicateSelection}
              onGroupSelection={handleGroupSelection}
              onUngroupSelection={handleUngroupSelection}
            />
          </div>
        ) : null}
        <div
          ref={canvasRef}
          className="flowcraft-canvas relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-canvas shadow-card"
          data-testid="react-flow-wrapper"
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();
            const serialized = event.dataTransfer.getData(
              'application/flowcraft-block-item',
            );

            if (!serialized) {
              return;
            }

            const item = JSON.parse(serialized) as BlockLibraryNodeItem;
            const position = reactFlow.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });

            handleAddBlock(item, position);
          }}
        >
          {present.nodes.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
              <div className="max-w-md rounded-2xl border border-border bg-background-elevated/90 p-5 text-center shadow-floating backdrop-blur">
                <p className="text-sm font-semibold text-text">
                  Drag a block from the library to start
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Tip: select a node to edit style, border, and tags on the
                  right. Press <span className="font-mono">Ctrl+/</span> or{' '}
                  <span className="font-mono">⌘/</span> to see shortcuts.
                </p>
              </div>
            </div>
          ) : null}
          <EdgeMarkerDefs />
          <div className="pointer-events-none absolute inset-0 z-10">
            {screenGuides.vertical.map((x, index) => (
              <div
                key={`vertical-guide-${index}`}
                className="absolute top-0 h-full w-px bg-primary/40"
                style={{ left: `${x}px` }}
              />
            ))}
            {screenGuides.horizontal.map((y, index) => (
              <div
                key={`horizontal-guide-${index}`}
                className="absolute left-0 w-full border-t border-dashed border-primary/40"
                style={{ top: `${y}px` }}
              />
            ))}
          </div>
          <ReactFlow
            className="h-full min-h-0"
            fitView
            onlyRenderVisibleElements
            proOptions={{ hideAttribution: true }}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            nodes={renderNodes}
            edges={renderEdges}
            defaultEdgeOptions={{
              ...createRenderableEdge(createEdge({ source: 'a', target: 'b' })),
              reconnectable: true,
            }}
            edgesReconnectable
            onReconnect={handleReconnect}
            snapToGrid={snapToGrid}
            snapGrid={[DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE]}
            connectOnClick
            deleteKeyCode={null}
            multiSelectionKeyCode="Shift"
            selectionMode={SelectionMode.Partial}
            selectionOnDrag
            onNodesChange={handleNodeChanges}
            onEdgesChange={handleEdgeChanges}
            isValidConnection={(connection) =>
              validateConnection(connection as Connection, present.nodes)
                .allowed
            }
            onConnect={handleConnect}
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={handleNodeDrag}
            onNodeDragStop={handleNodeDragStop}
            onNodeClick={(event, node) => {
              if (event.shiftKey) {
                return;
              }

              applySnapshot(
                (snapshot) => ({
                  ...snapshot,
                  nodes: selectSingleNode(snapshot.nodes, node.id),
                  edges: clearSelection(snapshot.edges),
                }),
                { recordHistory: false },
              );
            }}
            onEdgeClick={(_event, edge) => {
              applySnapshot(
                (snapshot) => ({
                  ...snapshot,
                  nodes: clearSelection(snapshot.nodes),
                  edges: snapshot.edges.map((currentEdge) => ({
                    ...currentEdge,
                    selected: currentEdge.id === edge.id,
                  })),
                }),
                { recordHistory: false },
              );
            }}
            onNodeDoubleClick={(_event, node) => setEditingNodeId(node.id)}
            onPaneClick={() => {
              setEditingNodeId(null);
            }}
            onMoveEnd={() => setSaveState('Unsaved changes')}
          >
            {showGrid ? (
              <Background
                variant={BackgroundVariant.Dots}
                color="var(--color-canvas-grid)"
                gap={DEFAULT_GRID_SIZE}
                size={3.5}
              />
            ) : null}
            <FlowZoomReporter onZoom={handleFlowZoom} />
            <MiniMap pannable zoomable />
            <Controls />
          </ReactFlow>
          {present.nodes.length === 0 ? (
            <div
              className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center px-6"
              data-testid="canvas-empty-hint"
            >
              <div className="max-w-md rounded-2xl border border-dashed border-border-strong bg-canvas/95 px-6 py-5 text-center shadow-soft backdrop-blur-sm">
                <p className="text-sm font-semibold text-text">
                  Drag blocks from the left panel
                </p>
                <p className="mt-2 text-sm text-text-muted">
                  Click a library item to drop it near the center, or drag it
                  onto the canvas. Connect nodes by dragging from one handle to
                  another.
                </p>
              </div>
            </div>
          ) : null}
        </div>
        {rightSidebarOpen ? (
          <div className="w-full max-w-[384px] shrink-0">
            <EditorPropertiesPanel
              diagram={{
                description: present.description,
                tags: present.tags,
              }}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onChangeNodeLabel={handleNodeLabelChange}
              onChangeNodeStyle={handleNodeStyleChange}
              onChangeNodeTags={handleNodeTagsChange}
              onChangeNodeIcon={handleNodeIconChange}
              onChangeNodeBadgeLabel={handleNodeBadgeLabelChange}
              onPatchNodeData={handleNodeDataPatch}
              onChangeEdgeLabel={handleEdgeLabelChange}
              onChangeEdgeStyle={handleEdgeStyleChange}
              onDeleteEdge={deleteSelectedEdge}
              onChangeDiagramDescription={handleDiagramDescriptionChange}
              onChangeDiagramTags={handleDiagramTagsChange}
            />
          </div>
        ) : null}
      </div>
      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

export function DiagramEditorPage() {
  const { diagramId } = useParams();
  const diagramQuery = useDiagram(diagramId ?? '');

  if (!diagramId) {
    return <Navigate to="/" replace />;
  }

  if (diagramQuery.isLoading) {
    return (
      <div className="py-12 text-center text-text-muted">
        Loading diagram...
      </div>
    );
  }

  if (!diagramQuery.data) {
    return <Navigate to="/" replace />;
  }

  return (
    <ReactFlowProvider>
      <EditorCanvas diagram={diagramQuery.data} />
    </ReactFlowProvider>
  );
}
