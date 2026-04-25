import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateDiagramCard } from '@pages/DashboardPage/components/CreateDiagramCard';
import { DashboardEmptyIllustration } from '@pages/DashboardPage/components/DashboardEmptyIllustration';
import { DiagramCard } from '@pages/DashboardPage/components/DiagramCard';

import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Input } from '@components/ui/Input';

import { useAccountSettings } from '@hooks/useAccountSettings';
import { useCreateDiagram } from '@hooks/useDiagramMutations';
import { useDeleteDiagram } from '@hooks/useDiagramMutations';
import { useDuplicateDiagram } from '@hooks/useDiagramMutations';
import { useDiagrams } from '@hooks/useDiagrams';

export function DashboardPage() {
  const navigate = useNavigate();
  const diagramsQuery = useDiagrams();
  const storageUsageQuery = useAccountSettings().storageUsageQuery;
  const createDiagram = useCreateDiagram();
  const deleteDiagram = useDeleteDiagram();
  const duplicateDiagram = useDuplicateDiagram();

  const [search, setSearch] = useState('');

  const diagrams = useMemo(
    () => diagramsQuery.data ?? [],
    [diagramsQuery.data],
  );
  const storageSummary = storageUsageQuery.data;

  const filteredDiagrams = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return diagrams;
    }

    return diagrams.filter((diagram) => diagram.name.toLowerCase().includes(q));
  }, [diagrams, search]);

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <section className="grid gap-6 lg:grid-cols-[384px_minmax(0,1fr)]">
        <CreateDiagramCard
          isSubmitting={createDiagram.isPending}
          onCreate={async (name) => {
            const diagram = await createDiagram.mutateAsync(name);
            await navigate(`/diagram/${diagram.id}`);
          }}
        />
        <Card className="p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-text-subtle">
                Workspace
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Your diagrams
              </h2>
            </div>
            <Button
              onClick={() => diagramsQuery.refetch()}
              variant="secondary"
              data-testid="refresh-diagrams"
            >
              Refresh list
            </Button>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-text-muted">
            Diagrams stay in your browser for privacy and speed. Nothing is sent
            to a server unless you export or share files yourself.
          </p>
          {diagrams.length > 0 ? (
            <dl className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface-muted/60 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
                  Diagrams in this workspace
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-text">
                  {diagrams.length}
                </dd>
              </div>
              <div className="rounded-xl border border-border bg-surface-muted/60 px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
                  Estimated local footprint
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-text">
                  {storageSummary?.usedKilobytes ?? '—'}
                </dd>
              </div>
            </dl>
          ) : null}
        </Card>
      </section>

      {diagrams.length === 0 ? (
        <Card className="p-10 text-center" data-testid="dashboard-empty-state">
          <DashboardEmptyIllustration />
          <h3 className="mt-6 text-2xl font-semibold tracking-tight">
            Welcome to FlowCraft Studio
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-text-muted">
            Build flowcharts and diagrams with a focused editor, local storage,
            and exports when you need to share your work.
          </p>
          <p className="mx-auto mt-4 max-w-md rounded-xl border border-primary-soft bg-primary-soft/40 px-4 py-3 text-sm text-primary-text">
            <span aria-hidden>💡 </span>
            Tip: Diagrams are stored locally in your browser—great for drafts
            and sensitive workflows.
          </p>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text">Library</h3>
              <p className="text-sm text-text-muted">
                {filteredDiagrams.length === diagrams.length
                  ? `Showing all ${diagrams.length} diagram${diagrams.length === 1 ? '' : 's'}.`
                  : `Showing ${filteredDiagrams.length} of ${diagrams.length} diagrams.`}
              </p>
            </div>
            <div className="w-full sm:max-w-xs">
              <label htmlFor="diagram-search" className="sr-only">
                Search diagrams
              </label>
              <Input
                id="diagram-search"
                data-testid="diagram-search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by diagram name…"
                autoComplete="off"
              />
            </div>
          </div>
          {filteredDiagrams.length === 0 ? (
            <Card className="p-8 text-center text-sm text-text-muted">
              No diagrams match &quot;{search.trim()}&quot;. Try another name or
              clear the search field.
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredDiagrams.map((diagram) => (
                <DiagramCard
                  key={diagram.id}
                  diagram={diagram}
                  onDuplicate={() => duplicateDiagram.mutate(diagram.id)}
                  onDelete={() => deleteDiagram.mutate(diagram.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
