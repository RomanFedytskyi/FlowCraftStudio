import { IconX } from '@tabler/icons-react';

import { ClearDataSection } from '@components/settings/ClearDataSection';
import { StorageUsageSummary } from '@components/settings/StorageUsageSummary';
import { ThemeSelector } from '@components/settings/ThemeSelector';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';

import { useAccountSettings } from '@hooks/useAccountSettings';

import { APP_VERSION } from '@configs/account.config';
import { APP_NAME } from '@configs/app';

type AccountSettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AccountSettingsModal({
  open,
  onClose,
}: AccountSettingsModalProps) {
  const { settingsQuery, storageUsageQuery, updateSettings, clearLocalData } =
    useAccountSettings();

  if (!open) {
    return null;
  }

  const settings = settingsQuery.data;
  const summary = storageUsageQuery.data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text/25 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-settings-title"
      data-testid="account-settings-modal"
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default"
        onClick={onClose}
        aria-label="Close account settings"
      />
      <Card className="relative z-10 w-full max-w-3xl border-border bg-background-elevated shadow-floating">
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-text-subtle">
              Account settings
            </p>
            <h2
              id="account-settings-title"
              className="mt-2 text-2xl font-semibold text-text"
            >
              {APP_NAME}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Version {APP_VERSION}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            data-testid="close-account-settings"
            className="h-12 w-12 shrink-0 rounded-xl p-0"
            aria-label="Close account settings"
          >
            <IconX className="size-7" stroke={2} aria-hidden />
          </Button>
        </div>

        <div className="space-y-6 px-6 py-6">
          {summary ? <StorageUsageSummary summary={summary} /> : null}
          {settings ? (
            <ThemeSelector
              value={settings.themeMode}
              onChange={(themeMode) =>
                updateSettings.mutate({ ...settings, themeMode })
              }
            />
          ) : null}
          <ClearDataSection
            isClearing={clearLocalData.isPending}
            onClear={() => {
              const shouldClear = window.confirm(
                'Clear all FlowCraft Studio diagrams and reset account settings stored in this browser?',
              );

              if (shouldClear) {
                clearLocalData.mutate();
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
}
