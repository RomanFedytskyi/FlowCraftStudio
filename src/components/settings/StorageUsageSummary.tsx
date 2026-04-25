import { useEffect, useState } from 'react';

import { Card } from '@components/ui/Card';

import type { StorageUsageSummary as StorageUsageSummaryType } from '../../types/account.types';

type StorageUsageSummaryProps = {
  summary: StorageUsageSummaryType;
};

export function StorageUsageSummary({ summary }: StorageUsageSummaryProps) {
  const [quotaBytes, setQuotaBytes] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!navigator.storage?.estimate) {
      return undefined;
    }

    void navigator.storage
      .estimate()
      .then((estimate) => {
        if (cancelled) {
          return;
        }

        const quota = estimate.quota;
        setQuotaBytes(typeof quota === 'number' && quota > 0 ? quota : null);
      })
      .catch(() => {
        if (!cancelled) {
          setQuotaBytes(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [summary.usedBytes]);

  const percentOfQuota =
    quotaBytes !== null
      ? Math.min(100, Math.round((summary.usedBytes / quotaBytes) * 100))
      : null;

  return (
    <Card className="p-5" data-testid="storage-usage-summary">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-text-subtle">
        Local storage
      </p>
      <p className="mt-2 text-2xl font-semibold text-text">
        {summary.usedKilobytes}{' '}
        <span className="text-lg font-medium text-text-muted">
          of unlimited app data
        </span>
      </p>
      <p className="mt-1 text-sm text-text-muted">
        {summary.diagramCount} saved diagram
        {summary.diagramCount === 1 ? '' : 's'} · about{' '}
        {summary.usedBytes.toLocaleString()} bytes in localStorage
      </p>

      {percentOfQuota !== null ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Share of browser-reported quota</span>
            <span className="font-medium text-text">{percentOfQuota}%</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentOfQuota}
            aria-label="Diagram data as a share of reported browser storage quota"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${percentOfQuota}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-xs text-text-muted">
          This browser did not report a storage quota. Your diagrams still save
          locally; only export if you need a backup file.
        </p>
      )}
    </Card>
  );
}
