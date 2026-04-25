import { IconX } from '@tabler/icons-react';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';

import {
  duplicateShortcutLabel,
  redoShortcutLabel,
  saveShortcutLabel,
  undoShortcutLabel,
} from '@utils/platform';

type ShortcutRow = { action: string; keys: string };

const ROWS: ShortcutRow[] = [
  { action: 'Undo', keys: undoShortcutLabel() },
  { action: 'Redo', keys: redoShortcutLabel() },
  { action: 'Save diagram', keys: saveShortcutLabel() },
  { action: 'Duplicate selection', keys: duplicateShortcutLabel() },
  { action: 'Copy selection', keys: 'Ctrl+C / ⌘C' },
  { action: 'Paste', keys: 'Ctrl+V / ⌘V' },
  { action: 'Delete selection', keys: 'Delete or Backspace' },
  { action: 'Open shortcuts (this panel)', keys: 'Ctrl+/ / ⌘/' },
  {
    action: 'Reconnect edge (move endpoint)',
    keys: 'Drag the dot at each end of a selected edge',
  },
];

type KeyboardShortcutsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-text/25 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      data-testid="keyboard-shortcuts-modal"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default"
        onClick={onClose}
        aria-label="Close shortcuts"
      />
      <Card className="relative z-10 w-full max-w-lg border-border bg-background-elevated p-6 shadow-floating">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-text-subtle">
              Help
            </p>
            <h2 id="shortcuts-title" className="mt-2 text-xl font-semibold">
              Keyboard shortcuts
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Shortcuts apply on the diagram editor when focus is not inside a
              text field.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            data-testid="close-keyboard-shortcuts"
            className="h-12 w-12 shrink-0 rounded-xl p-0"
            aria-label="Close shortcuts"
          >
            <IconX className="size-7" stroke={2} aria-hidden />
          </Button>
        </div>
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
          {ROWS.map((row) => (
            <li
              key={row.action}
              className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
            >
              <span className="text-text">{row.action}</span>
              <kbd className="shrink-0 rounded-md border border-border bg-surface-muted px-2 py-1 font-mono text-xs text-text-muted">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
