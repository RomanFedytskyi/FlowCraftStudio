import { useState } from 'react';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';

const NAME_INPUT_ID = 'create-diagram-name';

const PRESET_NAMES = [
  { label: 'Flowchart', value: 'Flowchart' },
  { label: 'Wireframe', value: 'Wireframe' },
  { label: 'Org chart', value: 'Org chart' },
] as const;

type CreateDiagramCardProps = {
  onCreate: (name?: string) => void;
  isSubmitting?: boolean;
};

export function CreateDiagramCard({
  onCreate,
  isSubmitting,
}: CreateDiagramCardProps) {
  const [name, setName] = useState('');

  return (
    <Card className="p-5" data-testid="create-diagram-card">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-primary-text">
            Start a new canvas
          </p>
          <h2 className="mt-1 text-xl font-semibold">Create diagram</h2>
          <p className="mt-2 text-sm text-text-muted">
            Sketch flows, wireframes, and diagrams stored only in this browser.
          </p>
        </div>
        <div>
          <label
            htmlFor={NAME_INPUT_ID}
            className="text-sm font-medium text-text"
          >
            Diagram name{' '}
            <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <Input
            id={NAME_INPUT_ID}
            data-testid="create-diagram-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="My Awesome Diagram"
            className="mt-2"
            autoComplete="off"
          />
          <p className="mt-1.5 text-xs text-text-muted">
            Leave blank to use &quot;Untitled Diagram&quot;.
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-text-subtle">
            Quick start names
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_NAMES.map((preset) => (
              <Button
                key={preset.value}
                type="button"
                variant="secondary"
                className="px-3 py-1.5 text-xs font-medium"
                onClick={() => setName(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
        <Button
          data-testid="create-diagram-button"
          onClick={() => onCreate(name.trim() ? name.trim() : undefined)}
          disabled={isSubmitting}
          className="w-full"
        >
          New diagram
        </Button>
      </div>
    </Card>
  );
}
