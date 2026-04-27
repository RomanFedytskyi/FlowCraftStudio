import {
  IconArrowsMaximize,
  IconCopy,
  IconLayersOff,
  IconLayersSubtract,
  IconPalette,
  IconTrash,
} from '@tabler/icons-react';
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  type NodeProps,
} from '@xyflow/react';
import clsx from 'clsx';
import { memo, useMemo } from 'react';

import type {
  DiagramNodeData,
  DiagramNodeType,
} from '../../../../types/diagram';

type ShapeKind =
  | 'circle'
  | 'rectangle'
  | 'rounded-rectangle'
  | 'diamond'
  | 'hexagon'
  | 'triangle'
  | 'parallelogram'
  | 'cylinder'
  | 'arrow-rectangle'
  | 'plus'
  | 'cloud';

type ShapeNodeData = DiagramNodeData & {
  onStartEdit?: (nodeId: string) => void;
  onFinishEdit?: (nodeId: string, label: string) => void;
  onPatchData?: (
    nodeId: string,
    patch: Partial<DiagramNodeData>,
    options?: { recordHistory?: boolean },
  ) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onFocus?: (nodeId: string) => void;
  onBringToFront?: (nodeId: string) => void;
  onSendToBack?: (nodeId: string) => void;
  onQuickColor?: (nodeId: string) => void;
};

const HANDLE_CLASS =
  '!z-20 !h-3 !w-3 !border-2 !bg-canvas !border-border !opacity-80 transition';

function dashArray(style: string | undefined) {
  if (style === 'dashed') return '7 5';
  if (style === 'dotted') return '2 6';
  return undefined;
}

function getShapePath(kind: ShapeKind): string {
  switch (kind) {
    case 'circle':
      return 'M50 4 A46 46 0 1 0 50 96 A46 46 0 1 0 50 4 Z';
    case 'rectangle':
      return 'M0 0 H100 V100 H0 Z';
    case 'rounded-rectangle':
      return 'M12 0 H88 Q100 0 100 12 V88 Q100 100 88 100 H12 Q0 100 0 88 V12 Q0 0 12 0 Z';
    case 'diamond':
      return 'M50 4 L96 50 L50 96 L4 50 Z';
    case 'hexagon':
      return 'M25 6 H75 L96 50 L75 94 H25 L4 50 Z';
    case 'triangle':
      return 'M50 6 L96 94 H4 Z';
    case 'parallelogram':
      return 'M18 10 H96 L82 90 H4 Z';
    case 'cylinder':
      // top ellipse + body + bottom hint, in one path
      return 'M18 20 C18 10 82 10 82 20 V80 C82 90 18 90 18 80 Z M18 20 C18 30 82 30 82 20';
    case 'arrow-rectangle':
      return 'M0 20 H72 L100 50 L72 80 H0 Z';
    case 'plus':
      return 'M38 0 H62 V38 H100 V62 H62 V100 H38 V62 H0 V38 H38 Z';
    case 'cloud':
      return 'M30 78 H76 C88 78 96 70 96 60 C96 50 89 42 80 42 C78 26 66 16 50 16 C34 16 22 26 20 42 C11 42 4 50 4 60 C4 71 13 78 24 78 Z';
  }
}

function resolveShapeKind(
  nodeType: DiagramNodeType,
  dataShape?: unknown,
): ShapeKind {
  if (typeof dataShape === 'string') {
    const s = dataShape as ShapeKind;
    return s;
  }

  if (nodeType.startsWith('shape-')) {
    return nodeType.replace('shape-', '') as ShapeKind;
  }

  return 'rectangle';
}

export const ShapePrimitiveNode = memo(function ShapePrimitiveNode({
  id,
  type,
  data,
  selected,
}: NodeProps) {
  const flowData = data as ShapeNodeData;
  const nodeType = flowData.type ?? type ?? 'shape-rectangle';
  const kind = resolveShapeKind(nodeType, flowData.shape);

  const fill = String(
    flowData.style?.fillColor ??
      flowData.style?.backgroundColor ??
      'transparent',
  );
  const stroke = String(flowData.style?.borderColor ?? 'var(--color-border)');
  const borderWidth = Math.max(0, Number(flowData.style?.borderWidth ?? 1));
  const borderStyle =
    flowData.style?.borderStyle === 'dashed' ||
    flowData.style?.borderStyle === 'dotted'
      ? flowData.style.borderStyle
      : 'solid';
  const textColor = String(flowData.style?.textColor ?? 'var(--color-text)');
  const fontSize = Math.max(10, Number(flowData.style?.fontSize ?? 16));

  const keepAspectRatio = kind === 'circle';
  const connectable = kind !== 'plus';

  const pathD = useMemo(() => getShapePath(kind), [kind]);

  return (
    <div
      className="relative"
      data-testid={`diagram-node-${id}`}
      onDoubleClick={() => flowData.onStartEdit?.(id)}
    >
      {selected ? (
        <NodeToolbar isVisible position={Position.Top}>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background-elevated px-2 py-2 shadow-card">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Duplicate"
              onClick={() => flowData.onDuplicate?.(id)}
            >
              <IconCopy className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-danger-soft hover:text-danger-text"
              aria-label="Delete"
              onClick={() => flowData.onDelete?.(id)}
            >
              <IconTrash className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Bring to front"
              onClick={() => flowData.onBringToFront?.(id)}
            >
              <IconLayersOff className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Send to back"
              onClick={() => flowData.onSendToBack?.(id)}
            >
              <IconLayersSubtract
                className="h-5 w-5"
                stroke={1.9}
                aria-hidden
              />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Quick color"
              onClick={() => flowData.onQuickColor?.(id)}
            >
              <IconPalette className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Focus node"
              onClick={() => flowData.onFocus?.(id)}
            >
              <IconArrowsMaximize
                className="h-5 w-5"
                stroke={1.9}
                aria-hidden
              />
            </button>
          </div>
        </NodeToolbar>
      ) : null}

      <NodeResizer
        isVisible={selected}
        keepAspectRatio={keepAspectRatio}
        minWidth={keepAspectRatio ? 96 : 120}
        minHeight={keepAspectRatio ? 96 : 90}
        lineClassName="!border-primary"
        handleClassName="!z-10 !h-3 !w-3 !border-2 !border-primary !bg-canvas"
      />

      {connectable ? (
        <>
          <Handle
            id="t"
            type="target"
            position={Position.Top}
            style={{ left: '50%' }}
            className={HANDLE_CLASS}
          />
          <Handle
            id="r"
            type="target"
            position={Position.Right}
            style={{ top: '50%' }}
            className={HANDLE_CLASS}
          />
          <Handle
            id="b"
            type="target"
            position={Position.Bottom}
            style={{ left: '50%' }}
            className={HANDLE_CLASS}
          />
          <Handle
            id="l"
            type="target"
            position={Position.Left}
            style={{ top: '50%' }}
            className={HANDLE_CLASS}
          />

          <Handle
            id="st"
            type="source"
            position={Position.Top}
            style={{ left: '50%' }}
            className={HANDLE_CLASS}
          />
          <Handle
            id="sr"
            type="source"
            position={Position.Right}
            style={{ top: '50%' }}
            className={HANDLE_CLASS}
          />
          <Handle
            id="sb"
            type="source"
            position={Position.Bottom}
            style={{ left: '50%' }}
            className={HANDLE_CLASS}
          />
          <Handle
            id="sl"
            type="source"
            position={Position.Left}
            style={{ top: '50%' }}
            className={HANDLE_CLASS}
          />
        </>
      ) : null}

      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="block h-full w-full"
          aria-hidden
          focusable="false"
        >
          <path
            d={pathD}
            fill={fill === 'transparent' ? 'transparent' : fill}
            stroke={stroke === 'transparent' ? 'currentColor' : stroke}
            strokeWidth={Math.max(1, borderWidth)}
            strokeDasharray={dashArray(borderStyle)}
          />
        </svg>

        {flowData.isEditing ? (
          <textarea
            defaultValue={String(flowData.label ?? '')}
            className={clsx(
              'nodrag absolute inset-0 m-0 h-full w-full resize-none bg-transparent px-3 py-3 text-center font-semibold outline-none',
            )}
            style={{
              color: textColor,
              fontSize,
              lineHeight: 1.2,
            }}
            onBlur={(event) => flowData.onFinishEdit?.(id, event.target.value)}
          />
        ) : String(flowData.label ?? '').trim() ? (
          <button
            type="button"
            className="nodrag absolute inset-0 flex h-full w-full items-center justify-center px-3 text-center font-semibold"
            style={{
              color: textColor,
              fontSize,
              lineHeight: 1.2,
              whiteSpace: 'pre-wrap',
            }}
            onClick={() => flowData.onStartEdit?.(id)}
          >
            {String(flowData.label)}
          </button>
        ) : null}
      </div>
    </div>
  );
});
