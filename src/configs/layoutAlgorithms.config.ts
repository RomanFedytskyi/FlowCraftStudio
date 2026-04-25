import type { DiagramNode } from '../types/diagram';

export type LayoutAlgorithmId = 'none';

export type LayoutAlgorithm = (nodes: DiagramNode[]) => DiagramNode[];

export const LAYOUT_ALGORITHMS: Record<LayoutAlgorithmId, LayoutAlgorithm> = {
  none: (nodes) => nodes,
};
