import { APP_NAME } from '@configs/app';

import type { AccountSettings } from '../types/account.types';

export const APP_VERSION = '1.0.0';
export const ACCOUNT_STORAGE_VERSION = 'v1';
export const ACCOUNT_SETTINGS_STORAGE_KEY = `${APP_NAME.toLowerCase().replace(/\s+/g, '-')}:account-settings:${ACCOUNT_STORAGE_VERSION}`;

export const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
  themeMode: 'light',
};
