import {
  IconArrowsMaximize,
  IconCopy,
  IconLayersOff,
  IconFolders,
  IconPlus,
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

import { ToolbarQuickFillPicker } from '@components/diagram/ToolbarQuickFillPicker';
import { Badge } from '@components/ui/Badge';
import { Tooltip } from '@components/ui/Tooltip';

import { getNodeDefinition } from '@configs/diagramNodes';
import { renderIcon } from '@configs/iconLibrary.config';

import {
  DEFAULT_FONT_SIZE,
  resolveNodeBackgroundColor,
  resolveNodeBorderColor,
} from '@utils/diagram';
import { createId } from '@utils/id';
import { duplicateShortcutLabel } from '@utils/platform';

import type { DiagramNodeData } from '../../../types/diagram';
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
  onQuickColor?: (nodeId: string, color: string) => void;
  onGroup?: (nodeId: string) => void;
}

function IconGlyph({
  iconName,
  className,
}: {
  iconName: string;
  className: string;
}) {
  return renderIcon(iconName, { className, strokeWidth: 1.8 });
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
      data-testid={`diagram-handle-${nodeId}-${handleId}-${type}`}
      className={clsx(
        '!z-20 !h-4 !w-4 !min-h-[16px] !min-w-[16px] !border-2 !border-handle !bg-canvas !opacity-100 transition duration-fast ease-out-expo',
        selected ? '!border-primary' : '!shadow-sm',
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

const CIRCLE_HANDLES: Array<{
  id: string;
  position: Position;
  style: CSSProperties;
}> = [
  { id: 'circle-top', position: Position.Top, style: { left: '50%' } },
  { id: 'circle-right', position: Position.Right, style: { top: '50%' } },
  { id: 'circle-bottom', position: Position.Bottom, style: { left: '50%' } },
  { id: 'circle-left', position: Position.Left, style: { top: '50%' } },
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
  const connectable = definition.connectable !== false;
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

  /** `null`/cleared → no corner icon; otherwise falls back to type defaults when unset */
  const cornerGlyphIcon =
    flowData.icon === null || flowData.icon === ''
      ? null
      : isTextBlock
        ? (flowData.icon ?? 'typography')
        : (flowData.icon ?? definition.iconName ?? null);

  const showCornerGlyph =
    Boolean(cornerGlyphIcon) && !isCircleCompact && !isSvgShape && !isGroup;

  const patch = (patchData: Partial<DiagramNodeData>) =>
    flowData.onPatchData?.(id, patchData);
  const isCustomInput = nodeType === 'custom-input';
  const isCounter = nodeType === 'counter';
  const isArchitecture = nodeType === 'architecture';
  const usesCustomBody =
    isCustomInput ||
    isCounter ||
    isArchitecture ||
    isCircleCompact ||
    isSvgShape;

  const inputFields =
    nodeType === 'custom-input'
      ? Array.isArray(flowData.inputFields) && flowData.inputFields.length > 0
        ? flowData.inputFields
        : [
            {
              id: 'field-0',
              label: String(flowData.label || 'Label'),
              value: String(flowData.value ?? ''),
            },
          ]
      : [];

  return (
    <div
      className={clsx(
        'flowcraft-node-shell relative transition duration-fast ease-out-expo',
        isCircleCompact ? 'rounded-full' : 'rounded-xl',
        isGroup && 'flex h-full min-h-0 flex-col',
        !isGroup && !isTextLike && !isCircleCompact && 'min-w-[228px]',
        isCircleCompact &&
          'flex h-full min-h-0 w-full min-w-0 items-center justify-center',
        hasBox && 'border',
        hasBox &&
          (isTextLike
            ? 'px-3 py-2'
            : isGroup
              ? 'p-0'
              : isCircleCompact
                ? 'p-2'
                : isSvgShape
                  ? 'p-0'
                  : 'p-3'),
        hasBox && !isLightweight && !selected && 'shadow-node hover:shadow-md',
        !hasBox && isTextLike && 'px-2 py-1',
        isIconOnly && 'border p-4',
        selected && !isLightweight && 'ring-2 ring-primary/35 shadow-lg',
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
            <Tooltip content="Center view on this node" compact delayMs={280}>
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
            <ToolbarQuickFillPicker
              nodeId={id}
              onSelectColor={(nodeId, color) =>
                flowData.onQuickColor?.(nodeId, color)
              }
            />
            <Tooltip
              content="Group with other selected nodes"
              compact
              delayMs={280}
            >
              <button
                type="button"
                className="nodrag nopan flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                aria-label="Group"
                onClick={() => flowData.onGroup?.(id)}
                data-testid={`node-toolbar-group-${id}`}
              >
                <IconFolders className="h-5 w-5" stroke={1.9} aria-hidden />
              </button>
            </Tooltip>
          </div>
        </NodeToolbar>
      ) : null}
      {definition.resizable !== false ? (
        <NodeResizer
          minWidth={
            isGroup ? 312 : isCircleCompact ? 96 : isTextLike ? 144 : 216
          }
          minHeight={
            isGroup ? 192 : isCircleCompact ? 96 : isTextLike ? 48 : 106
          }
          keepAspectRatio={isCircleCompact}
          isVisible={selected}
          lineClassName="!border-primary"
          handleClassName="!z-10 !h-3 !w-3 !border-2 !border-primary !bg-canvas"
        />
      ) : null}
      {connectable
        ? (isCircleCompact ? CIRCLE_HANDLES : TARGET_HANDLES).map((handle) => (
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
      {connectable
        ? (isCircleCompact ? CIRCLE_HANDLES : SOURCE_HANDLES).map((handle) => (
            <FlowHandle
              key={`${handle.id}-source`}
              nodeId={id}
              handleId={isCircleCompact ? `source-${handle.id}` : handle.id}
              type="source"
              position={handle.position}
              style={handle.style}
              selected={Boolean(selected)}
            />
          ))
        : null}
      {showCornerGlyph ? (
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
            iconName={cornerGlyphIcon as string}
            className={isTextLike ? 'h-4 w-4' : 'h-[18px] w-[18px]'}
          />
        </span>
      ) : null}
      <div
        className={clsx(
          'relative z-0 space-y-3',
          !isCircleCompact &&
            !isSvgShape &&
            !isGroup &&
            (showCornerGlyph ? 'pr-11 pt-1' : 'pt-1'),
          isGroup && 'flex min-h-0 min-w-0 flex-1 flex-col space-y-0',
          isTextLike && 'space-y-1',
          isIconOnly && 'flex min-w-[168px] flex-col items-stretch text-center',
          isCircleCompact && 'flex min-h-0 flex-1 flex-col',
        )}
      >
        {isGroup ? (
          <>
            <div className="nodrag shrink-0 border-b border-border/55 px-3 pb-2 pt-2">
              {flowData.isEditing ? (
                <textarea
                  defaultValue={labelText}
                  rows={Math.max(2, String(flowData.label).split('\n').length)}
                  className="w-full resize-none rounded-md border border-border bg-surface px-2 py-2 text-left text-sm font-semibold text-text outline-none ring-2 ring-primary/25"
                  onBlur={(event) =>
                    flowData.onFinishEdit?.(id, event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      event.currentTarget.blur();
                    }
                    if (
                      event.key === 'Enter' &&
                      (event.metaKey || event.ctrlKey)
                    ) {
                      flowData.onFinishEdit?.(id, event.currentTarget.value);
                    }
                  }}
                  data-testid={`flow-node-input-${id}`}
                />
              ) : (
                <button
                  type="button"
                  className="nodrag w-full rounded-md px-1 py-0.5 text-left text-sm font-semibold text-text transition hover:bg-surface-hover/80"
                  onClick={() => flowData.onStartEdit?.(id)}
                  data-testid={`flow-node-label-${id}`}
                >
                  {labelText.trim() || 'Group'}
                </button>
              )}
            </div>
            <div className="min-h-8 flex-1" aria-hidden />
          </>
        ) : null}
        {!isGroup && isCustomInput ? (
          <div className="space-y-3">
            {inputFields.map((field) => (
              <label key={field.id} className="block space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">
                  {field.label || 'Field'}
                </span>
                <input
                  className="nodrag w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_14%,transparent)]"
                  value={field.value}
                  onChange={(event) => {
                    const next = inputFields.map((current) =>
                      current.id === field.id
                        ? { ...current, value: event.target.value }
                        : current,
                    );
                    patch({ inputFields: next });
                  }}
                  placeholder="Value"
                  data-testid={`flow-node-input-field-${id}-${field.id}`}
                />
              </label>
            ))}
            <div className="flex items-center justify-end">
              <Tooltip content="Add field">
                <button
                  type="button"
                  className="nodrag inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                  onClick={() => {
                    const next = [
                      ...inputFields,
                      { id: createId('field'), label: 'Label', value: '' },
                    ];
                    patch({ inputFields: next });
                  }}
                  aria-label="Add field"
                  data-testid={`flow-node-input-add-field-${id}`}
                >
                  <IconPlus className="h-5 w-5" stroke={1.9} aria-hidden />
                </button>
              </Tooltip>
            </div>
          </div>
        ) : null}

        {!isGroup && isCounter ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-text">
              {String(flowData.label || 'Counter')}
            </p>
            <p className="text-2xl font-semibold tabular-nums text-text">
              {Number(flowData.value ?? 0)}
            </p>
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
        ) : null}

        {!isGroup && isArchitecture ? (
          <div className="space-y-1">
            <p className="text-sm font-semibold text-text">
              {String(flowData.label || 'Service')}
            </p>
            {flowData.subtitle ? (
              <p className="text-sm text-text-muted">
                {String(flowData.subtitle)}
              </p>
            ) : null}
            {flowData.status ? (
              <span
                className={clsx(
                  'inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  flowData.status === 'success' &&
                    'bg-success-soft text-success-text',
                  flowData.status === 'warning' &&
                    'bg-warning-soft text-warning-text',
                  flowData.status === 'danger' &&
                    'bg-danger-soft text-danger-text',
                  flowData.status === 'default' &&
                    'bg-surface-hover text-text-muted',
                )}
              >
                {String(flowData.status)}
              </span>
            ) : null}
          </div>
        ) : null}

        {!isGroup && isCircleCompact ? (
          <div className="flex max-h-full max-w-full flex-1 flex-col items-center justify-center overflow-hidden px-2">
            <span
              className="text-center text-lg font-semibold leading-tight break-words text-text"
              style={{
                color: flowData.style?.textColor,
              }}
            >
              {labelText}
            </span>
          </div>
        ) : null}

        {!isGroup && isSvgShape ? (
          <div className="relative min-h-[120px] w-full flex-1">
            <div className="absolute inset-0 overflow-hidden rounded-xl">
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="h-full w-full"
                aria-hidden
                focusable="false"
              >
                <path
                  d={
                    String(flowData.value ?? 'rectangle') === 'rectangle'
                      ? 'M0 0 H100 V100 H0 Z'
                      : String(flowData.value ?? 'rectangle') === 'diamond'
                        ? 'M50 6 L94 50 L50 94 L6 50 Z'
                        : String(flowData.value ?? 'rectangle') === 'triangle'
                          ? 'M50 8 L94 92 L6 92 Z'
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
                />
                {typeof flowData.avatar === 'string' && flowData.avatar ? (
                  <image
                    href={flowData.avatar}
                    x="0"
                    y="0"
                    width="100"
                    height="100"
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : null}
              </svg>
            </div>
            {labelText.trim() !== '' ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-sm font-semibold text-text">
                {labelText}
              </div>
            ) : null}
          </div>
        ) : null}
        {!isGroup && !usesCustomBody && !isTextLike ? (
          !isNoteKind ? (
            <div className="flex min-h-8 items-start">
              <Badge tone="default">{badgeTitle}</Badge>
            </div>
          ) : null
        ) : !isGroup && !usesCustomBody && !isTextBlock ? (
          <div className="min-h-7 text-left text-xs font-medium uppercase tracking-[0.18em] text-text-muted">
            {badgeTitle}
          </div>
        ) : null}
        {!isGroup && !usesCustomBody ? (
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
              'flex flex-wrap gap-1.5',
              isGroup
                ? 'nodrag mt-auto shrink-0 border-t border-border/50 px-3 pb-3 pt-2'
                : clsx('pt-1', isTextLike && 'pt-0'),
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
    </div>
  );
}

export const FlowNode = memo(FlowNodeComponent);
