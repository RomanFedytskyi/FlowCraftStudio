import { useMutation, useQueryClient } from '@tanstack/react-query';

import { diagramService } from '@services/diagrams/diagramService';

import { queryKeys } from '@configs/queryKeys';

import type { Diagram } from '../types/diagram';

function useDiagramInvalidation() {
  const queryClient = useQueryClient();

  return {
    async refresh(diagramId?: string) {
      await queryClient.invalidateQueries({ queryKey: queryKeys.diagrams });
      await queryClient.invalidateQueries({ queryKey: queryKeys.storageUsage });
      if (diagramId) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.diagram(diagramId),
        });
      }
    },
    setDiagram(diagram: Diagram) {
      queryClient.setQueryData(queryKeys.diagram(diagram.id), diagram);
    },
  };
}

export function useCreateDiagram() {
  const invalidate = useDiagramInvalidation();

  return useMutation({
    mutationFn: async (name?: string) => diagramService.create(name),
    onSuccess: async (diagram) => {
      invalidate.setDiagram(diagram);
      await invalidate.refresh(diagram.id);
    },
  });
}

export function useUpdateDiagram() {
  const invalidate = useDiagramInvalidation();

  return useMutation({
    mutationFn: async ({
      diagramId,
      updater,
    }: {
      diagramId: string;
      updater: (diagram: Diagram) => Diagram;
    }) => diagramService.update(diagramId, updater),
    onSuccess: async (diagram) => {
      invalidate.setDiagram(diagram);
      await invalidate.refresh(diagram.id);
    },
  });
}

export function useDeleteDiagram() {
  const invalidate = useDiagramInvalidation();

  return useMutation({
    mutationFn: (diagramId: string) => {
      diagramService.delete(diagramId);
      return Promise.resolve(diagramId);
    },
    onSuccess: async () => {
      await invalidate.refresh();
    },
  });
}

export function useDuplicateDiagram() {
  const invalidate = useDiagramInvalidation();

  return useMutation({
    mutationFn: async (diagramId: string) =>
      diagramService.duplicate(diagramId),
    onSuccess: async (diagram) => {
      invalidate.setDiagram(diagram);
      await invalidate.refresh(diagram.id);
    },
  });
}
