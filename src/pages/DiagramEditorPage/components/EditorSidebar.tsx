import {
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconLine,
  IconSearch,
  IconSquare,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';
import { Tooltip } from '@components/ui/Tooltip';

import {
  BLOCK_LIBRARY_TABS,
  type BlockLibraryNodeItem,
} from '@configs/blockLibrary.config';
import { renderIcon } from '@configs/iconLibrary.config';

import { duplicateShortcutLabel } from '@utils/platform';
import {
  readRecentShapeIds,
  readSidebarExpandedTabs,
  rememberRecentShapeId,
  resolveRecentItems,
  writeSidebarExpandedTabs,
  type SidebarExpandedMap,
} from '@utils/sidebarPreferences';

const SIDEBAR_TAB_ORDER = ['blocks'] as const;

function defaultExpandedMap(): SidebarExpandedMap {
  return Object.fromEntries(SIDEBAR_TAB_ORDER.map((id) => [id, true]));
}

const ALL_LIBRARY_NODES: BlockLibraryNodeItem[] = BLOCK_LIBRARY_TABS.flatMap(
  (tab) => tab.items,
).filter((item): item is BlockLibraryNodeItem => item.kind === 'node');

function matchesSearch(item: BlockLibraryNodeItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }

  return (
    item.label.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.id.toLowerCase().includes(q)
  );
}

function ShapeItemButton({
  item,
  onPick,
  showTooltip = true,
  compact = false,
}: {
  item: BlockLibraryNodeItem;
  onPick: (item: BlockLibraryNodeItem) => void;
  showTooltip?: boolean;
  compact?: boolean;
}) {
  const previewGlyph = item.iconName ? (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface shadow-inner">
      {renderIcon(item.iconName, {
        className: 'h-7 w-7',
        strokeWidth: 1.65,
      })}
    </div>
  ) : (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted text-xs font-semibold text-text-muted">
      {item.preview}
    </div>
  );

  const tip = compact ? (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-text">{item.label}</p>
      <p className="text-sm leading-snug text-text-muted">{item.description}</p>
      <p className="text-xs font-medium text-text-subtle">
        Click or drag to add
      </p>
    </div>
  ) : (
    <div className="space-y-2">
      <div className="flex justify-center">{previewGlyph}</div>
      <p className="text-xs font-semibold text-text">{item.label}</p>
      <p className="text-[13px] leading-snug text-text-muted">
        {item.description}
      </p>
      <p className="text-[12px] text-text-subtle">Click or drag to add</p>
    </div>
  );

  const button = (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        rememberRecentShapeId(item.id);
        event.dataTransfer.setData(
          'application/flowcraft-block-item',
          JSON.stringify(item),
        );
        event.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onPick(item)}
      className={
        compact
          ? 'group relative flex w-full items-center justify-center rounded-xl border border-border bg-surface-muted p-2 transition hover:border-primary/30 hover:bg-surface-selected'
          : 'group relative flex w-full items-start gap-3 rounded-xl border border-border bg-surface-muted p-3 text-left transition hover:border-primary/30 hover:bg-surface-selected'
      }
      data-testid={`library-item-${item.id}`}
      aria-label={compact ? item.label : undefined}
      title={compact ? item.label : undefined}
    >
      {compact ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-text shadow-soft transition group-hover:ring-2 group-hover:ring-primary/20">
          {item.iconName ? (
            renderIcon(item.iconName, {
              className: 'h-6 w-6',
              strokeWidth: 1.65,
            })
          ) : (
            <span className="text-sm font-semibold text-text-muted">
              {item.preview}
            </span>
          )}
        </div>
      ) : (
        <>
          <div className="mt-0.5 flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface text-text shadow-soft transition group-hover:ring-2 group-hover:ring-primary/20">
            {item.iconName ? (
              renderIcon(item.iconName, {
                className: 'h-7 w-7',
                strokeWidth: 1.65,
              })
            ) : (
              <span className="text-lg text-text-muted">{item.preview}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-text">
                {item.label}
              </p>
              <span className="flex h-6 w-10 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-[12px] text-text-muted">
                {item.preview}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-text-muted">
              {item.description}
            </p>
          </div>
        </>
      )}
    </button>
  );

  return showTooltip ? (
    <Tooltip content={tip} block={!compact}>
      {button}
    </Tooltip>
  ) : (
    button
  );
}

export interface EditorSidebarProps {
  selectedNodeCount: number;
  selectedEdgeCount: number;
  canGroup: boolean;
  canUngroup: boolean;
  onAddBlock: (item: BlockLibraryNodeItem) => void;
  onDeleteSelection: () => void;
  onDuplicateSelection: () => void;
  onGroupSelection: () => void;
  onUngroupSelection: () => void;
}

export function EditorSidebar({
  selectedNodeCount,
  selectedEdgeCount,
  canGroup,
  canUngroup,
  onAddBlock,
  onDeleteSelection,
  onDuplicateSelection,
  onGroupSelection,
  onUngroupSelection,
}: EditorSidebarProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<SidebarExpandedMap>(() => ({
    ...defaultExpandedMap(),
    ...readSidebarExpandedTabs(),
  }));
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    readRecentShapeIds(),
  );

  useEffect(() => {
    writeSidebarExpandedTabs(expanded);
  }, [expanded]);

  const handlePick = useCallback(
    (item: BlockLibraryNodeItem) => {
      rememberRecentShapeId(item.id);
      setRecentIds(readRecentShapeIds());
      onAddBlock(item);
    },
    [onAddBlock],
  );

  const recentItems = useMemo(
    () => resolveRecentItems(recentIds, ALL_LIBRARY_NODES),
    [recentIds],
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) {
      return [];
    }

    return ALL_LIBRARY_NODES.filter((item) => matchesSearch(item, search));
  }, [search]);

  const tabsWithNodes = useMemo(() => {
    const orderIndex = (id: string) =>
      SIDEBAR_TAB_ORDER.indexOf(id as (typeof SIDEBAR_TAB_ORDER)[number]);

    return BLOCK_LIBRARY_TABS.filter(
      (tab) =>
        orderIndex(tab.id) >= 0 &&
        tab.items.some((item) => item.kind === 'node'),
    ).sort((a, b) => orderIndex(a.id) - orderIndex(b.id));
  }, []);

  return (
    <Card
      className="flex h-full flex-col gap-4 overflow-x-visible overflow-y-auto p-4"
      data-testid="editor-sidebar"
    >
      <section className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-text-subtle">
          Block library
        </p>
        <p className="text-sm font-medium text-text-muted">
          Start from neutral blocks, then set icon, color, and label in
          properties. Save the diagram or use templates when you want a reusable
          layout.
        </p>
      </section>

      <div className="relative">
        <IconSearch
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-subtle"
          stroke={1.75}
          aria-hidden
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search blocks…"
          data-testid="shape-library-search"
          aria-label="Search blocks"
          autoComplete="off"
          className="pl-10"
        />
      </div>

      {search.trim() ? (
        <section className="space-y-2">
          <p className="text-xs font-medium text-text-muted">
            {searchResults.length} result{searchResults.length === 1 ? '' : 's'}
          </p>
          {searchResults.length === 0 ? (
            <p className="text-sm text-text-muted">
              No blocks match that query.
            </p>
          ) : (
            <div className="grid gap-2">
              {searchResults.map((item) => (
                <ShapeItemButton
                  key={item.id}
                  item={item}
                  onPick={handlePick}
                  showTooltip={false}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {recentItems.length > 0 ? (
            <section className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-subtle">
                Recently used
              </p>
              <div className="grid grid-cols-4 gap-2">
                {recentItems.map((item) => (
                  <ShapeItemButton
                    key={item.id}
                    item={item}
                    onPick={handlePick}
                    showTooltip
                    compact
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="space-y-2">
            {tabsWithNodes.map((tab) => {
              const nodes = tab.items.filter(
                (item): item is BlockLibraryNodeItem => item.kind === 'node',
              );
              const isOpen = expanded[tab.id] ?? true;

              return (
                <div
                  key={tab.id}
                  className="rounded-xl border border-border bg-surface-muted/60"
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-semibold text-text transition hover:bg-surface-hover"
                    onClick={() =>
                      setExpanded((current) => ({
                        ...current,
                        [tab.id]: !isOpen,
                      }))
                    }
                    aria-expanded={isOpen}
                    data-testid={`shape-category-${tab.id}`}
                  >
                    <span>{tab.label}</span>
                    {isOpen ? (
                      <IconChevronDown
                        className="h-4 w-4 text-text-subtle"
                        aria-hidden
                      />
                    ) : (
                      <IconChevronRight
                        className="h-4 w-4 text-text-subtle"
                        aria-hidden
                      />
                    )}
                  </button>
                  {isOpen ? (
                    <div className="space-y-2 border-t border-border px-2 pb-3 pt-2">
                      {nodes.map((item) => (
                        <ShapeItemButton
                          key={item.id}
                          item={item}
                          onPick={handlePick}
                          showTooltip={false}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      )}

      <section className="mt-auto space-y-3 rounded-xl border border-border bg-surface-muted p-4">
        <div className="space-y-2 text-sm text-text-muted">
          <p
            className="flex items-center gap-2 text-text"
            data-testid="selected-node-count"
          >
            <IconSquare
              className="h-6 w-6 shrink-0 text-text-subtle"
              aria-hidden
            />
            <span>Selected nodes: {selectedNodeCount}</span>
          </p>
          <p
            className="flex items-center gap-2 text-text"
            data-testid="selected-edge-count"
          >
            <IconLine
              className="h-6 w-6 shrink-0 text-text-subtle"
              aria-hidden
            />
            <span>Selected edges: {selectedEdgeCount}</span>
          </p>
        </div>
        <div className="grid gap-2">
          <Tooltip
            content={
              <div className="space-y-2 text-left">
                <div className="flex justify-center rounded-xl border border-border bg-surface p-2.5 shadow-inner">
                  <IconCopy className="h-6 w-6 shrink-0" stroke={1.65} />
                </div>
                <p className="text-xs font-semibold text-text">Duplicate</p>
                <p className="text-[13px] leading-snug text-text-muted">
                  Clone the current selection with a small offset.{' '}
                  {duplicateShortcutLabel()}
                </p>
              </div>
            }
          >
            <Button
              onClick={onDuplicateSelection}
              variant="secondary"
              className="h-11 min-h-11 w-full"
              data-testid="duplicate-selection-button"
            >
              Duplicate
            </Button>
          </Tooltip>
          <Button
            onClick={onGroupSelection}
            variant="secondary"
            disabled={!canGroup}
            className="h-11 min-h-11 w-full"
            data-testid="group-selection-button"
          >
            Group
          </Button>
          <Button
            onClick={onUngroupSelection}
            variant="secondary"
            disabled={!canUngroup}
            className="h-11 min-h-11 w-full"
            data-testid="ungroup-selection-button"
          >
            Ungroup
          </Button>
          <Button
            onClick={onDeleteSelection}
            variant="secondary"
            className="h-11 min-h-11 w-full"
            data-testid="delete-selection-button"
          >
            Delete
          </Button>
        </div>
      </section>
    </Card>
  );
}
