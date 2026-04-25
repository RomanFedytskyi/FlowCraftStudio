import { useQuery } from '@tanstack/react-query';

import { diagramService } from '@services/diagrams/diagramService';

import { queryKeys } from '@configs/queryKeys';

export function useDiagrams() {
  return useQuery({
    queryKey: queryKeys.diagrams,
    queryFn: () => diagramService.list(),
  });
}
