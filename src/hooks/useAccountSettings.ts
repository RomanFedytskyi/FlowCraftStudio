import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountSettingsStorageService } from '@services/settings/accountSettingsStorage.service';

import { DEFAULT_ACCOUNT_SETTINGS } from '@configs/account.config';
import { queryKeys } from '@configs/queryKeys';

import type { AccountSettings } from '../types/account.types';

export function useAccountSettings() {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: queryKeys.accountSettings,
    queryFn: () => accountSettingsStorageService.read(),
    initialData: DEFAULT_ACCOUNT_SETTINGS,
  });

  const storageUsageQuery = useQuery({
    queryKey: queryKeys.storageUsage,
    queryFn: () => accountSettingsStorageService.getStorageUsageSummary(),
    initialData: accountSettingsStorageService.getStorageUsageSummary(),
  });

  const updateSettings = useMutation({
    mutationFn: async (settings: AccountSettings) =>
      accountSettingsStorageService.write(settings),
    onSuccess: async (settings) => {
      queryClient.setQueryData(queryKeys.accountSettings, settings);
      await queryClient.invalidateQueries({ queryKey: queryKeys.storageUsage });
    },
  });

  const clearLocalData = useMutation({
    mutationFn: async () => {
      accountSettingsStorageService.clearAllLocalData();
      return true;
    },
    onSuccess: async () => {
      queryClient.setQueryData(
        queryKeys.accountSettings,
        DEFAULT_ACCOUNT_SETTINGS,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.diagrams }),
        queryClient.invalidateQueries({ queryKey: queryKeys.storageUsage }),
        queryClient.invalidateQueries({ queryKey: queryKeys.accountSettings }),
      ]);
    },
  });

  return {
    settingsQuery,
    storageUsageQuery,
    updateSettings,
    clearLocalData,
  };
}
