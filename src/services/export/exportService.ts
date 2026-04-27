import { getViewportForBounds } from '@xyflow/react';

import { calculateDiagramBounds } from '@utils/diagram';
import { triggerDownload } from '@utils/download';

import type {
  DiagramExportSceneInput,
  ExportFormat,
  ExportOptions,
} from '../../types/export';

export type ExportTarget = {
  element: HTMLElement;
  width: number;
  height: number;
  backgroundColor?: string;
};

type HtmlToImageFn = (
  node: HTMLElement,
  options?: Record<string, unknown>,
) => Promise<string>;
type PdfCtor = new (options: {
  orientation: 'landscape' | 'portrait';
  unit: 'px';
  format: [number, number];
}) => {
  addImage: (
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  save: (fileName: string) => void;
};

const CLEANUP_SELECTORS = [
  '.react-flow__controls',
  '.react-flow__minimap',
  '.react-flow__attribution',
  '.react-flow__panel',
  '.react-flow__node-toolbar',
  '.react-flow__selection',
  '.react-flow__nodesselection',
  '.react-flow__resize-control',
  '.react-flow__handle',
  '.react-flow__edgeupdater',
  '.react-flow__selectionpane',
];

const NODE_SELECTION_CLASSES = [
  'ring-2',
  'ring-primary/25',
  'shadow-focus',
  'ring-accent/30',
];

async function getHtmlToImage() {
  const module = await import('html-to-image');
  return module.toPng;
}

async function getPdfCtor() {
  const module = await import('jspdf');
  return module.jsPDF;
}

function removeEditorArtifacts(root: HTMLElement, includeBackground: boolean) {
  CLEANUP_SELECTORS.forEach((selector) => {
    root.querySelectorAll(selector).forEach((element) => element.remove());
  });

  if (!includeBackground) {
    root.querySelectorAll('.react-flow__background').forEach((element) => {
      element.remove();
    });
  }

  root.querySelectorAll('.selected').forEach((element) => {
    element.classList.remove('selected');
  });

  root
    .querySelectorAll<HTMLElement>('[data-testid^="diagram-node-"]')
    .forEach((element) => {
      NODE_SELECTION_CLASSES.forEach((className) => {
        element.classList.remove(className);
      });
    });
}

export function createCleanExportTarget({
  canvasElement,
  nodes,
  viewport,
  scope,
  includeBackground,
}: DiagramExportSceneInput): ExportTarget & { cleanup: () => void } {
  const reactFlowRoot = canvasElement.querySelector<HTMLElement>('.react-flow');

  if (!reactFlowRoot) {
    throw new Error('React Flow root not found for export.');
  }

  const clonedRoot = reactFlowRoot.cloneNode(true) as HTMLElement;
  const clonedViewport = clonedRoot.querySelector<HTMLElement>(
    '.react-flow__viewport',
  );

  if (!clonedViewport) {
    throw new Error('React Flow viewport not found for export.');
  }

  removeEditorArtifacts(clonedRoot, includeBackground);

  const wrapper = document.createElement('div');
  wrapper.className = 'flowcraft-export-scene';
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-10000px';
  wrapper.style.top = '0';
  wrapper.style.zIndex = '-1';
  wrapper.style.overflow = 'hidden';
  wrapper.style.pointerEvents = 'none';

  let width = canvasElement.clientWidth;
  let height = canvasElement.clientHeight;

  if (scope === 'full') {
    const bounds = calculateDiagramBounds(nodes);
    width = Math.round(bounds.width);
    height = Math.round(bounds.height);
    const exportViewport = getViewportForBounds(
      bounds,
      width,
      height,
      0.1,
      2,
      0,
    );

    clonedViewport.style.transform = `translate(${exportViewport.x}px, ${exportViewport.y}px) scale(${exportViewport.zoom})`;
  } else {
    const currentViewport = viewport ?? { x: 0, y: 0, zoom: 1 };
    clonedViewport.style.transform = `translate(${currentViewport.x}px, ${currentViewport.y}px) scale(${currentViewport.zoom})`;
  }

  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  clonedRoot.style.width = `${width}px`;
  clonedRoot.style.height = `${height}px`;
  clonedRoot.style.background = includeBackground
    ? 'var(--color-canvas)'
    : 'transparent';

  wrapper.appendChild(clonedRoot);
  document.body.appendChild(wrapper);

  return {
    element: clonedRoot,
    width,
    height,
    backgroundColor: includeBackground ? '#FFFFFF' : undefined,
    cleanup: () => {
      wrapper.remove();
    },
  };
}

export async function createDiagramDataUrl(
  target: ExportTarget,
  options: ExportOptions,
  htmlToImageFn?: HtmlToImageFn,
) {
  const toPng = htmlToImageFn ?? (await getHtmlToImage());

  return toPng(target.element, {
    cacheBust: true,
    backgroundColor: options.includeBackground
      ? (target.backgroundColor ?? '#FFFFFF')
      : 'transparent',
    pixelRatio: 2,
    width: target.width,
    height: target.height,
  });
}

export async function exportAsPng(
  target: ExportTarget,
  options: ExportOptions,
  htmlToImageFn?: HtmlToImageFn,
) {
  const dataUrl = await createDiagramDataUrl(target, options, htmlToImageFn);
  triggerDownload(dataUrl, `${options.fileName}.png`);
}

export async function exportAsPdf(
  target: ExportTarget,
  options: ExportOptions,
  htmlToImageFn?: HtmlToImageFn,
  PdfClass?: PdfCtor,
) {
  const dataUrl = await createDiagramDataUrl(target, options, htmlToImageFn);
  const orientation = target.width >= target.height ? 'landscape' : 'portrait';
  const ResolvedPdfClass = PdfClass ?? (await getPdfCtor());
  const pdf = new ResolvedPdfClass({
    orientation,
    unit: 'px',
    format: [target.width, target.height],
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, target.width, target.height);
  pdf.save(`${options.fileName}.pdf`);
}

export async function exportDiagram(
  format: ExportFormat,
  target: ExportTarget,
  options: ExportOptions,
) {
  if (format === 'png') {
    return exportAsPng(target, options);
  }

  return exportAsPdf(target, options);
}
