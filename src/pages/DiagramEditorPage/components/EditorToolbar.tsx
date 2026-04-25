import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconDeviceFloppy,
  IconEye,
  IconFocusAuto,
  IconFocusCentered,
  IconGrid4x4,
  IconKeyboard,
  IconLayoutDashboard,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconMagnet,
  IconPencil,
  IconSettings,
  IconTargetArrow,
  IconToggleRight,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from '@tabler/icons-react';
import clsx from 'clsx';
import {
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';

import { ExportMenu } from '@pages/DiagramEditorPage/components/ExportMenu';

import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Tooltip } from '@components/ui/Tooltip';

import { SETTINGS_OPEN_EVENT } from '@configs/app';

import {
  redoShortcutLabel,
  saveShortcutLabel,
  undoShortcutLabel,
} from '@utils/platform';

import type { ExportFormat, ExportScope } from '../../../types/export';

export interface EditorToolbarProps {
  diagramName: string;
  saveStatus: string;
  zoomPercent: number;
  canUndo: boolean;
  canRedo: boolean;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onRenameDiagram: (name: string) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomTo100: () => void;
  onZoomToSelection: () => void;
  onCenterSelection: () => void;
  onToggleLeftSidebar: () => void;
  onToggleRightSidebar: () => void;
  showGrid: boolean;
  snapToGrid: boolean;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onShowShortcuts: () => void;
  onExport: (payload: {
    format: ExportFormat;
    includeBackground: boolean;
    scope: ExportScope;
  }) => void;
}

function ToolbarDivider() {
  return (
    <span
      className="hidden h-11 w-px shrink-0 bg-border sm:block"
      aria-hidden
    />
  );
}

function useOutsideClick(
  ref: React.RefObject<HTMLElement | null>,
  onOutside: () => void,
  active: boolean,
) {
  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const onDocMouseDown = (event: MouseEvent) => {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) {
        onOutside();
      }
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [active, onOutside, ref]);
}

function ToolbarMenu({
  label,
  icon,
  children,
  testId,
}: {
  label: string;
  icon: ReactElement;
  children: ReactNode;
  testId: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useOutsideClick(rootRef, () => setOpen(false), open);

  const sizedIcon = isValidElement(icon)
    ? cloneElement(
        icon as ReactElement<{ className?: string; strokeWidth?: number }>,
        {
          className: 'h-6 w-6 shrink-0',
          strokeWidth: 1.75,
        },
      )
    : icon;

  return (
    <div className="relative" ref={rootRef}>
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 min-h-11 items-center gap-2 rounded-xl px-3"
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid={testId}
      >
        {sizedIcon}
        <span className="text-xs font-semibold">{label}</span>
      </Button>
      {open ? (
        <Card
          className="absolute right-0 top-full z-50 mt-2 w-[17rem] border-border bg-background-elevated p-2 shadow-floating"
          role="menu"
        >
          {children}
        </Card>
      ) : null}
    </div>
  );
}

function ToolbarIconButton({
  ariaLabel,
  tooltip,
  onClick,
  disabled,
  icon,
  testId,
  toggled,
}: {
  ariaLabel: string;
  tooltip: string;
  onClick: () => void;
  disabled?: boolean;
  icon: ReactElement;
  testId: string;
  /** When set, uses filled style when `true` and quiet style when `false` (toolbar toggles). */
  toggled?: boolean;
}) {
  const sizedIcon = isValidElement(icon)
    ? cloneElement(
        icon as ReactElement<{ className?: string; strokeWidth?: number }>,
        {
          className: 'h-7 w-7 shrink-0',
          strokeWidth: 1.8,
        },
      )
    : icon;

  const variant =
    toggled === undefined ? 'secondary' : toggled ? 'secondary' : 'ghost';

  return (
    <Tooltip content={tooltip}>
      <Button
        type="button"
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={toggled !== undefined ? toggled : undefined}
        className="h-11 w-11 min-h-11 min-w-11 shrink-0 px-0"
        data-testid={testId}
      >
        {sizedIcon}
      </Button>
    </Tooltip>
  );
}

export function EditorToolbar({
  diagramName,
  saveStatus,
  zoomPercent,
  canUndo,
  canRedo,
  leftSidebarOpen,
  rightSidebarOpen,
  onRenameDiagram,
  onSave,
  onUndo,
  onRedo,
  onFitView,
  onZoomIn,
  onZoomOut,
  onZoomTo100,
  onZoomToSelection,
  onCenterSelection,
  onToggleLeftSidebar,
  onToggleRightSidebar,
  showGrid,
  snapToGrid,
  onToggleGrid,
  onToggleSnap,
  onShowShortcuts,
  onExport,
}: EditorToolbarProps) {
  const saveLabel = useMemo(() => {
    if (saveStatus === 'Saved') {
      return '✓ Saved locally';
    }

    if (saveStatus === 'Saving...') {
      return 'Saving…';
    }

    return `Unsaved — Save (${saveShortcutLabel()})`;
  }, [saveStatus]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-soft">
      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        <Tooltip content="Diagram list">
          <Link
            to="/"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text"
            data-testid="back-to-dashboard"
            aria-label="Back to dashboard"
          >
            <IconLayoutDashboard className="h-6 w-6" stroke={1.65} />
          </Link>
        </Tooltip>

        <ToolbarDivider />

        <ToolbarIconButton
          ariaLabel={
            leftSidebarOpen ? 'Collapse block library' : 'Expand block library'
          }
          tooltip={
            leftSidebarOpen ? 'Hide block library' : 'Show block library'
          }
          onClick={onToggleLeftSidebar}
          icon={
            leftSidebarOpen ? (
              <IconLayoutSidebarLeftCollapse stroke={1.8} />
            ) : (
              <IconLayoutSidebarLeftExpand stroke={1.8} />
            )
          }
          testId="toggle-left-sidebar-button"
        />
        <ToolbarIconButton
          ariaLabel={
            rightSidebarOpen
              ? 'Collapse properties panel'
              : 'Expand properties panel'
          }
          tooltip={
            rightSidebarOpen ? 'Hide properties panel' : 'Show properties panel'
          }
          onClick={onToggleRightSidebar}
          icon={
            rightSidebarOpen ? (
              <IconLayoutSidebarRightCollapse stroke={1.8} />
            ) : (
              <IconLayoutSidebarRightExpand stroke={1.8} />
            )
          }
          testId="toggle-right-sidebar-button"
        />

        <ToolbarDivider />

        <div
          className={clsx(
            'flex min-w-0 flex-1 flex-col gap-2 rounded-xl border border-border bg-surface-muted/50 px-3 py-2 sm:flex-row sm:items-center sm:gap-3',
            'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25',
          )}
        >
          <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2">
            <IconPencil
              className="h-6 w-6 shrink-0 text-text-subtle"
              stroke={1.65}
              aria-hidden
            />
            <input
              value={diagramName}
              onChange={(event) => onRenameDiagram(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-semibold text-text outline-none ring-0"
              data-testid="diagram-name-input"
              aria-label="Diagram name"
            />
          </div>
          <div
            className="flex shrink-0 items-center gap-2"
            data-testid="save-status-toolbar"
          >
            <Badge
              tone={saveStatus === 'Saved' ? 'success' : 'warning'}
              className={clsx(
                'shrink-0',
                saveStatus === 'Unsaved changes' && 'animate-pulse',
              )}
            >
              {saveLabel}
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 sm:gap-3">
        <ToolbarIconButton
          ariaLabel={`Undo (${undoShortcutLabel()})`}
          tooltip={`Undo — ${undoShortcutLabel()}`}
          onClick={onUndo}
          disabled={!canUndo}
          icon={<IconArrowBackUp stroke={1.8} />}
          testId="undo-button"
        />
        <ToolbarIconButton
          ariaLabel={`Redo (${redoShortcutLabel()})`}
          tooltip={`Redo — ${redoShortcutLabel()}`}
          onClick={onRedo}
          disabled={!canRedo}
          icon={<IconArrowForwardUp stroke={1.8} />}
          testId="redo-button"
        />

        <ToolbarDivider />

        <ToolbarMenu
          label={`View (${zoomPercent}%)`}
          icon={<IconEye />}
          testId="toolbar-view-menu"
        >
          <div className="grid gap-1">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
              onClick={onZoomIn}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <IconZoomIn className="h-5 w-5" stroke={1.8} aria-hidden />
                Zoom in
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
              onClick={onZoomOut}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <IconZoomOut className="h-5 w-5" stroke={1.8} aria-hidden />
                Zoom out
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
              onClick={onZoomTo100}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <IconZoomReset className="h-5 w-5" stroke={1.7} aria-hidden />
                100% (actual size)
              </span>
            </button>
            <span className="my-1 h-px bg-border" aria-hidden />
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
              onClick={onFitView}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <IconFocusAuto className="h-5 w-5" stroke={1.75} aria-hidden />
                Fit to diagram
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
              onClick={onZoomToSelection}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <IconTargetArrow
                  className="h-5 w-5"
                  stroke={1.75}
                  aria-hidden
                />
                Zoom to selection
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
              onClick={onCenterSelection}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <IconFocusCentered
                  className="h-5 w-5"
                  stroke={1.75}
                  aria-hidden
                />
                Center on selection
              </span>
            </button>
          </div>
        </ToolbarMenu>

        <ToolbarDivider />

        <ToolbarMenu
          label="Display"
          icon={<IconToggleRight />}
          testId="toolbar-display-menu"
        >
          <div className="grid gap-1">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
              onClick={onToggleGrid}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <IconGrid4x4 className="h-5 w-5" stroke={1.75} aria-hidden />
                Grid
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {showGrid ? 'On' : 'Off'}
              </span>
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-text transition hover:bg-surface-hover"
              onClick={onToggleSnap}
              role="menuitem"
            >
              <span className="flex items-center gap-2">
                <IconMagnet className="h-5 w-5" stroke={1.75} aria-hidden />
                Snap to grid
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {snapToGrid ? 'On' : 'Off'}
              </span>
            </button>
          </div>
        </ToolbarMenu>

        <ToolbarIconButton
          ariaLabel="Keyboard shortcuts"
          tooltip="Shortcuts (Ctrl+/ or ⌘+/)"
          onClick={onShowShortcuts}
          icon={<IconKeyboard stroke={1.8} />}
          testId="shortcuts-help-button"
        />

        <ToolbarDivider />

        <ExportMenu onExport={onExport} />

        <ToolbarIconButton
          ariaLabel="Account settings"
          tooltip="Account settings"
          onClick={() => window.dispatchEvent(new Event(SETTINGS_OPEN_EVENT))}
          icon={<IconSettings stroke={1.8} />}
          testId="toolbar-settings-button"
        />
        <Tooltip content={`Save — ${saveShortcutLabel()}`}>
          <Button
            type="button"
            variant="secondary"
            onClick={onSave}
            disabled={saveStatus === 'Saved' || saveStatus === 'Saving...'}
            aria-label={`Save (${saveShortcutLabel()})`}
            className="h-11 min-h-11 shrink-0 px-3"
            data-testid="manual-save-button"
          >
            <IconDeviceFloppy className="h-6 w-6" stroke={1.65} />
            <span className="ml-2 hidden text-xs font-semibold sm:inline">
              Save
            </span>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
