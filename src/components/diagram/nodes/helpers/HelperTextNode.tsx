import {
  IconArrowsMaximize,
  IconCopy,
  IconMinus,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  NodeResizer,
  NodeToolbar,
  Position,
  type NodeProps,
} from '@xyflow/react';
import clsx from 'clsx';
import { memo, useLayoutEffect, useRef } from 'react';

import type { FlowNodeData } from '@pages/DiagramEditorPage/components/FlowNode';

import { Tooltip } from '@components/ui/Tooltip';

import {
  resolveNodeBackgroundColor,
  resolveNodeBorderColor,
} from '@utils/diagram';
import { duplicateShortcutLabel } from '@utils/platform';

import type {
  DiagramNodeStyle,
  HelperAnnotationKind,
  HelperFontWeight,
} from '../../../../types/diagram';
import type { CSSProperties } from 'react';

const FONT_WEIGHT_VALUES: Record<HelperFontWeight, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

/** Toolbar quick picks — neutral canvas palette */
const TEXT_COLOR_SWATCHES = [
  '#E5E7EB',
  '#F9FAFB',
  '#6B7280',
  '#9CA3AF',
  '#FFFFFF',
] as const;

function HelperTextNodeComponent({ id, selected, data }: NodeProps) {
  const flowData = data as FlowNodeData;
  const helperType: HelperAnnotationKind = flowData.helperType ?? 'plain-text';
  const labelText = String(flowData.label ?? '');
  const patchStyle = (partial: Partial<DiagramNodeStyle>) =>
    flowData.onPatchData?.(
      id,
      {
        style: {
          ...(flowData.style ?? {}),
          ...partial,
        },
      },
      { recordHistory: true },
    );

  const editBaselineRef = useRef('');
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (flowData.isEditing) {
      editBaselineRef.current = String(flowData.label);
    }
  }, [flowData.isEditing, flowData.label]);

  useLayoutEffect(() => {
    if (flowData.isEditing) {
      editInputRef.current?.focus();
    }
  }, [flowData.isEditing]);

  const fontSizePx = Number(flowData.style?.fontSize ?? 16);
  const fontWeight: HelperFontWeight = flowData.style?.fontWeight ?? 'normal';
  const textAlign = flowData.style?.textAlign ?? 'left';
  const opacity = Number(flowData.style?.opacity ?? 1);
  const bgEnabled = Boolean(flowData.style?.backgroundEnabled);
  const bgColor = flowData.style?.backgroundColor;
  const resolvedBg =
    bgEnabled && bgColor ? resolveNodeBackgroundColor(bgColor) : 'transparent';

  const explicitTextColor = flowData.style?.textColor;
  const textStyle: CSSProperties = {
    fontSize: `${fontSizePx / 16}rem`,
    fontWeight: FONT_WEIGHT_VALUES[fontWeight],
    textAlign,
    opacity: Number.isFinite(opacity) ? Math.min(1, Math.max(0, opacity)) : 1,
    fontStyle: flowData.style?.fontStyle ?? 'normal',
    letterSpacing: flowData.style?.letterSpacing,
  };

  if (explicitTextColor) {
    textStyle.color =
      explicitTextColor.startsWith('#') || explicitTextColor.startsWith('rgb')
        ? explicitTextColor
        : resolveNodeBorderColor(explicitTextColor);
  }

  const uppercase =
    helperType === 'small-label' &&
    flowData.style?.textTransform === 'uppercase';

  const bumpFontSize = (delta: number) => {
    const next = Math.min(96, Math.max(8, Math.round(fontSizePx + delta)));
    patchStyle({ fontSize: next });
  };

  return (
    <div
      className={clsx(
        'flowcraft-helper-node group relative box-border h-full w-full min-h-[24px] min-w-[80px] outline-none',
        flowData.isIntersecting && 'ring-1 ring-danger/35',
        flowData.isSearchMatch && 'ring-1 ring-accent/35',
      )}
      style={{
        boxSizing: 'border-box',
      }}
      data-testid={`diagram-node-${id}`}
      onDoubleClick={(event) => {
        event.stopPropagation();
        flowData.onStartEdit?.(id);
      }}
    >
      {/* Hover: subtle outline — stripped on export */}
      <div
        data-export-remove
        className="pointer-events-none absolute inset-0 z-[0] rounded-md opacity-0 shadow-[inset_0_0_0_1px_rgba(51,65,85,0.3)] transition-opacity duration-150 group-hover:opacity-100"
        aria-hidden
      />

      {/* Selection: dashed box — stripped on export */}
      {selected ? (
        <div
          data-export-remove
          className="pointer-events-none absolute inset-0 z-[1] rounded-md border border-dashed border-slate-400/55"
          aria-hidden
        />
      ) : null}

      {selected ? (
        <NodeResizer
          minWidth={80}
          minHeight={24}
          isVisible={Boolean(selected)}
          lineClassName="!border-slate-400/70"
          handleClassName="!z-[5] !h-2.5 !w-2.5 !rounded-sm !border !border-slate-400 !bg-canvas !shadow-none"
        />
      ) : null}

      {selected ? (
        <NodeToolbar
          isVisible={Boolean(selected)}
          position={Position.Top}
          className="nodrag nopan !z-[200]"
          data-testid={`node-toolbar-root-${id}`}
        >
          <div
            className="nodrag nopan flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background-elevated/95 px-2 py-1.5 shadow-sm backdrop-blur-sm"
            data-testid={`node-toolbar-actions-${id}`}
          >
            <Tooltip
              content={`Duplicate · ${duplicateShortcutLabel()}`}
              compact
              delayMs={280}
            >
              <button
                type="button"
                className="nodrag nopan flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                aria-label="Duplicate"
                onClick={() => flowData.onDuplicate?.(id)}
                data-testid={`node-toolbar-duplicate-${id}`}
              >
                <IconCopy className="h-4 w-4" stroke={1.9} aria-hidden />
              </button>
            </Tooltip>
            <Tooltip content="Delete" compact delayMs={280}>
              <button
                type="button"
                className="nodrag nopan flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-muted transition hover:bg-danger-soft hover:text-danger-text"
                aria-label="Delete"
                onClick={() => flowData.onDelete?.(id)}
                data-testid={`node-toolbar-delete-${id}`}
              >
                <IconTrash className="h-4 w-4" stroke={1.9} aria-hidden />
              </button>
            </Tooltip>
            <div
              className="mx-0.5 flex items-center gap-0.5 border-l border-border pl-2"
              role="group"
              aria-label="Text color"
            >
              {TEXT_COLOR_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  className="nodrag nopan h-7 w-7 rounded-full border border-border shadow-inner transition hover:ring-2 hover:ring-primary/30"
                  style={{ backgroundColor: hex }}
                  aria-label={`Text color ${hex}`}
                  onClick={() => patchStyle({ textColor: hex })}
                  data-testid={`helper-toolbar-color-${hex.replace('#', '')}`}
                />
              ))}
            </div>
            <div
              className="flex items-center gap-0.5 border-l border-border pl-2"
              role="group"
              aria-label="Font size"
            >
              <Tooltip content="Smaller" compact delayMs={200}>
                <button
                  type="button"
                  className="nodrag nopan flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-muted transition hover:bg-surface-hover"
                  aria-label="Decrease font size"
                  onClick={() => bumpFontSize(-1)}
                  data-testid={`node-toolbar-helper-font-down-${id}`}
                >
                  <IconMinus className="h-4 w-4" stroke={2} aria-hidden />
                </button>
              </Tooltip>
              <span className="min-w-[2rem] text-center font-mono text-xs tabular-nums text-text-muted">
                {fontSizePx}
              </span>
              <Tooltip content="Larger" compact delayMs={200}>
                <button
                  type="button"
                  className="nodrag nopan flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-muted transition hover:bg-surface-hover"
                  aria-label="Increase font size"
                  onClick={() => bumpFontSize(1)}
                  data-testid={`node-toolbar-helper-font-up-${id}`}
                >
                  <IconPlus className="h-4 w-4" stroke={2} aria-hidden />
                </button>
              </Tooltip>
            </div>
            <Tooltip content="Center view on this node" compact delayMs={280}>
              <button
                type="button"
                className="nodrag nopan flex h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                aria-label="Focus node"
                onClick={() => flowData.onFocus?.(id)}
                data-testid={`node-toolbar-focus-${id}`}
              >
                <IconArrowsMaximize
                  className="h-4 w-4"
                  stroke={1.9}
                  aria-hidden
                />
              </button>
            </Tooltip>
          </div>
        </NodeToolbar>
      ) : null}

      <div
        className={clsx(
          'relative z-[2] box-border flex h-full w-full min-h-0 flex-col',
          bgEnabled ? 'rounded-lg p-3' : 'p-2',
        )}
        style={{
          backgroundColor: bgEnabled ? resolvedBg : 'transparent',
          borderRadius: bgEnabled ? '8px' : undefined,
        }}
      >
        <div className="min-h-0 flex-1 overflow-hidden">
          {flowData.isEditing ? (
            <textarea
              ref={editInputRef}
              defaultValue={labelText}
              rows={Math.max(2, labelText.split('\n').length)}
              className="nodrag box-border h-full min-h-[48px] w-full resize-none bg-transparent px-0 py-0 text-left outline-none ring-0 placeholder:text-text-muted/50 focus:ring-0"
              style={{
                fontSize: `${fontSizePx / 16}rem`,
                fontWeight: FONT_WEIGHT_VALUES[fontWeight],
                textAlign,
                color:
                  explicitTextColor?.startsWith('#') ||
                  explicitTextColor?.startsWith('rgb')
                    ? explicitTextColor
                    : explicitTextColor
                      ? resolveNodeBorderColor(explicitTextColor)
                      : undefined,
                fontStyle: flowData.style?.fontStyle ?? 'normal',
                letterSpacing: flowData.style?.letterSpacing,
              }}
              onBlur={(event) =>
                flowData.onFinishEdit?.(id, event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  flowData.onFinishEdit?.(id, editBaselineRef.current);
                }
              }}
              data-testid={`helper-node-input-${id}`}
            />
          ) : (
            <div
              className={clsx(
                'h-full w-full whitespace-pre-wrap break-words',
                uppercase && 'uppercase tracking-wide',
              )}
              style={textStyle}
            >
              {labelText || (
                <span className="text-slate-500/80 italic">
                  Double-click to edit
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const HelperTextNode = memo(HelperTextNodeComponent);
