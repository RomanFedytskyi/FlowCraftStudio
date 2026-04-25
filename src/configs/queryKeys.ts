export const queryKeys = {
  diagrams: ['diagrams'] as const,
  diagram: (diagramId: string) => ['diagrams', diagramId] as const,
  accountSettings: ['account-settings'] as const,
  storageUsage: ['storage-usage'] as const,
};
