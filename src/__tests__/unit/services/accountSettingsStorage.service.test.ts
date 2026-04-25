import { accountSettingsStorageService } from '@services/settings/accountSettingsStorage.service';

import {
  ACCOUNT_SETTINGS_STORAGE_KEY,
  DEFAULT_ACCOUNT_SETTINGS,
} from '@configs/account.config';
import { STORAGE_KEY } from '@configs/app';

import { createEmptyDiagram } from '@utils/diagram';

describe('accountSettingsStorageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults for empty storage', () => {
    expect(accountSettingsStorageService.read()).toEqual(
      DEFAULT_ACCOUNT_SETTINGS,
    );
  });

  it('recovers from corrupted settings payloads', () => {
    localStorage.setItem(ACCOUNT_SETTINGS_STORAGE_KEY, '{bad-json');

    expect(accountSettingsStorageService.read()).toEqual(
      DEFAULT_ACCOUNT_SETTINGS,
    );
    expect(localStorage.getItem(ACCOUNT_SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it('clears all local app data', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 'v1',
        diagrams: [createEmptyDiagram('Test')],
      }),
    );
    accountSettingsStorageService.write({ themeMode: 'light' });

    accountSettingsStorageService.clearAllLocalData();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(ACCOUNT_SETTINGS_STORAGE_KEY)).toBeNull();
  });
});
