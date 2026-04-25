import { useQuery } from '@tanstack/react-query';

import { diagramService } from '@services/diagrams/diagramService';

import { queryKeys } from '@configs/queryKeys';

export function useDiagram(diagramId: string) {
  return useQuery({
    queryKey: queryKeys.diagram(diagramId),
    queryFn: () => diagramService.getById(diagramId),
  });
}
