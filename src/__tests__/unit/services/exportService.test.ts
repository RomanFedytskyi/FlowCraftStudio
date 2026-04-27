import {
  createCleanExportTarget,
  exportAsPdf,
  exportAsPng,
} from '@services/export/exportService';

import { calculateDiagramBounds, createNode } from '@utils/diagram';

describe('export service', () => {
  const target = {
    element: document.createElement('div'),
    width: 800,
    height: 600,
    backgroundColor: '#000000',
  };

  it('calculates padded bounds for full diagram export', () => {
    const first = createNode([], 'process', { x: 100, y: 120 });
    const second = createNode([first], 'text', { x: 440, y: 280 });
    const bounds = calculateDiagramBounds([first, second], 40);

    expect(bounds.x).toBeLessThanOrEqual(60);
    expect(bounds.y).toBeLessThanOrEqual(80);
    expect(bounds.width).toBeGreaterThan(300);
    expect(bounds.height).toBeGreaterThan(200);
  });

  it('creates a clean export target without editor UI artifacts', () => {
    const canvasElement = document.createElement('div');
    canvasElement.style.width = '900px';
    canvasElement.style.height = '640px';
    Object.defineProperty(canvasElement, 'clientWidth', { value: 900 });
    Object.defineProperty(canvasElement, 'clientHeight', { value: 640 });
    canvasElement.innerHTML = `
      <div class="react-flow">
        <div class="react-flow__background" data-testid="export-test-grid"></div>
        <div class="react-flow__controls"></div>
        <div class="react-flow__minimap"></div>
        <div class="react-flow__viewport">
          <div data-testid="diagram-node-node-1" class="ring-2 shadow-focus selected">Node</div>
          <div class="react-flow__handle"></div>
        </div>
      </div>
    `;
    document.body.appendChild(canvasElement);

    const node = createNode([], 'process', { x: 100, y: 100 });
    const result = createCleanExportTarget({
      canvasElement,
      nodes: [node],
      scope: 'full',
      includeBackground: true,
      viewport: { x: 0, y: 0, zoom: 1 },
    });

    expect(result.width).toBeGreaterThan(200);
    expect(result.height).toBeGreaterThan(100);
    expect(result.element.querySelector('.react-flow__controls')).toBeNull();
    expect(result.element.querySelector('.react-flow__minimap')).toBeNull();
    expect(result.element.querySelector('.react-flow__handle')).toBeNull();
    expect(result.element.querySelector('.react-flow__background')).toBeNull();

    result.cleanup();
    canvasElement.remove();
  });

  it('exports png downloads', async () => {
    const click = vi.fn();
    const anchor = { click } as unknown as HTMLAnchorElement;
    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(anchor);
    const htmlToImage = vi.fn().mockResolvedValue('data:image/png;base64,test');

    await exportAsPng(
      target,
      { fileName: 'diagram', includeBackground: true, scope: 'viewport' },
      htmlToImage,
    );

    expect(htmlToImage).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    createElementSpy.mockRestore();
  });

  it('exports pdf documents', async () => {
    const save = vi.fn();
    const addImage = vi.fn();
    const PdfClass = vi.fn().mockImplementation(() => ({ addImage, save }));
    const htmlToImage = vi.fn().mockResolvedValue('data:image/png;base64,test');

    await exportAsPdf(
      target,
      { fileName: 'diagram', includeBackground: false, scope: 'full' },
      htmlToImage,
      PdfClass as never,
    );

    expect(addImage).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith('diagram.pdf');
  });
});
