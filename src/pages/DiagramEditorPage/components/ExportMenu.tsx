import { IconFileExport } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Tooltip } from '@components/ui/Tooltip';

import type { ExportFormat, ExportScope } from '../../../types/export';

type ExportMenuProps = {
  onExport: (payload: {
    format: ExportFormat;
    includeBackground: boolean;
    scope: ExportScope;
  }) => void;
};

const exportActions: Array<{
  label: string;
  format: ExportFormat;
  includeBackground: boolean;
  scope: ExportScope;
}> = [
  {
    label: 'PNG full diagram',
    format: 'png',
    includeBackground: true,
    scope: 'full',
  },
  {
    label: 'PNG transparent full diagram',
    format: 'png',
    includeBackground: false,
    scope: 'full',
  },
  {
    label: 'PNG current viewport',
    format: 'png',
    includeBackground: true,
    scope: 'viewport',
  },
  {
    label: 'PDF full diagram',
    format: 'pdf',
    includeBackground: true,
    scope: 'full',
  },
  {
    label: 'PDF clean canvas',
    format: 'pdf',
    includeBackground: false,
    scope: 'full',
  },
  {
    label: 'PDF current viewport',
    format: 'pdf',
    includeBackground: true,
    scope: 'viewport',
  },
];

const PNG_ACTIONS = exportActions.filter((a) => a.format === 'png');
const PDF_ACTIONS = exportActions.filter((a) => a.format === 'pdf');

function slugify(label: string) {
  return label.toLowerCase().replace(/\s+/g, '-');
}

export function ExportMenu({ onExport }: ExportMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" data-testid="export-menu">
      <Tooltip content="Export as PNG or PDF">
        <Button
          variant="secondary"
          onClick={() => setOpen((current) => !current)}
          className="flex h-11 min-h-11 items-center gap-2 px-4 text-sm font-semibold"
          data-testid="export-toggle"
        >
          <IconFileExport
            className="h-6 w-6 shrink-0"
            stroke={1.65}
            aria-hidden
          />
          Export
        </Button>
      </Tooltip>
      {open ? (
        <Card className="absolute right-0 top-12 z-20 max-h-[min(70vh,520px)] w-72 overflow-y-auto p-3">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-subtle">
                PNG
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Raster image — good for slides and chat.
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {PNG_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="rounded-xl px-3 py-2 text-left text-sm text-text transition hover:bg-surface-hover"
                    onClick={() => {
                      onExport(action);
                      setOpen(false);
                    }}
                    data-testid={`export-action-${slugify(action.label)}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-subtle">
                PDF
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Vector-friendly output — good for print and archives.
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {PDF_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    className="rounded-xl px-3 py-2 text-left text-sm text-text transition hover:bg-surface-hover"
                    onClick={() => {
                      onExport(action);
                      setOpen(false);
                    }}
                    data-testid={`export-action-${slugify(action.label)}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
