import clsx from 'clsx';

import { THEME_OPTIONS } from '@configs/theme.config';

import type { ThemeMode } from '../../types/account.types';

type ThemeSelectorProps = {
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
};

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-3" data-testid="theme-selector">
      <div>
        <h3 className="text-sm font-semibold text-text">Theme preference</h3>
        <p className="mt-1 text-sm text-text-muted">
          Applies across the app and diagram canvas immediately.
        </p>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {THEME_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={clsx(
                'rounded-xl border px-4 py-3 text-left transition',
                isSelected
                  ? 'border-primary bg-primary-soft text-primary-text shadow-soft'
                  : 'border-border bg-surface text-text hover:bg-surface-hover',
              )}
              data-testid={`theme-option-${option.value}`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{option.label}</span>
                {isSelected ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-text-inverse">
                    Active
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-xs text-text-muted">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
