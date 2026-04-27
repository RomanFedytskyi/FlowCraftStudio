import {
  createDiagramSnapshot,
  createEdge,
  createEmptyDiagram,
  createHistoryState,
  createNode,
  duplicateDiagram,
  duplicateEdges,
  duplicateNodes,
  groupNodes,
  nextQuickBackgroundStyle,
  nextQuickFillStyle,
  pushHistory,
  redoHistory,
  searchDiagramNodes,
  undoHistory,
  ungroupNodes,
  updateNodeLabel,
} from '@utils/diagram';

describe('diagram utils', () => {
  it('creates an empty diagram', () => {
    const diagram = createEmptyDiagram('Test');

    expect(diagram.name).toBe('Test');
    expect(diagram.nodes).toEqual([]);
    expect(diagram.edges).toEqual([]);
    expect(diagram.description).toBe('');
    expect(diagram.tags).toEqual([]);
  });

  it('duplicates diagrams with new ids', () => {
    const original = createEmptyDiagram('Original');
    original.nodes = [createNode([], 'process')];

    const copy = duplicateDiagram(original);

    expect(copy.id).not.toBe(original.id);
    expect(copy.name).toContain('Copy');
    expect(copy.nodes[0]?.id).not.toBe(original.nodes[0]?.id);
  });

  it('creates typed nodes with default labels', () => {
    const node = createNode([], 'decision');

    expect(node.type).toBe('decision');
    expect(node.data.label).toBe('Decision');
    expect(node.selected).toBe(true);
  });

  it('applies width and height from style patch to node style', () => {
    const node = createNode(
      [],
      'process',
      { x: 10, y: 10 },
      {
        style: { width: 320, height: 180 },
      },
    );

    expect(Number(node.style?.width)).toBe(320);
    expect(Number(node.style?.height)).toBe(180);
    expect(Number(node.style?.minHeight)).toBe(180);
  });

  it('auto-resizes nodes when labels become multi-line', () => {
    const node = createNode([], 'process');
    const resized = updateNodeLabel(
      [node],
      node.id,
      'First line\nSecond line\nThird line',
    )[0];

    expect(Number(resized?.style?.minHeight ?? 0)).toBeGreaterThan(
      Number(node.style?.minHeight ?? 0),
    );
  });

  it('duplicates selected nodes and connected edges', () => {
    const source = createNode([], 'start');
    const target = createNode([source], 'process');
    const edge = createEdge({ source: source.id, target: target.id });

    const { duplicatedNodes, idMap } = duplicateNodes(
      [source, target],
      [source.id, target.id],
    );
    const duplicatedLinkedEdges = duplicateEdges([edge], idMap);

    expect(duplicatedNodes).toHaveLength(2);
    expect(duplicatedLinkedEdges).toHaveLength(1);
    expect(duplicatedLinkedEdges[0]?.source).not.toBe(edge.source);
    expect(duplicatedLinkedEdges[0]?.target).not.toBe(edge.target);
  });

  it('creates directional edges with unique ids', () => {
    const edge = createEdge({ source: 'node-a', target: 'node-b' });

    expect(edge.id).toMatch(/^edge-/);
    expect(edge.source).toBe('node-a');
    expect(edge.target).toBe('node-b');
    expect(edge.data?.markerKind).toBe('arrow');
    expect(edge.data?.markerPosition).toBe('end');
  });

  it('supports undo and redo through a structured history stack', () => {
    const initial = createDiagramSnapshot({
      name: 'History demo',
      nodes: [],
      edges: [],
    });
    const firstNode = createNode([], 'start');
    const nextSnapshot = createDiagramSnapshot({
      name: 'History demo',
      nodes: [firstNode],
      edges: [],
    });

    const history = pushHistory(createHistoryState(initial), nextSnapshot);
    const undone = undoHistory(history);
    const redone = redoHistory(undone);

    expect(history.past).toHaveLength(1);
    expect(undone.present.nodes).toHaveLength(0);
    expect(redone.present.nodes).toHaveLength(1);
  });

  it('groups and ungroups selected nodes without losing members', () => {
    const first = createNode([], 'start', { x: 120, y: 120 });
    const second = createNode([first], 'process', { x: 320, y: 160 });
    const grouped = groupNodes([first, second], [first.id, second.id]);

    const group = grouped.find((node) => node.type === 'group');

    expect(group).toBeDefined();
    expect(grouped.filter((node) => node.parentId === group?.id)).toHaveLength(
      2,
    );

    const ungrouped = ungroupNodes(grouped, group!.id);

    expect(ungrouped.find((node) => node.type === 'group')).toBeUndefined();
    expect(ungrouped.every((node) => !node.parentId)).toBe(true);
  });

  it('searches nodes by label text', () => {
    const start = createNode([], 'start');
    const process = createNode([start], 'process');
    const note = createNode([start, process], 'note');

    process.data.label = 'API Gateway';
    note.data.label = 'Database review';

    const results = searchDiagramNodes([start, process, note], 'api');

    expect(results).toEqual([
      {
        nodeId: process.id,
        label: 'API Gateway',
      },
    ]);
  });

  it('nextQuickFillStyle toggles fill for primitive shapes (fill wins over background)', () => {
    expect(nextQuickFillStyle({ fillColor: 'transparent' })).toEqual({
      fillColor: 'primary-soft',
    });
    expect(nextQuickFillStyle({ fillColor: 'primary-soft' })).toEqual({
      fillColor: 'transparent',
    });
    expect(
      nextQuickFillStyle({
        fillColor: 'transparent',
        backgroundColor: 'primary-soft',
      }),
    ).toEqual({ fillColor: 'primary-soft' });
  });

  it('nextQuickBackgroundStyle toggles card background', () => {
    expect(nextQuickBackgroundStyle({})).toEqual({
      backgroundColor: 'primary-soft',
    });
    expect(
      nextQuickBackgroundStyle({ backgroundColor: 'primary-soft' }),
    ).toEqual({ backgroundColor: 'transparent' });
  });
});
