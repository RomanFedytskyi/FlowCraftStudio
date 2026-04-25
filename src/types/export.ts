import type { DiagramNode, DiagramViewport } from './diagram';

export type ExportFormat = 'png' | 'pdf';
export type ExportScope = 'viewport' | 'full';

export type ExportOptions = {
  fileName: string;
  includeBackground: boolean;
  scope: ExportScope;
};

export type DiagramExportSceneInput = {
  canvasElement: HTMLElement;
  nodes: DiagramNode[];
  viewport?: DiagramViewport;
  scope: ExportScope;
  includeBackground: boolean;
};
