import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AccountSettingsModal } from '@components/settings/AccountSettingsModal';
import { Button } from '@components/ui/Button';

import { useAccountSettings } from '@hooks/useAccountSettings';

import { APP_NAME, SETTINGS_OPEN_EVENT } from '@configs/app';

export function AppShell() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { settingsQuery } = useAccountSettings();
  const location = useLocation();
  const isEditorRoute = location.pathname.startsWith('/diagram/');

  useEffect(() => {
    const mode = settingsQuery.data?.themeMode ?? 'light';

    const resolveDark = () => {
      if (mode === 'dark') {
        return true;
      }

      if (mode === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      return false;
    };

    const apply = () => {
      const dark = resolveDark();
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };

    apply();

    if (mode !== 'system') {
      return undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply();
    media.addEventListener('change', onChange);

    return () => media.removeEventListener('change', onChange);
  }, [settingsQuery.data?.themeMode]);

  useEffect(() => {
    const handleOpenSettings = () => setIsSettingsOpen(true);

    window.addEventListener(SETTINGS_OPEN_EVENT, handleOpenSettings);

    return () => {
      window.removeEventListener(SETTINGS_OPEN_EVENT, handleOpenSettings);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-text">
      <header className="border-b border-border bg-surface/90 backdrop-blur">
        <div
          className={`flex items-center justify-between px-6 py-4 ${
            isEditorRoute ? 'w-full' : 'mx-auto max-w-7xl'
          }`}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary-text">
              Local Diagram Studio
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {APP_NAME}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden text-sm text-text-muted md:block">
              Fully local. Query-driven.
            </p>
            {!isEditorRoute ? (
              <Button
                variant="secondary"
                onClick={() => setIsSettingsOpen(true)}
                data-testid="open-account-settings"
              >
                Account Settings
              </Button>
            ) : null}
          </div>
        </div>
      </header>
      <main
        className={`px-6 py-6 ${isEditorRoute ? 'w-full' : 'mx-auto max-w-7xl'}`}
      >
        <Outlet />
      </main>
      <AccountSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
