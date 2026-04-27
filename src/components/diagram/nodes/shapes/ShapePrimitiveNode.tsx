import {
  IconArrowsMaximize,
  IconCopy,
  IconLayersOff,
  IconLayersSubtract,
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
import { memo, useEffect, useMemo, useRef } from 'react';

import { ToolbarQuickFillPicker } from '@components/diagram/ToolbarQuickFillPicker';
import { Tooltip } from '@components/ui/Tooltip';

import {
  resolveNodeBackgroundColor,
  resolveNodeBorderColor,
} from '@utils/diagram';
import { duplicateShortcutLabel } from '@utils/platform';

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
  onQuickColor?: (nodeId: string, color: string) => void;
};

const HANDLE_CLASS =
  '!pointer-events-auto !z-[60] !h-4 !w-4 !min-h-[16px] !min-w-[16px] !border-2 !border-handle !bg-canvas !opacity-100 transition duration-fast ease-out-expo';

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

  const fillToken =
    flowData.style?.fillColor ?? flowData.style?.backgroundColor;
  const fillPaint =
    fillToken === undefined ||
    fillToken === 'transparent' ||
    String(fillToken).trim() === ''
      ? 'transparent'
      : resolveNodeBackgroundColor(String(fillToken));

  const borderToken = flowData.style?.borderColor;
  const strokePaint =
    borderToken === undefined || borderToken === 'transparent'
      ? resolveNodeBorderColor(undefined)
      : resolveNodeBorderColor(String(borderToken));
  const borderWidth = Math.max(0, Number(flowData.style?.borderWidth ?? 1));
  const borderStyle =
    flowData.style?.borderStyle === 'dashed' ||
    flowData.style?.borderStyle === 'dotted'
      ? flowData.style.borderStyle
      : 'solid';
  const textColor = String(flowData.style?.textColor ?? 'var(--color-text)');
  const fontSizePx = Math.max(10, Number(flowData.style?.fontSize ?? 14));
  const labelText = String(flowData.label ?? '');
  const trimmedLabel = labelText.trim();
  const showTextOverlay = flowData.isEditing || trimmedLabel.length > 0;

  const keepAspectRatio = kind === 'circle';
  const connectable = kind !== 'plus';

  const pathD = useMemo(() => getShapePath(kind), [kind]);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!flowData.isEditing) return;
    editTextareaRef.current?.focus();
  }, [flowData.isEditing]);

  return (
    <div
      className="relative h-full w-full"
      data-testid={`diagram-node-${id}`}
      onDoubleClick={(event) => {
        event.stopPropagation();
        flowData.onStartEdit?.(id);
      }}
    >
      {selected ? (
        <NodeToolbar
          isVisible={Boolean(selected)}
          position={Position.Top}
          className="nodrag nopan !z-[200]"
          data-testid={`node-toolbar-root-${id}`}
        >
          <div
            className="nodrag nopan flex items-center gap-2 rounded-xl border border-border bg-background-elevated px-2 py-2 shadow-card"
            data-testid={`node-toolbar-actions-${id}`}
          >
            <Tooltip
              content={`Duplicate · ${duplicateShortcutLabel()}`}
              compact
              delayMs={280}
            >
              <button
                type="button"
                className="nodrag nopan flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                aria-label="Duplicate"
                onClick={() => flowData.onDuplicate?.(id)}
                data-testid={`node-toolbar-duplicate-${id}`}
              >
                <IconCopy className="h-5 w-5" stroke={1.9} aria-hidden />
              </button>
            </Tooltip>
            <Tooltip content="Delete from diagram" compact delayMs={280}>
              <button
                type="button"
                className="nodrag nopan flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-danger-soft hover:text-danger-text"
                aria-label="Delete"
                onClick={() => flowData.onDelete?.(id)}
                data-testid={`node-toolbar-delete-${id}`}
              >
                <IconTrash className="h-5 w-5" stroke={1.9} aria-hidden />
              </button>
            </Tooltip>
            <Tooltip
              content="Bring in front of overlapping nodes"
              compact
              delayMs={280}
            >
              <button
                type="button"
                className="nodrag nopan flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                aria-label="Bring to front"
                onClick={() => flowData.onBringToFront?.(id)}
                data-testid={`node-toolbar-front-${id}`}
              >
                <IconLayersOff className="h-5 w-5" stroke={1.9} aria-hidden />
              </button>
            </Tooltip>
            <Tooltip
              content="Send behind overlapping nodes"
              compact
              delayMs={280}
            >
              <button
                type="button"
                className="nodrag nopan flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                aria-label="Send to back"
                onClick={() => flowData.onSendToBack?.(id)}
                data-testid={`node-toolbar-send-back-${id}`}
              >
                <IconLayersSubtract
                  className="h-5 w-5"
                  stroke={1.9}
                  aria-hidden
                />
              </button>
            </Tooltip>
            <ToolbarQuickFillPicker
              nodeId={id}
              onSelectColor={(nodeId, color) =>
                flowData.onQuickColor?.(nodeId, color)
              }
            />
            <Tooltip content="Center view on this shape" compact delayMs={280}>
              <button
                type="button"
                className="nodrag nopan flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                aria-label="Focus node"
                onClick={() => flowData.onFocus?.(id)}
                data-testid={`node-toolbar-focus-${id}`}
              >
                <IconArrowsMaximize
                  className="h-5 w-5"
                  stroke={1.9}
                  aria-hidden
                />
              </button>
            </Tooltip>
          </div>
        </NodeToolbar>
      ) : null}

      <NodeResizer
        isVisible={selected}
        keepAspectRatio={keepAspectRatio}
        minWidth={keepAspectRatio ? 96 : 120}
        minHeight={keepAspectRatio ? 96 : 90}
        lineClassName="!border-primary"
        handleClassName="!z-50 !h-3 !w-3 !border-2 !border-primary !bg-canvas"
      />

      <div
        className="relative z-0 h-full w-full min-h-[48px]"
        data-testid={`shape-body-${id}`}
      >
        <div
          className="pointer-events-none relative z-0 h-full w-full min-h-[48px]"
          data-testid={`shape-svg-wrap-${id}`}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="block h-full w-full"
            aria-hidden
            focusable="false"
            data-testid={`shape-svg-${id}`}
          >
            <path
              d={pathD}
              fill={fillPaint}
              stroke={strokePaint}
              strokeWidth={Math.max(1, borderWidth)}
              strokeDasharray={dashArray(borderStyle)}
            />
          </svg>
        </div>

        {showTextOverlay ? (
          <div
            className={clsx(
              'pointer-events-none absolute inset-0 z-[15] flex items-center justify-center px-3 py-3',
              Boolean(flowData.isEditing) &&
                'items-stretch justify-stretch p-3',
            )}
            data-testid={`shape-text-overlay-${id}`}
          >
            {flowData.isEditing ? (
              <textarea
                ref={editTextareaRef}
                defaultValue={labelText}
                className="nodrag pointer-events-auto z-[20] m-0 min-h-[48px] w-full resize-none rounded-md border border-primary/40 bg-background-elevated/95 px-2 py-2 text-center font-medium shadow-soft outline-none ring-2 ring-primary/20"
                style={{
                  color: textColor,
                  fontSize: fontSizePx,
                  lineHeight: 1.35,
                }}
                onBlur={(event) =>
                  flowData.onFinishEdit?.(id, event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    event.currentTarget.blur();
                  }
                }}
                data-testid={`shape-text-edit-${id}`}
              />
            ) : (
              <button
                type="button"
                className="nodrag pointer-events-auto line-clamp-6 max-h-full max-w-full whitespace-pre-wrap break-words text-center font-medium"
                style={{
                  color: textColor,
                  fontSize: fontSizePx,
                  lineHeight: 1.35,
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  flowData.onStartEdit?.(id);
                }}
                data-testid={`shape-text-display-${id}`}
              >
                {trimmedLabel}
              </button>
            )}
          </div>
        ) : null}
      </div>

      {connectable ? (
        <>
          <Handle
            id="t"
            type="target"
            position={Position.Top}
            style={{ left: '50%' }}
            className={HANDLE_CLASS}
            data-testid={`diagram-handle-${id}-target-t`}
          />
          <Handle
            id="r"
            type="target"
            position={Position.Right}
            style={{ top: '50%' }}
            className={HANDLE_CLASS}
            data-testid={`diagram-handle-${id}-target-r`}
          />
          <Handle
            id="b"
            type="target"
            position={Position.Bottom}
            style={{ left: '50%' }}
            className={HANDLE_CLASS}
            data-testid={`diagram-handle-${id}-target-b`}
          />
          <Handle
            id="l"
            type="target"
            position={Position.Left}
            style={{ top: '50%' }}
            className={HANDLE_CLASS}
            data-testid={`diagram-handle-${id}-target-l`}
          />

          <Handle
            id="st"
            type="source"
            position={Position.Top}
            style={{ left: '50%' }}
            className={HANDLE_CLASS}
            data-testid={`diagram-handle-${id}-source-st`}
          />
          <Handle
            id="sr"
            type="source"
            position={Position.Right}
            style={{ top: '50%' }}
            className={HANDLE_CLASS}
            data-testid={`diagram-handle-${id}-source-sr`}
          />
          <Handle
            id="sb"
            type="source"
            position={Position.Bottom}
            style={{ left: '50%' }}
            className={HANDLE_CLASS}
            data-testid={`diagram-handle-${id}-source-sb`}
          />
          <Handle
            id="sl"
            type="source"
            position={Position.Left}
            style={{ top: '50%' }}
            className={HANDLE_CLASS}
            data-testid={`diagram-handle-${id}-source-sl`}
          />
        </>
      ) : null}
    </div>
  );
});
