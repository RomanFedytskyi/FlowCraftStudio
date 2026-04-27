import { IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';

import { IconSelectDropdown } from '@pages/DiagramEditorPage/components/IconSelectDropdown';

import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Tooltip } from '@components/ui/Tooltip';

import { NODE_COLOR_PRESETS } from '@configs/colorPresets.config';
import { getNodeDefinition } from '@configs/diagramNodes';

import {
  EDGE_LINE_STYLE_OPTIONS,
  EDGE_MARKER_KIND_OPTIONS,
  EDGE_MARKER_POSITION_OPTIONS,
  EDGE_TYPE_OPTIONS,
  EDGE_WIDTH_OPTIONS,
  resolveEdgeColor,
  resolveNodeBackgroundColor,
  resolveNodeBorderColor,
} from '@utils/diagram';

const DEFAULT_EDGE_LABEL_TEXT = '#475569';

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
  HelperFontWeight,
} from '../../../types/diagram';

export interface EditorPropertiesPanelProps {
  diagram: Pick<Diagram, 'description' | 'tags'>;
  selectedNode: DiagramNode | null;
  selectedEdge: DiagramEdge | null;
  onChangeNodeLabel: (label: string) => void;
  onChangeNodeStyle: (style: DiagramNodeStyle) => void;
  onChangeNodeTags: (tags: string[]) => void;
  onChangeNodeIcon: (icon: string | null | undefined) => void;
  onChangeNodeBadgeLabel: (value: string | undefined) => void;
  onPatchNodeData: (patch: Partial<DiagramNodeData>) => void;
  onChangeEdgeLabel: (label: string) => void;
  onChangeEdgeStyle: (payload: {
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
  }) => void;
  onDeleteEdge: () => void;
  onChangeDiagramDescription: (value: string) => void;
  onChangeDiagramTags: (value: string) => void;
}

function LabeledField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-text">{label}</p>
      {children}
    </div>
  );
}

function isHexColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/i.test(value);
}

function ColorInput({
  value,
  onChange,
  onClear,
  testId,
  showPresets,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  testId: string;
  showPresets?: boolean;
}) {
  const pickerValue = isHexColor(value) ? value : '#64748b';
  const swatchStyle: CSSProperties =
    value === 'transparent'
      ? {
          backgroundImage:
            'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
          backgroundSize: '8px 8px',
          backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
          backgroundColor: '#fff',
        }
      : { backgroundColor: value };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label
          className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-border bg-surface shadow-inner ring-offset-2 transition hover:ring-2 hover:ring-primary/25"
          title="Pick a color"
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={swatchStyle}
            aria-hidden
          />
          <input
            type="color"
            value={pickerValue}
            onChange={(event) => onChange(event.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            data-testid={testId}
            aria-label="Pick color with system picker"
          />
        </label>
        <Input
          className="h-12 min-h-12 min-w-0 flex-1 font-mono text-sm tracking-wide"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          data-testid={`${testId}-hex`}
          aria-label="Color hex value"
          placeholder="#RRGGBB"
        />
        {onClear ? (
          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-text-muted transition hover:bg-surface-hover hover:text-text"
            onClick={onClear}
            aria-label="Clear color"
          >
            <IconTrash className="size-6" stroke={2} aria-hidden />
          </button>
        ) : null}
      </div>
      {showPresets ? (
        <div className="flex flex-wrap gap-2">
          {NODE_COLOR_PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              className="h-10 w-10 rounded-full border border-border shadow-sm transition hover:ring-2 hover:ring-primary/30"
              style={{ backgroundColor: hex }}
              onClick={() => onChange(hex)}
              aria-label={`Use color ${hex}`}
              title={hex}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onChange(tags.filter((value) => value !== tag))}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-hover py-1 pl-3 pr-2 text-xs font-medium text-text transition hover:bg-danger-soft hover:text-danger-text"
              data-testid={`node-tag-${tag}`}
              aria-label={`Remove tag ${tag}`}
            >
              <span>{tag}</span>
              <IconX className="size-5 shrink-0" stroke={2} aria-hidden />
            </button>
          ))
        ) : (
          <p className="text-sm text-text-muted">No tags yet.</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add tag"
          data-testid="node-tag-input"
        />
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
          onClick={() => {
            const next = draft.trim();

            if (!next || tags.includes(next)) {
              return;
            }

            onChange([...tags, next]);
            setDraft('');
          }}
          data-testid="add-node-tag-button"
        >
          Add
        </button>
      </div>
    </div>
  );
}

type NodeTabId = 'content' | 'style' | 'tags';
type EdgeTabId = 'content' | 'style';

const NODE_BORDER_STYLE_OPTIONS = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' },
] as const;

function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  testId = 'properties-tab-list',
}: {
  tabs: Array<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
  testId?: string;
}) {
  return (
    <div
      className="flex gap-1 rounded-xl border border-border bg-surface-muted p-1"
      role="tablist"
      data-testid={testId}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          className={
            active === tab.id
              ? 'flex-1 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-text shadow-soft ring-1 ring-primary/25'
              : 'flex-1 rounded-lg px-3 py-2 text-xs font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'
          }
          onClick={() => onChange(tab.id)}
          data-testid={`properties-tab-${tab.id}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function EditorPropertiesPanel({
  diagram,
  selectedNode,
  selectedEdge,
  onChangeNodeLabel,
  onChangeNodeStyle,
  onChangeNodeTags,
  onChangeNodeIcon,
  onChangeNodeBadgeLabel,
  onPatchNodeData,
  onChangeEdgeLabel,
  onChangeEdgeStyle,
  onDeleteEdge,
  onChangeDiagramDescription,
  onChangeDiagramTags,
}: EditorPropertiesPanelProps) {
  const [nodeTab, setNodeTab] = useState<NodeTabId>('content');
  const [edgeTab, setEdgeTab] = useState<EdgeTabId>('content');

  useEffect(() => {
    setNodeTab('content');
  }, [selectedNode?.id]);

  useEffect(() => {
    setEdgeTab('content');
  }, [selectedEdge?.id]);

  if (selectedNode) {
    const definition = getNodeDefinition(selectedNode.data.type);
    const nodeType = selectedNode.data.type;
    const isPrimitiveShape = nodeType.startsWith('shape-');
    const isHelper = nodeType === 'helper';
    const labelLength = String(selectedNode.data.label ?? '').length;
    const showsNodeTitleField =
      !isPrimitiveShape &&
      definition.kind !== 'note' &&
      selectedNode.data.type !== 'text' &&
      selectedNode.data.type !== 'helper' &&
      selectedNode.data.type !== 'group';
    const panelTitle =
      typeof selectedNode.data.badgeLabel === 'string' &&
      selectedNode.data.badgeLabel.length > 0
        ? selectedNode.data.badgeLabel
        : definition.label;

    return (
      <Card
        className="flex h-full flex-col gap-4 overflow-y-auto p-5"
        data-testid="editor-properties-panel"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-text-subtle">
            Properties
          </p>
          <h3
            className="mt-2 text-lg font-semibold text-text"
            data-testid="properties-selected-node-heading"
          >
            {panelTitle}
          </h3>
        </div>

        <TabBar
          testId="properties-node-tab-list"
          tabs={[
            { id: 'content', label: 'Content' },
            { id: 'style', label: 'Style' },
            { id: 'tags', label: 'Tags' },
          ]}
          active={nodeTab}
          onChange={setNodeTab}
        />

        {nodeTab === 'content' ? (
          <div className="space-y-5">
            {showsNodeTitleField ? (
              <LabeledField label="Title on node">
                <Input
                  value={selectedNode.data.badgeLabel ?? ''}
                  onChange={(event) =>
                    onChangeNodeBadgeLabel(
                      event.target.value.trim() === ''
                        ? undefined
                        : event.target.value,
                    )
                  }
                  placeholder={definition.label}
                  spellCheck={false}
                  data-testid="properties-node-badge-label-input"
                />
                <p className="text-xs text-text-muted">
                  Shown on the canvas chip. Leave empty to use the default type
                  name ({definition.label}).
                </p>
              </LabeledField>
            ) : null}
            {isPrimitiveShape ? (
              <LabeledField label="Text inside shape">
                <textarea
                  value={selectedNode.data.label}
                  onChange={(event) => onChangeNodeLabel(event.target.value)}
                  placeholder="Optional — centered on the shape"
                  spellCheck={false}
                  className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                  data-testid="properties-shape-text-input"
                />
                <p className="text-xs text-text-muted">
                  {labelLength} character{labelLength === 1 ? '' : 's'}. Leave
                  empty for a plain shape.
                </p>
              </LabeledField>
            ) : null}
            {nodeType === 'custom-input' ? (
              <>
                <LabeledField label="Fields">
                  <div className="space-y-3">
                    {(Array.isArray(selectedNode.data.inputFields) &&
                    selectedNode.data.inputFields.length > 0
                      ? selectedNode.data.inputFields
                      : [
                          {
                            id: 'field-0',
                            label: selectedNode.data.label || 'Label',
                            value: String(selectedNode.data.value ?? ''),
                          },
                        ]
                    ).map((field, idx, all) => (
                      <div
                        key={field.id}
                        className="rounded-xl border border-border bg-surface p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-subtle">
                            Field {idx + 1}
                          </p>
                          <button
                            type="button"
                            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-semibold text-text-muted transition hover:bg-surface-hover hover:text-text"
                            onClick={() => {
                              const next = all.filter((f) => f.id !== field.id);
                              onPatchNodeData({
                                inputFields: next.length > 0 ? next : [],
                              });
                            }}
                            data-testid={`properties-custom-input-remove-${field.id}`}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 space-y-2">
                          <LabeledField label="Label">
                            <Input
                              value={field.label}
                              onChange={(event) => {
                                const next = all.map((f) =>
                                  f.id === field.id
                                    ? { ...f, label: event.target.value }
                                    : f,
                                );
                                onPatchNodeData({ inputFields: next });
                              }}
                              data-testid={`properties-custom-input-field-label-${field.id}`}
                            />
                          </LabeledField>
                          <LabeledField label="Value">
                            <Input
                              value={field.value}
                              onChange={(event) => {
                                const next = all.map((f) =>
                                  f.id === field.id
                                    ? { ...f, value: event.target.value }
                                    : f,
                                );
                                onPatchNodeData({ inputFields: next });
                              }}
                              data-testid={`properties-custom-input-field-value-${field.id}`}
                            />
                          </LabeledField>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-end">
                      <Tooltip content="Add field">
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
                          onClick={() => {
                            const current =
                              Array.isArray(selectedNode.data.inputFields) &&
                              selectedNode.data.inputFields.length > 0
                                ? selectedNode.data.inputFields
                                : [
                                    {
                                      id: 'field-0',
                                      label: selectedNode.data.label || 'Label',
                                      value: String(
                                        selectedNode.data.value ?? '',
                                      ),
                                    },
                                  ];
                            const next = [
                              ...current,
                              {
                                id: `field-${crypto.randomUUID()}`,
                                label: 'Label',
                                value: '',
                              },
                            ];
                            onPatchNodeData({ inputFields: next });
                          }}
                          aria-label="Add field"
                          data-testid="properties-custom-input-add-field"
                        >
                          <IconPlus
                            className="h-5 w-5"
                            stroke={1.9}
                            aria-hidden
                          />
                        </button>
                      </Tooltip>
                    </div>
                    <p className="text-xs text-text-muted">
                      Fields render inside the node as label + input.
                    </p>
                  </div>
                </LabeledField>
              </>
            ) : null}

            {nodeType === 'counter' ? (
              <>
                <LabeledField label="Label">
                  <Input
                    value={selectedNode.data.label}
                    onChange={(event) => onChangeNodeLabel(event.target.value)}
                    data-testid="properties-counter-label"
                  />
                </LabeledField>
                <LabeledField label="Value">
                  <Input
                    type="number"
                    value={Number(selectedNode.data.value ?? 0)}
                    onChange={(event) =>
                      onPatchNodeData({ value: Number(event.target.value) })
                    }
                    data-testid="properties-counter-value"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition hover:bg-surface-hover"
                      onClick={() =>
                        onPatchNodeData({
                          value: Number(selectedNode.data.value ?? 0) - 1,
                        })
                      }
                      data-testid="properties-counter-decrement"
                    >
                      −1
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition hover:bg-surface-hover"
                      onClick={() =>
                        onPatchNodeData({
                          value: Number(selectedNode.data.value ?? 0) + 1,
                        })
                      }
                      data-testid="properties-counter-increment"
                    >
                      +1
                    </button>
                  </div>
                </LabeledField>
              </>
            ) : null}

            {nodeType === 'architecture' ? (
              <>
                <LabeledField label="Title">
                  <Input
                    value={selectedNode.data.label}
                    onChange={(event) => onChangeNodeLabel(event.target.value)}
                    data-testid="properties-architecture-title"
                  />
                </LabeledField>
                <LabeledField label="Subtitle">
                  <Input
                    value={selectedNode.data.subtitle ?? ''}
                    onChange={(event) =>
                      onPatchNodeData({
                        subtitle:
                          event.target.value.trim() === ''
                            ? undefined
                            : event.target.value,
                      })
                    }
                    data-testid="properties-architecture-subtitle"
                  />
                </LabeledField>
                <LabeledField label="Status">
                  <div className="flex gap-2">
                    {(['default', 'success', 'warning', 'danger'] as const).map(
                      (status) => {
                        const active =
                          (selectedNode.data.status ?? 'default') === status;
                        return (
                          <button
                            key={status}
                            type="button"
                            className={
                              active
                                ? 'flex-1 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-text shadow-soft'
                                : 'flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'
                            }
                            onClick={() => onPatchNodeData({ status })}
                            data-testid={`properties-architecture-status-${status}`}
                          >
                            {status}
                          </button>
                        );
                      },
                    )}
                  </div>
                </LabeledField>
              </>
            ) : null}

            {nodeType === 'svg-shape' ? (
              <>
                <LabeledField label="Shape">
                  <div className="flex gap-2">
                    {(['rectangle', 'hex', 'diamond', 'triangle'] as const).map(
                      (shape) => {
                        const active =
                          String(selectedNode.data.value ?? 'rectangle') ===
                          shape;
                        return (
                          <button
                            key={shape}
                            type="button"
                            className={
                              active
                                ? 'flex-1 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-text shadow-soft'
                                : 'flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'
                            }
                            onClick={() => onPatchNodeData({ value: shape })}
                            data-testid={`properties-svg-shape-${shape}`}
                          >
                            {shape}
                          </button>
                        );
                      },
                    )}
                  </div>
                </LabeledField>
                <LabeledField label="Image inside shape">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-text-muted file:mr-3 file:rounded-lg file:border file:border-border file:bg-surface file:px-3 file:py-2 file:text-sm file:font-semibold file:text-text hover:file:bg-surface-hover"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result =
                          typeof reader.result === 'string'
                            ? reader.result
                            : '';
                        if (result) onPatchNodeData({ avatar: result });
                      };
                      reader.readAsDataURL(file);
                    }}
                    data-testid="properties-svg-image-upload"
                  />
                  {selectedNode.data.avatar ? (
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center justify-center rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold text-text transition hover:bg-surface-hover"
                      onClick={() => onPatchNodeData({ avatar: undefined })}
                      data-testid="properties-svg-image-clear"
                    >
                      Clear image
                    </button>
                  ) : null}
                  <p className="text-xs text-text-muted">
                    Stored locally inside the diagram and exported with PNG/PDF.
                  </p>
                </LabeledField>
              </>
            ) : null}

            {nodeType !== 'custom-input' &&
            nodeType !== 'counter' &&
            nodeType !== 'architecture' &&
            nodeType !== 'svg-shape' &&
            nodeType !== 'group' &&
            !isPrimitiveShape ? (
              <LabeledField label="Text">
                <textarea
                  value={selectedNode.data.label}
                  onChange={(event) => onChangeNodeLabel(event.target.value)}
                  className="min-h-32 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                  data-testid="properties-node-label-input"
                />
                <p className="text-xs text-text-muted">
                  {labelLength} character{labelLength === 1 ? '' : 's'}
                </p>
              </LabeledField>
            ) : null}
          </div>
        ) : null}

        {nodeTab === 'style' ? (
          <div className="space-y-5">
            {isHelper ? (
              <>
                <LabeledField label="Text color">
                  <ColorInput
                    value={
                      selectedNode.data.style?.textColor?.trim() ?? '#0f172a'
                    }
                    onChange={(textColor) =>
                      onChangeNodeStyle({
                        ...selectedNode.data.style,
                        textColor,
                      })
                    }
                    onClear={() =>
                      onChangeNodeStyle({
                        ...selectedNode.data.style,
                        textColor: undefined,
                      })
                    }
                    testId="properties-helper-text-color"
                    showPresets
                  />
                </LabeledField>
                <LabeledField label="Font size">
                  <Input
                    type="number"
                    min={8}
                    max={96}
                    value={selectedNode.data.style?.fontSize ?? 16}
                    onChange={(event) =>
                      onChangeNodeStyle({
                        ...selectedNode.data.style,
                        fontSize: Number(event.target.value),
                      })
                    }
                    data-testid="properties-helper-font-size"
                  />
                </LabeledField>
                <LabeledField label="Font weight">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        'normal',
                        'medium',
                        'semibold',
                        'bold',
                      ] as HelperFontWeight[]
                    ).map((fw) => {
                      const active =
                        (selectedNode.data.style?.fontWeight ?? 'normal') ===
                        fw;
                      return (
                        <button
                          key={fw}
                          type="button"
                          className={
                            active
                              ? 'flex-1 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-text shadow-soft'
                              : 'flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'
                          }
                          onClick={() =>
                            onChangeNodeStyle({
                              ...selectedNode.data.style,
                              fontWeight: fw,
                            })
                          }
                          data-testid={`properties-helper-font-weight-${fw}`}
                        >
                          {fw}
                        </button>
                      );
                    })}
                  </div>
                </LabeledField>
                <LabeledField label="Text alignment">
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map((align) => {
                      const active =
                        (selectedNode.data.style?.textAlign ?? 'left') ===
                        align;
                      return (
                        <button
                          key={align}
                          type="button"
                          className={
                            active
                              ? 'flex-1 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-text shadow-soft'
                              : 'flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'
                          }
                          onClick={() =>
                            onChangeNodeStyle({
                              ...selectedNode.data.style,
                              textAlign: align,
                            })
                          }
                          data-testid={`properties-helper-align-${align}`}
                        >
                          {align}
                        </button>
                      );
                    })}
                  </div>
                </LabeledField>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={Boolean(
                      selectedNode.data.style?.backgroundEnabled,
                    )}
                    onChange={(event) => {
                      const on = event.target.checked;
                      const prev = selectedNode.data.style ?? {};
                      onChangeNodeStyle({
                        ...prev,
                        backgroundEnabled: on,
                        ...(on &&
                        (!prev.backgroundColor ||
                          prev.backgroundColor === 'transparent')
                          ? { backgroundColor: 'rgba(30, 41, 59, 0.6)' }
                          : {}),
                      });
                    }}
                    data-testid="properties-helper-bg-enabled"
                  />
                  Background
                </label>
                {selectedNode.data.style?.backgroundEnabled ? (
                  <LabeledField label="Background color">
                    <ColorInput
                      value={resolveNodeBackgroundColor(
                        selectedNode.data.style?.backgroundColor,
                      )}
                      onChange={(backgroundColor) =>
                        onChangeNodeStyle({
                          ...selectedNode.data.style,
                          backgroundColor,
                        })
                      }
                      onClear={() =>
                        onChangeNodeStyle({
                          ...selectedNode.data.style,
                          backgroundColor: 'transparent',
                        })
                      }
                      testId="properties-helper-bg-color"
                      showPresets
                    />
                  </LabeledField>
                ) : null}
                <LabeledField label="Opacity">
                  <Input
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={selectedNode.data.style?.opacity ?? 1}
                    onChange={(event) =>
                      onChangeNodeStyle({
                        ...selectedNode.data.style,
                        opacity: Number(event.target.value),
                      })
                    }
                    data-testid="properties-helper-opacity"
                  />
                </LabeledField>
                <LabeledField label="Width">
                  <Input
                    type="number"
                    min={80}
                    max={2000}
                    value={selectedNode.data.style?.width ?? ''}
                    onChange={(event) => {
                      const raw = event.target.value;
                      onChangeNodeStyle({
                        ...selectedNode.data.style,
                        width:
                          raw === '' ? undefined : Math.max(80, Number(raw)),
                      });
                    }}
                    data-testid="properties-helper-width"
                  />
                </LabeledField>
                <LabeledField label="Height">
                  <Input
                    type="number"
                    min={24}
                    max={2000}
                    value={selectedNode.data.style?.height ?? ''}
                    onChange={(event) => {
                      const raw = event.target.value;
                      onChangeNodeStyle({
                        ...selectedNode.data.style,
                        height:
                          raw === '' ? undefined : Math.max(24, Number(raw)),
                      });
                    }}
                    data-testid="properties-helper-height"
                  />
                </LabeledField>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={
                      (selectedNode.data.style?.fontStyle ?? 'normal') ===
                      'italic'
                    }
                    onChange={(event) =>
                      onChangeNodeStyle({
                        ...selectedNode.data.style,
                        fontStyle: event.target.checked ? 'italic' : 'normal',
                      })
                    }
                    data-testid="properties-helper-italic"
                  />
                  Italic
                </label>
                {selectedNode.data.helperType === 'small-label' ? (
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-text">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border"
                      checked={
                        selectedNode.data.style?.textTransform === 'uppercase'
                      }
                      onChange={(event) =>
                        onChangeNodeStyle({
                          ...selectedNode.data.style,
                          textTransform: event.target.checked
                            ? 'uppercase'
                            : 'none',
                        })
                      }
                      data-testid="properties-helper-uppercase"
                    />
                    Uppercase (small label)
                  </label>
                ) : null}
              </>
            ) : null}
            {!isHelper && nodeType !== 'circle-compact' && !isPrimitiveShape ? (
              <LabeledField label="Icon">
                <IconSelectDropdown
                  value={selectedNode.data.icon}
                  onChange={onChangeNodeIcon}
                />
              </LabeledField>
            ) : null}
            {!isHelper ? (
              <>
                <LabeledField label={isPrimitiveShape ? 'Fill' : 'Background'}>
                  <ColorInput
                    value={resolveNodeBackgroundColor(
                      selectedNode.data.style?.fillColor ??
                        selectedNode.data.style?.backgroundColor,
                    )}
                    onChange={(backgroundColor) =>
                      onChangeNodeStyle(
                        isPrimitiveShape
                          ? { fillColor: backgroundColor }
                          : { backgroundColor },
                      )
                    }
                    onClear={() =>
                      onChangeNodeStyle(
                        isPrimitiveShape
                          ? { fillColor: 'transparent' }
                          : { backgroundColor: 'transparent' },
                      )
                    }
                    testId="properties-node-background-color"
                    showPresets
                  />
                </LabeledField>
                <LabeledField label="Border">
                  <ColorInput
                    value={resolveNodeBorderColor(
                      selectedNode.data.style?.borderColor,
                    )}
                    onChange={(borderColor) =>
                      onChangeNodeStyle({ borderColor })
                    }
                    onClear={() =>
                      onChangeNodeStyle({ borderColor: 'transparent' })
                    }
                    testId="properties-node-border-color"
                    showPresets
                  />
                </LabeledField>
                <LabeledField label="Border width">
                  <Input
                    type="number"
                    min={0}
                    max={12}
                    value={selectedNode.data.style?.borderWidth ?? 1}
                    onChange={(event) =>
                      onChangeNodeStyle({
                        borderWidth: Number(event.target.value),
                      })
                    }
                    data-testid="properties-node-border-width-input"
                  />
                </LabeledField>
                <LabeledField label="Border style">
                  <div className="flex gap-2">
                    {NODE_BORDER_STYLE_OPTIONS.map((option) => {
                      const active =
                        (selectedNode.data.style?.borderStyle ?? 'solid') ===
                        option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={
                            active
                              ? 'flex-1 rounded-lg bg-surface px-3 py-2 text-xs font-semibold text-text shadow-soft'
                              : 'flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-text-muted transition hover:bg-surface-hover hover:text-text'
                          }
                          onClick={() =>
                            onChangeNodeStyle({ borderStyle: option.id })
                          }
                          data-testid={`properties-node-border-style-${option.id}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </LabeledField>
                <LabeledField label="Text size">
                  <Input
                    type="number"
                    min={14}
                    max={38}
                    value={selectedNode.data.style?.fontSize ?? 17}
                    onChange={(event) =>
                      onChangeNodeStyle({
                        fontSize: Number(event.target.value),
                      })
                    }
                    data-testid="properties-node-font-size-input"
                  />
                </LabeledField>

                {isPrimitiveShape ? (
                  <>
                    <LabeledField label="Width">
                      <Input
                        type="number"
                        min={48}
                        max={2000}
                        value={selectedNode.data.style?.width ?? 160}
                        onChange={(event) =>
                          onChangeNodeStyle({
                            width: Number(event.target.value),
                          })
                        }
                        data-testid="properties-shape-width"
                      />
                    </LabeledField>
                    <LabeledField label="Height">
                      <Input
                        type="number"
                        min={48}
                        max={2000}
                        value={selectedNode.data.style?.height ?? 160}
                        onChange={(event) =>
                          onChangeNodeStyle({
                            height: Number(event.target.value),
                          })
                        }
                        data-testid="properties-shape-height"
                      />
                    </LabeledField>
                    {nodeType === 'shape-circle' ? (
                      <p className="text-xs text-text-muted">
                        Circle keeps equal width and height.
                      </p>
                    ) : null}
                  </>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}

        {nodeTab === 'tags' ? (
          <LabeledField label="Tags">
            <TagEditor
              key={selectedNode.id}
              tags={selectedNode.data.tags ?? []}
              onChange={onChangeNodeTags}
            />
          </LabeledField>
        ) : null}
      </Card>
    );
  }

  if (selectedEdge) {
    return (
      <Card
        className="flex h-full flex-col gap-4 overflow-y-auto p-5"
        data-testid="editor-properties-panel"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-text-subtle">
            Connection properties
          </p>
          <h3
            className="mt-2 text-lg font-semibold text-text"
            data-testid="properties-selected-edge-heading"
          >
            Edge styling
          </h3>
        </div>

        <TabBar
          testId="properties-edge-tab-list"
          tabs={[
            { id: 'content', label: 'Content' },
            { id: 'style', label: 'Style' },
          ]}
          active={edgeTab}
          onChange={setEdgeTab}
        />

        {edgeTab === 'content' ? (
          <LabeledField label="Label">
            <Input
              value={selectedEdge.data?.label ?? ''}
              onChange={(event) => onChangeEdgeLabel(event.target.value)}
              data-testid="properties-edge-label-input"
            />
          </LabeledField>
        ) : null}

        {edgeTab === 'style' ? (
          <div className="space-y-5">
            <LabeledField label="Color">
              <ColorInput
                value={resolveEdgeColor(selectedEdge.data?.color)}
                onChange={(color) => onChangeEdgeStyle({ color })}
                testId="properties-edge-color-input"
                showPresets
              />
            </LabeledField>
            <LabeledField label="Width">
              <select
                value={selectedEdge.data?.width ?? 2}
                onChange={(event) =>
                  onChangeEdgeStyle({
                    width: Number(event.target.value),
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                data-testid="properties-edge-width-select"
              >
                {EDGE_WIDTH_OPTIONS.map((width) => (
                  <option key={width} value={width}>
                    {width}px
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField label="Line style">
              <select
                value={selectedEdge.data?.lineStyle ?? 'solid'}
                onChange={(event) =>
                  onChangeEdgeStyle({
                    lineStyle: event.target.value as DiagramEdgeLineStyle,
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                data-testid="properties-edge-line-style-select"
              >
                {EDGE_LINE_STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField label="Shape">
              <select
                value={selectedEdge.data?.edgeType ?? 'smoothstep'}
                onChange={(event) =>
                  onChangeEdgeStyle({
                    edgeType: event.target.value as DiagramEdgeType,
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                data-testid="properties-edge-type-select"
              >
                {EDGE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField label="Arrow marker">
              <select
                value={selectedEdge.data?.markerKind ?? 'arrow'}
                onChange={(event) =>
                  onChangeEdgeStyle({
                    markerKind: event.target.value as DiagramEdgeMarkerKind,
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                data-testid="properties-edge-marker-kind-select"
              >
                {EDGE_MARKER_KIND_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </LabeledField>
            <LabeledField label="Arrow position">
              <select
                value={selectedEdge.data?.markerPosition ?? 'end'}
                onChange={(event) =>
                  onChangeEdgeStyle({
                    markerPosition: event.target
                      .value as DiagramEdgeMarkerPosition,
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
                data-testid="properties-edge-marker-position-select"
              >
                {EDGE_MARKER_POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </LabeledField>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface-muted/50 px-3 py-2.5">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary"
                checked={Boolean(selectedEdge.data?.animated)}
                onChange={(event) =>
                  onChangeEdgeStyle({ animated: event.target.checked })
                }
                data-testid="properties-edge-animated"
              />
              <span className="text-sm font-medium text-text">
                Animate edge (flow along line)
              </span>
            </label>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-subtle">
              Label appearance
            </p>
            <LabeledField label="Label text color">
              <ColorInput
                value={
                  selectedEdge.data?.labelColor
                    ? resolveEdgeColor(selectedEdge.data.labelColor)
                    : DEFAULT_EDGE_LABEL_TEXT
                }
                onChange={(color) => onChangeEdgeStyle({ labelColor: color })}
                onClear={() => onChangeEdgeStyle({ labelColor: undefined })}
                testId="properties-edge-label-color"
                showPresets
              />
            </LabeledField>
            <LabeledField label="Label size">
              <Input
                type="number"
                min={11}
                max={26}
                value={selectedEdge.data?.labelFontSize ?? 13}
                onChange={(event) =>
                  onChangeEdgeStyle({
                    labelFontSize: Number(event.target.value),
                  })
                }
                data-testid="properties-edge-label-font-size"
              />
            </LabeledField>
            <LabeledField label="Label background">
              <ColorInput
                value={
                  selectedEdge.data?.labelBackgroundColor === undefined ||
                  selectedEdge.data?.labelBackgroundColor === 'transparent'
                    ? 'transparent'
                    : resolveNodeBackgroundColor(
                        selectedEdge.data.labelBackgroundColor,
                      )
                }
                onChange={(color) =>
                  onChangeEdgeStyle({ labelBackgroundColor: color })
                }
                onClear={() =>
                  onChangeEdgeStyle({ labelBackgroundColor: 'transparent' })
                }
                testId="properties-edge-label-bg"
                showPresets
              />
            </LabeledField>
            <LabeledField label="Label border">
              <ColorInput
                value={
                  selectedEdge.data?.labelBorderColor === undefined ||
                  selectedEdge.data?.labelBorderColor === 'transparent'
                    ? 'transparent'
                    : resolveNodeBorderColor(selectedEdge.data.labelBorderColor)
                }
                onChange={(color) =>
                  onChangeEdgeStyle({ labelBorderColor: color })
                }
                onClear={() =>
                  onChangeEdgeStyle({ labelBorderColor: 'transparent' })
                }
                testId="properties-edge-label-border"
                showPresets
              />
            </LabeledField>
            <button
              type="button"
              className="w-full rounded-lg bg-danger px-4 py-2 text-sm font-medium text-text-inverse transition hover:bg-danger/90"
              onClick={onDeleteEdge}
              data-testid="delete-edge-button"
            >
              Delete edge
            </button>
          </div>
        ) : null}
      </Card>
    );
  }

  return (
    <Card
      className="flex h-full flex-col gap-5 overflow-y-auto p-5"
      data-testid="editor-properties-panel"
    >
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-text-subtle">
          Diagram
        </p>
        <h3 className="mt-2 text-lg font-semibold text-text">
          Description & tags
        </h3>
      </div>
      <LabeledField label="Description">
        <textarea
          value={diagram.description ?? ''}
          onChange={(event) => onChangeDiagramDescription(event.target.value)}
          className="min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text"
          data-testid="diagram-description-input"
        />
      </LabeledField>
      <LabeledField label="Tags">
        <Input
          value={(diagram.tags ?? []).join(', ')}
          onChange={(event) => onChangeDiagramTags(event.target.value)}
          placeholder="Comma-separated"
          data-testid="diagram-tags-input"
        />
      </LabeledField>
      <p className="text-sm text-text-muted">
        Pick a shape on the left, then configure content, style, and tags from
        this panel.
      </p>
    </Card>
  );
}
