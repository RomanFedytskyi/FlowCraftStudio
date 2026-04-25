import { readDiagramStorage } from '@services/diagrams/storage';

import {
  ACCOUNT_SETTINGS_STORAGE_KEY,
  ACCOUNT_STORAGE_VERSION,
  DEFAULT_ACCOUNT_SETTINGS,
} from '@configs/account.config';
import { STORAGE_KEY } from '@configs/app';

import type {
  AccountSettings,
  AccountSettingsStorageEnvelope,
  StorageUsageSummary,
} from '../../types/account.types';

type UnknownSettingsEnvelope = {
  version?: string;
  settings?: unknown;
};

function isAccountSettings(value: unknown): value is AccountSettings {
  return typeof value === 'object' && value !== null && 'themeMode' in value;
}

function getByteSize(value: string) {
  return new TextEncoder().encode(value).length;
}

export const accountSettingsStorageService = {
  read(): AccountSettings {
    const rawValue = localStorage.getItem(ACCOUNT_SETTINGS_STORAGE_KEY);

    if (!rawValue) {
      return DEFAULT_ACCOUNT_SETTINGS;
    }

    try {
      const parsed = JSON.parse(rawValue) as UnknownSettingsEnvelope;

      if (
        parsed.version === ACCOUNT_STORAGE_VERSION &&
        isAccountSettings(parsed.settings)
      ) {
        return {
          ...DEFAULT_ACCOUNT_SETTINGS,
          ...parsed.settings,
        };
      }

      return DEFAULT_ACCOUNT_SETTINGS;
    } catch {
      localStorage.removeItem(ACCOUNT_SETTINGS_STORAGE_KEY);
      return DEFAULT_ACCOUNT_SETTINGS;
    }
  },

  write(settings: AccountSettings) {
    const payload: AccountSettingsStorageEnvelope = {
      version: ACCOUNT_STORAGE_VERSION,
      settings,
    };

    localStorage.setItem(ACCOUNT_SETTINGS_STORAGE_KEY, JSON.stringify(payload));
    return settings;
  },

  clear() {
    localStorage.removeItem(ACCOUNT_SETTINGS_STORAGE_KEY);
  },

  clearAllLocalData() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACCOUNT_SETTINGS_STORAGE_KEY);
  },

  getStorageUsageSummary(): StorageUsageSummary {
    const diagramsValue = localStorage.getItem(STORAGE_KEY) ?? '';
    const settingsValue =
      localStorage.getItem(ACCOUNT_SETTINGS_STORAGE_KEY) ?? '';
    const usedBytes = getByteSize(diagramsValue) + getByteSize(settingsValue);
    const diagramCount = readDiagramStorage().diagrams.length;

    return {
      diagramCount,
      usedBytes,
      usedKilobytes: `${(usedBytes / 1024).toFixed(2)} KB`,
    };
  },
};
