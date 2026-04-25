import { IconClock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';

import { formatUpdatedAt, formatUpdatedAtRelative } from '@utils/date';

import type { Diagram } from '../../../types/diagram';

type DiagramCardProps = {
  diagram: Diagram;
  onDuplicate: () => void;
  onDelete: () => void;
};

function DiagramPreview({ diagram }: { diagram: Diagram }) {
  const nodes = diagram.nodes ?? [];
  const edges = diagram.edges ?? [];

  if (nodes.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center bg-surface-muted/40 text-xs font-medium text-text-subtle">
        Empty diagram
      </div>
    );
  }

  const rects = nodes.map((node) => {
    const width = Number(node.style?.width ?? node.width ?? 240);
    const height = Number(
      node.style?.height ?? node.height ?? node.style?.minHeight ?? 140,
    );
    return {
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      width: Number.isFinite(width) ? width : 240,
      height: Number.isFinite(height) ? height : 140,
    };
  });

  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  const padding = 20;
  const viewX = minX - padding;
  const viewY = minY - padding;
  const viewW = Math.max(120, maxX - minX + padding * 2);
  const viewH = Math.max(80, maxY - minY + padding * 2);

  const byId = new Map(rects.map((r) => [r.id, r] as const));

  return (
    <div
      className="h-24 border-b border-border bg-surface-muted/40"
      data-testid={`diagram-preview-${diagram.id}`}
    >
      <svg
        viewBox={`${viewX} ${viewY} ${viewW} ${viewH}`}
        className="h-full w-full"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id="preview-bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="rgba(79,70,229,0.06)" />
            <stop offset="1" stopColor="rgba(124,58,237,0.06)" />
          </linearGradient>
        </defs>
        <rect
          x={viewX}
          y={viewY}
          width={viewW}
          height={viewH}
          fill="url(#preview-bg)"
        />
        {edges.map((edge) => {
          const source = byId.get(edge.source);
          const target = byId.get(edge.target);
          if (!source || !target) {
            return null;
          }
          const x1 = source.x + source.width / 2;
          const y1 = source.y + source.height / 2;
          const x2 = target.x + target.width / 2;
          const y2 = target.y + target.height / 2;
          return (
            <line
              key={edge.id}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="rgba(100,116,139,0.65)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}
        {rects.map((r) => (
          <rect
            key={r.id}
            x={r.x}
            y={r.y}
            width={r.width}
            height={r.height}
            rx={16}
            ry={16}
            fill="rgba(255,255,255,0.85)"
            stroke="rgba(203,213,225,0.9)"
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  );
}

export function DiagramCard({
  diagram,
  onDuplicate,
  onDelete,
}: DiagramCardProps) {
  const edgeCount = diagram.edges.length;
  const complexityLabel =
    edgeCount > 0
      ? `${diagram.nodes.length} nodes · ${edgeCount} connectors`
      : `${diagram.nodes.length} nodes`;

  return (
    <Card
      className="overflow-hidden p-0"
      data-testid={`diagram-card-${diagram.id}`}
    >
      <DiagramPreview diagram={diagram} />
      <Link
        to={`/diagram/${diagram.id}`}
        className="block border-b border-border bg-surface px-5 py-4 transition hover:bg-surface-hover"
        data-testid={`open-diagram-${diagram.id}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3
              className="truncate text-lg font-semibold text-text"
              data-testid={`diagram-title-${diagram.id}`}
            >
              {diagram.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1.5 font-medium text-text">
                <IconClock
                  className="h-4 w-4 shrink-0 text-text-subtle"
                  aria-hidden
                />
                <span className="sr-only">Last updated </span>
                <span title={formatUpdatedAt(diagram.updatedAt)}>
                  {formatUpdatedAtRelative(diagram.updatedAt)}
                </span>
              </span>
              <span className="text-text-subtle" aria-hidden>
                ·
              </span>
              <span className="text-xs text-text-muted sm:text-sm">
                {formatUpdatedAt(diagram.updatedAt)}
              </span>
            </div>
          </div>
          <Badge
            tone="accent"
            className="max-w-[55%] shrink-0 whitespace-normal text-right text-xs leading-snug"
          >
            {complexityLabel}
          </Badge>
        </div>
        <p className="mt-3 text-xs font-medium text-primary-text">
          Open diagram →
        </p>
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4">
        <Button
          variant="secondary"
          onClick={onDuplicate}
          data-testid={`duplicate-diagram-${diagram.id}`}
        >
          Duplicate
        </Button>
        <Button
          variant="danger"
          onClick={onDelete}
          data-testid={`delete-diagram-${diagram.id}`}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
