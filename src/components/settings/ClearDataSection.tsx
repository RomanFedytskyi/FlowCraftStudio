import { IconTrash } from '@tabler/icons-react';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';

type ClearDataSectionProps = {
  onClear: () => void;
  isClearing?: boolean;
};

export function ClearDataSection({
  onClear,
  isClearing,
}: ClearDataSectionProps) {
  return (
    <Card
      className="border-danger/20 bg-danger-soft p-5"
      data-testid="clear-data-section"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-danger-text">
            Clear all local data
          </h3>
          <p className="mt-1 text-sm text-danger-text/80">
            Removes every saved diagram and resets account settings stored in
            this browser.
          </p>
        </div>
        <Button
          variant="danger"
          onClick={onClear}
          disabled={isClearing}
          data-testid="clear-local-data-button"
          className="h-12 min-w-12 shrink-0 px-3"
          aria-label="Clear all local data"
        >
          <IconTrash className="size-7" stroke={2} aria-hidden />
          <span className="sr-only">Clear local data</span>
        </Button>
      </div>
    </Card>
  );
}
