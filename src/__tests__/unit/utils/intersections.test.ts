import { describe, expect, it } from 'vitest';

import { createNode, detectNodeIntersections } from '@utils/diagram';

describe('detectNodeIntersections', () => {
  it('returns intersecting node ids', () => {
    const a = createNode(
      [],
      'process',
      { x: 100, y: 100 },
      { style: { width: 200, height: 120 } },
    );
    const b = createNode(
      [a],
      'process',
      { x: 250, y: 160 },
      { style: { width: 200, height: 120 } },
    );
    const c = createNode(
      [a, b],
      'process',
      { x: 500, y: 500 },
      { style: { width: 200, height: 120 } },
    );

    const result = detectNodeIntersections([a, b, c], a.id);
    expect(result).toEqual([b.id]);
  });

  it('returns empty array when none intersect', () => {
    const a = createNode(
      [],
      'process',
      { x: 0, y: 0 },
      { style: { width: 100, height: 100 } },
    );
    const b = createNode(
      [a],
      'process',
      { x: 200, y: 200 },
      { style: { width: 100, height: 100 } },
    );

    expect(detectNodeIntersections([a, b], a.id)).toEqual([]);
  });
});
