import { IconPalette } from '@tabler/icons-react';
import clsx from 'clsx';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import { Tooltip } from '@components/ui/Tooltip';

import { TOOLBAR_QUICK_FILL_SWATCHES } from '@configs/colorPresets.config';

export type ToolbarQuickFillPickerProps = {
  nodeId: string;
  onSelectColor: (nodeId: string, color: string) => void;
};

export function ToolbarQuickFillPicker({
  nodeId,
  onSelectColor,
}: ToolbarQuickFillPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent | PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element) || !rootRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const handlePick = useCallback(
    (color: string) => {
      onSelectColor(nodeId, color);
      setOpen(false);
    },
    [nodeId, onSelectColor],
  );

  function onToggleKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen((prev) => !prev);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <Tooltip content="Preset fill colors" compact delayMs={280}>
        <button
          type="button"
          className={clsx(
            'nodrag nopan flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition hover:bg-surface-hover hover:text-text',
            open && 'bg-surface-hover ring-2 ring-primary/25',
          )}
          aria-label="Preset fill colors"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          onKeyDown={onToggleKeyDown}
          data-testid={`node-toolbar-color-${nodeId}`}
        >
          <IconPalette className="h-5 w-5" stroke={1.9} aria-hidden />
        </button>
      </Tooltip>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose a preset fill color"
          className="nodrag nopan absolute left-0 top-full z-[260] mt-2 min-w-[188px] rounded-xl border border-border bg-background-elevated p-2 shadow-card"
          data-testid={`node-toolbar-color-panel-${nodeId}`}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <div className="grid grid-cols-4 gap-1.5">
            {TOOLBAR_QUICK_FILL_SWATCHES.map((raw) => {
              const isTransparent = raw === 'transparent';
              return (
                <button
                  key={raw}
                  type="button"
                  className={clsx(
                    'nodrag nopan h-8 w-8 rounded-full border shadow-sm transition hover:ring-2 hover:ring-primary/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isTransparent
                      ? 'border-dashed border-border-strong'
                      : 'border-border',
                  )}
                  style={
                    isTransparent
                      ? {
                          backgroundImage:
                            'repeating-conic-gradient(var(--color-border) 0% 25%, var(--color-surface-muted) 0% 50%)',
                          backgroundSize: '8px 8px',
                        }
                      : { backgroundColor: raw }
                  }
                  title={isTransparent ? 'No fill (transparent)' : raw}
                  aria-label={
                    isTransparent ? 'Transparent fill' : `Use fill ${raw}`
                  }
                  onClick={() => handlePick(raw)}
                  data-testid={`node-toolbar-color-swatch-${nodeId}-${raw === 'transparent' ? 'transparent' : raw.replace('#', '')}`}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
