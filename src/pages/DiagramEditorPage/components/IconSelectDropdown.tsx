import { IconChevronDown } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';

import { renderIcon } from '@configs/iconLibrary.config';
import { formatIconChoiceTitle, listIconNames } from '@configs/iconMetadata';

type IconSelectDropdownProps = {
  value?: string;
  onChange: (icon?: string) => void;
};

export function IconSelectDropdown({
  value,
  onChange,
}: IconSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onDocMouseDown = (event: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  const names = useMemo(() => listIconNames(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return names;
    }

    return names.filter((name) => {
      const title = formatIconChoiceTitle(name).toLowerCase();
      return name.toLowerCase().includes(q) || title.includes(q);
    });
  }, [names, query]);

  const selectedLabel = value ? formatIconChoiceTitle(value) : 'No icon';

  return (
    <div
      className="relative w-full"
      ref={rootRef}
      data-testid="properties-node-icon-grid"
    >
      <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 min-h-11 w-full items-center justify-between gap-2 rounded-xl border border-border px-3 text-left font-normal"
        data-testid="properties-node-icon-dropdown-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text shadow-inner">
            {value ? (
              renderIcon(value, {
                className: 'h-5 w-5',
                strokeWidth: 1.65,
              })
            ) : (
              <span className="text-xs font-medium text-text-muted">—</span>
            )}
          </span>
          <span className="min-w-0 truncate text-sm font-medium text-text">
            {selectedLabel}
          </span>
        </span>
        <IconChevronDown
          className={`h-5 w-5 shrink-0 text-text-muted transition ${open ? 'rotate-180' : ''}`}
          stroke={1.8}
          aria-hidden
        />
      </Button>

      {open ? (
        <Card className="absolute left-0 right-0 top-full z-50 mt-2 flex max-h-[min(22rem,70vh)] flex-col overflow-hidden border-border p-0 shadow-floating">
          <div className="shrink-0 border-b border-border p-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search icons…"
              data-testid="properties-node-icon-search"
              aria-label="Search icons"
              className="h-10 text-sm"
            />
          </div>
          <div
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
            role="listbox"
            style={{ maxHeight: 'min(18rem, 55vh)' }}
          >
            <button
              type="button"
              role="option"
              aria-selected={!value}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-surface-hover"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              data-testid="clear-node-icon-button"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-surface-muted text-xs font-semibold text-text-muted">
                ∅
              </span>
              <span className="min-w-0 truncate font-medium text-text">
                No icon
              </span>
            </button>
            {filtered.map((name) => {
              const selected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  data-testid={`properties-node-icon-${name}`}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  className={
                    selected
                      ? 'mt-0.5 flex w-full items-center gap-2.5 rounded-lg border border-primary bg-primary-soft px-2 py-2 text-left'
                      : 'mt-0.5 flex w-full items-center gap-2.5 rounded-lg border border-transparent px-2 py-2 text-left transition hover:border-border hover:bg-surface-hover'
                  }
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-text shadow-inner">
                    {renderIcon(name, {
                      className: 'h-5 w-5',
                      strokeWidth: 1.65,
                    })}
                  </span>
                  <span className="min-w-0 truncate text-sm font-medium text-text">
                    {formatIconChoiceTitle(name)}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="shrink-0 border-t border-border px-2 py-1.5 text-xs text-text-muted">
            {filtered.length} option{filtered.length === 1 ? '' : 's'}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
