export type ThemeMode = 'light' | 'dark' | 'system';

export type AccountSettings = {
  themeMode: ThemeMode;
};

export type AccountSettingsStorageEnvelope = {
  version: 'v1';
  settings: AccountSettings;
};

export type StorageUsageSummary = {
  diagramCount: number;
  usedBytes: number;
  usedKilobytes: string;
};
