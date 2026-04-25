import {
  IconArrowsMaximize,
  IconCopy,
  IconLayersOff,
  IconFolders,
  IconPalette,
  IconTrash,
} from '@tabler/icons-react';
import {
  Handle,
  NodeResizer,
  NodeToolbar,
  Position,
  type NodeProps,
  useConnection,
} from '@xyflow/react';
import clsx from 'clsx';
import { memo } from 'react';

import { Badge } from '@components/ui/Badge';

import { getNodeDefinition } from '@configs/diagramNodes';
import { renderIcon } from '@configs/iconLibrary.config';

import {
  DEFAULT_FONT_SIZE,
  resolveNodeBackgroundColor,
  resolveNodeBorderColor,
} from '@utils/diagram';

import type { DiagramNodeData, DiagramNodeType } from '../../../types/diagram';
import type { CSSProperties } from 'react';

export interface FlowNodeData extends DiagramNodeData {
  isEditing?: boolean;
  isSearchMatch?: boolean;
  isIntersecting?: boolean;
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
  onQuickColor?: (nodeId: string) => void;
  onGroup?: (nodeId: string) => void;
}

function IconGlyph({
  iconName,
  nodeType,
  className,
}: {
  iconName?: string;
  nodeType: DiagramNodeType;
  className: string;
}) {
  const resolvedIconName = iconName ?? getNodeDefinition(nodeType).iconName;

  return renderIcon(resolvedIconName, { className, strokeWidth: 1.8 });
}

type HandleKind = 'source' | 'target';

function FlowHandle({
  nodeId,
  handleId,
  type,
  position,
  style,
  selected,
}: {
  nodeId: string;
  handleId: string;
  type: HandleKind;
  position: Position;
  style?: CSSProperties;
  selected: boolean;
}) {
  const snap = useConnection((conn) => {
    if (!conn.inProgress || !conn.toHandle) {
      return null;
    }

    if (
      conn.toHandle.nodeId !== nodeId ||
      conn.toHandle.id !== handleId ||
      conn.toHandle.type !== type
    ) {
      return null;
    }

    if (conn.isValid === true) {
      return 'valid';
    }

    if (conn.isValid === false) {
      return 'invalid';
    }

    return 'pending';
  });

  return (
    <Handle
      id={handleId}
      type={type}
      position={position}
      style={style}
      className={clsx(
        '!z-20 !h-3 !w-3 !border-2 !bg-canvas transition',
        selected
          ? '!border-primary !opacity-100'
          : '!border-border !opacity-70',
        snap === 'valid' &&
          '!border-success !opacity-100 !shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-success)_45%,transparent)]',
        snap === 'invalid' &&
          '!border-danger !opacity-100 !shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-danger)_40%,transparent)]',
        snap === 'pending' &&
          '!border-primary !opacity-100 !shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_45%,transparent)]',
      )}
    />
  );
}

const TARGET_HANDLES: Array<{
  id: string;
  position: Position;
  style: CSSProperties;
}> = [
  { id: 'target-top', position: Position.Top, style: { left: '34%' } },
  { id: 'target-right', position: Position.Right, style: { top: '34%' } },
  { id: 'target-bottom', position: Position.Bottom, style: { left: '34%' } },
  { id: 'target-left', position: Position.Left, style: { top: '34%' } },
];

const SOURCE_HANDLES: Array<{
  id: string;
  position: Position;
  style: CSSProperties;
}> = [
  { id: 'source-top', position: Position.Top, style: { left: '66%' } },
  { id: 'source-right', position: Position.Right, style: { top: '66%' } },
  { id: 'source-bottom', position: Position.Bottom, style: { left: '66%' } },
  { id: 'source-left', position: Position.Left, style: { top: '66%' } },
];

function FlowNodeComponent({ id, type, selected, data }: NodeProps) {
  const flowData = data as FlowNodeData;
  const nodeType = flowData.type ?? type ?? 'process';
  const definition = getNodeDefinition(nodeType);
  const isGroup = flowData.type === 'group';
  const isTextLike = definition.kind === 'text';
  const isIconOnly = definition.kind === 'icon';
  const isTextBlock = nodeType === 'text';
  const isNoteKind = definition.kind === 'note';
  const labelText = String(flowData.label);
  const isEmptyBodyLabel =
    labelText.trim() === '' && (isTextLike || isNoteKind);
  const isLightweight = definition.lightweight || isTextLike;
  const connectable = definition.connectable !== false && !isGroup;
  const backgroundColor = resolveNodeBackgroundColor(
    flowData.style?.backgroundColor,
  );
  const borderColor = resolveNodeBorderColor(flowData.style?.borderColor);
  const borderWidth = Math.max(0, Number(flowData.style?.borderWidth ?? 1));
  const borderStyle =
    flowData.style?.borderStyle === 'dashed' ||
    flowData.style?.borderStyle === 'dotted'
      ? flowData.style.borderStyle
      : 'solid';
  const fontSizePx = Number(flowData.style?.fontSize ?? DEFAULT_FONT_SIZE);
  const fontSizeRem = `${fontSizePx / 16}rem`;
  const badgeTitle =
    typeof flowData.badgeLabel === 'string' && flowData.badgeLabel.length > 0
      ? flowData.badgeLabel
      : definition.label;
  const cornerIconInset = !isLightweight ? 'right-3 top-3' : 'right-2 top-2';
  const wantsTextBox =
    isTextLike &&
    (backgroundColor !== 'transparent' ||
      borderColor !== 'transparent' ||
      borderWidth !== 1 ||
      borderStyle !== 'solid');
  const hasBox = !isLightweight || wantsTextBox;
  const isCircleCompact = nodeType === 'circle-compact';
  const isSvgShape = nodeType === 'svg-shape';

  const patch = (patchData: Partial<DiagramNodeData>) =>
    flowData.onPatchData?.(id, patchData);
  const usesCustomBody =
    nodeType === 'custom-input' ||
    nodeType === 'counter' ||
    nodeType === 'architecture' ||
    isCircleCompact ||
    isSvgShape;

  return (
    <div
      className={clsx(
        'flowcraft-node-shell relative transition',
        isCircleCompact ? 'rounded-full' : 'rounded-xl',
        !isGroup && !isTextLike && 'min-w-[228px]',
        hasBox && 'border',
        hasBox && (isTextLike ? 'px-3 py-2' : 'p-3'),
        !hasBox && isTextLike && 'px-2 py-1',
        isIconOnly && 'border p-4',
        selected && !isLightweight && 'ring-2 ring-primary/25',
        flowData.isIntersecting && 'ring-2 ring-danger/40',
        flowData.isSearchMatch && 'ring-2 ring-accent/30',
      )}
      style={{
        backgroundColor: hasBox ? backgroundColor : 'transparent',
        borderColor: hasBox ? borderColor : 'transparent',
        borderWidth: hasBox ? `${borderWidth}px` : undefined,
        borderStyle: hasBox ? borderStyle : undefined,
        transform:
          typeof flowData.style?.rotation === 'number'
            ? `rotate(${flowData.style.rotation}deg)`
            : undefined,
        fontSize: fontSizeRem,
      }}
      data-testid={`diagram-node-${id}`}
      onDoubleClick={() => flowData.onStartEdit?.(id)}
    >
      {selected ? (
        <NodeToolbar isVisible={Boolean(selected)} position={Position.Top}>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background-elevated px-2 py-2 shadow-card">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Duplicate"
              onClick={() => flowData.onDuplicate?.(id)}
              data-testid={`node-toolbar-duplicate-${id}`}
            >
              <IconCopy className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-danger-soft hover:text-danger-text"
              aria-label="Delete"
              onClick={() => flowData.onDelete?.(id)}
              data-testid={`node-toolbar-delete-${id}`}
            >
              <IconTrash className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
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
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Bring to front"
              onClick={() => flowData.onBringToFront?.(id)}
              data-testid={`node-toolbar-front-${id}`}
            >
              <IconLayersOff className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Quick color"
              onClick={() => flowData.onQuickColor?.(id)}
              data-testid={`node-toolbar-color-${id}`}
            >
              <IconPalette className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
              aria-label="Group"
              onClick={() => flowData.onGroup?.(id)}
              data-testid={`node-toolbar-group-${id}`}
            >
              <IconFolders className="h-5 w-5" stroke={1.9} aria-hidden />
            </button>
          </div>
        </NodeToolbar>
      ) : null}
      {definition.resizable !== false ? (
        <NodeResizer
          minWidth={isGroup ? 312 : isTextLike ? 144 : 216}
          minHeight={isGroup ? 192 : isTextLike ? 48 : 106}
          isVisible={selected}
          lineClassName="!border-primary"
          handleClassName="!z-10 !h-3 !w-3 !border-2 !border-primary !bg-canvas"
        />
      ) : null}
      {connectable
        ? TARGET_HANDLES.map((handle) => (
            <FlowHandle
              key={handle.id}
              nodeId={id}
              handleId={handle.id}
              type="target"
              position={handle.position}
              style={handle.style}
              selected={Boolean(selected)}
            />
          ))
        : null}
      {!isCircleCompact && !isSvgShape ? (
        <span
          className={clsx(
            'pointer-events-none absolute z-[2] flex shrink-0 items-center justify-center rounded-lg',
            cornerIconInset,
            isTextLike
              ? 'h-7 w-7 bg-surface/90 text-text-muted ring-1 ring-border/40'
              : clsx(
                  'h-8 w-8 ring-1 ring-black/5 dark:ring-white/10',
                  definition.colorClasses.background,
                  definition.colorClasses.text,
                ),
          )}
          aria-hidden
        >
          <IconGlyph
            iconName={
              isTextBlock ? (flowData.icon ?? 'typography') : flowData.icon
            }
            nodeType={nodeType}
            className={isTextLike ? 'h-4 w-4' : 'h-[18px] w-[18px]'}
          />
        </span>
      ) : null}
      <div
        className={clsx(
          'relative z-0 space-y-3',
          !isCircleCompact && !isSvgShape && 'pr-11 pt-1',
          isTextLike && 'space-y-1',
          isIconOnly && 'flex min-w-[168px] flex-col items-stretch text-center',
          isCircleCompact &&
            'flex h-full min-h-[120px] min-w-[120px] flex-col items-center justify-center text-center',
        )}
      >
        {nodeType === 'custom-input' ? (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-text-subtle">
              Input
            </div>
            <input
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text outline-none"
              value={String(flowData.label ?? '')}
              onChange={(e) => patch({ label: e.target.value })}
              placeholder="Label"
              data-testid={`flow-node-input-label-${id}`}
            />
            <input
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
              value={String(flowData.value ?? '')}
              onChange={(e) => patch({ value: e.target.value })}
              placeholder="Value"
              data-testid={`flow-node-input-value-${id}`}
            />
          </div>
        ) : nodeType === 'counter' ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold text-text">
                {String(flowData.label || 'Counter')}
              </div>
              <div className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text-muted">
                {Number(flowData.value ?? 0)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text transition hover:bg-surface-hover"
                onClick={() =>
                  patch({ value: Number(flowData.value ?? 0) - 1 })
                }
              >
                −
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-text transition hover:bg-surface-hover"
                onClick={() =>
                  patch({ value: Number(flowData.value ?? 0) + 1 })
                }
              >
                +
              </button>
            </div>
          </div>
        ) : nodeType === 'architecture' ? (
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface shadow-inner">
                <IconGlyph
                  iconName={flowData.icon}
                  nodeType={nodeType}
                  className="h-7 w-7"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-sm font-semibold text-text">
                    {String(flowData.label || 'Service')}
                  </div>
                  <span
                    className={clsx(
                      'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                      flowData.status === 'success' &&
                        'bg-success-soft text-success-text',
                      flowData.status === 'warning' &&
                        'bg-warning-soft text-warning-text',
                      flowData.status === 'danger' &&
                        'bg-danger-soft text-danger-text',
                      (!flowData.status || flowData.status === 'default') &&
                        'bg-surface-hover text-text-muted',
                    )}
                  >
                    {String(flowData.status ?? 'default')}
                  </span>
                </div>
                {flowData.subtitle ? (
                  <div className="mt-1 truncate text-xs text-text-muted">
                    {String(flowData.subtitle)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : isCircleCompact ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="text-sm font-semibold text-text">
              {String(flowData.label || 'Circle')}
            </div>
          </div>
        ) : isSvgShape ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <svg
              viewBox="0 0 100 100"
              className="h-20 w-20"
              aria-hidden
              focusable="false"
            >
              <path
                d={
                  String(flowData.value ?? 'hex') === 'diamond'
                    ? 'M50 6 L94 50 L50 94 L6 50 Z'
                    : String(flowData.value ?? 'hex') === 'circle'
                      ? 'M50 8 A42 42 0 1 0 50 92 A42 42 0 1 0 50 8 Z'
                      : 'M25 10 L75 10 L95 50 L75 90 L25 90 L5 50 Z'
                }
                fill={
                  backgroundColor === 'transparent'
                    ? 'transparent'
                    : backgroundColor
                }
                stroke={
                  borderColor === 'transparent' ? 'currentColor' : borderColor
                }
                strokeWidth={Math.max(1, borderWidth)}
                strokeDasharray={
                  borderStyle === 'dashed'
                    ? '6 4'
                    : borderStyle === 'dotted'
                      ? '2 4'
                      : undefined
                }
              />
            </svg>
            <div className="text-sm font-semibold text-text">
              {String(flowData.label || 'Shape')}
            </div>
          </div>
        ) : null}
        {!usesCustomBody && !isTextLike ? (
          !isNoteKind ? (
            <div className="flex min-h-8 items-start">
              <Badge tone={isGroup ? 'accent' : 'default'}>{badgeTitle}</Badge>
            </div>
          ) : null
        ) : !usesCustomBody && !isTextBlock ? (
          <div className="min-h-7 text-left text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
            {badgeTitle}
          </div>
        ) : null}
        {!usesCustomBody ? (
          flowData.isEditing ? (
            <textarea
              defaultValue={labelText}
              rows={Math.max(2, String(flowData.label).split('\n').length)}
              className={clsx(
                'w-full resize-none rounded-md px-2 py-2 text-left text-text',
                isTextLike
                  ? 'border border-border bg-surface/70'
                  : 'border border-border bg-surface font-medium',
              )}
              onBlur={(event) =>
                flowData.onFinishEdit?.(id, event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  flowData.onFinishEdit?.(id, event.currentTarget.value);
                }
              }}
              data-testid={`flow-node-input-${id}`}
            />
          ) : (
            <button
              type="button"
              className={clsx(
                'w-full rounded-md whitespace-pre-wrap',
                isTextLike
                  ? 'text-left font-normal text-text'
                  : isIconOnly
                    ? 'text-center font-medium text-text'
                    : 'text-left font-medium text-text',
                isEmptyBodyLabel && 'min-h-10 py-2',
              )}
              onClick={() => flowData.onStartEdit?.(id)}
              data-testid={`flow-node-label-${id}`}
              aria-label={isEmptyBodyLabel ? 'Edit text' : undefined}
            >
              {isEmptyBodyLabel ? (
                <span className="text-text-muted/35 select-none" aria-hidden>
                  {'\u00a0'}
                </span>
              ) : (
                labelText
              )}
            </button>
          )
        ) : null}
        {Array.isArray(flowData.tags) && flowData.tags.length > 0 ? (
          <div
            className={clsx(
              'flex flex-wrap gap-1.5 pt-1',
              isTextLike && 'pt-0',
            )}
            data-testid={`flow-node-tags-${id}`}
          >
            {flowData.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-muted"
              >
                {tag}
              </span>
            ))}
            {flowData.tags.length > 3 ? (
              <span className="inline-flex items-center rounded-full border border-border bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-text-muted">
                +{flowData.tags.length - 3}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {connectable
        ? SOURCE_HANDLES.map((handle) => (
            <FlowHandle
              key={handle.id}
              nodeId={id}
              handleId={handle.id}
              type="source"
              position={handle.position}
              style={handle.style}
              selected={Boolean(selected)}
            />
          ))
        : null}
    </div>
  );
}

export const FlowNode = memo(FlowNodeComponent);
