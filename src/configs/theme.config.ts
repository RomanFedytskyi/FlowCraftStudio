import type { ThemeMode } from '../types/account.types';

export const THEME_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  description: string;
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces and high contrast for daytime use.',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Reduced glare with the same accent colors.',
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follows light or dark mode from your OS settings.',
  },
];
