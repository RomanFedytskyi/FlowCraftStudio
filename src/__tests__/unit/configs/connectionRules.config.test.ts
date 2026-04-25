import { describe, expect, it } from 'vitest';

import { validateConnection } from '@configs/connectionRules.config';

import { createNode } from '@utils/diagram';

describe('connectionRules', () => {
  it('disallows incoming edges into Start', () => {
    const start = createNode([], 'start');
    const process = createNode([start], 'process');

    const result = validateConnection(
      {
        source: process.id,
        target: start.id,
        sourceHandle: null,
        targetHandle: null,
      },
      [start, process],
    );

    expect(result.allowed).toBe(false);
  });

  it('disallows outgoing edges from End', () => {
    const end = createNode([], 'end');
    const process = createNode([end], 'process');

    const result = validateConnection(
      {
        source: end.id,
        target: process.id,
        sourceHandle: null,
        targetHandle: null,
      },
      [end, process],
    );

    expect(result.allowed).toBe(false);
  });

  it('allows normal connections', () => {
    const start = createNode([], 'start');
    const process = createNode([start], 'process');

    const result = validateConnection(
      {
        source: start.id,
        target: process.id,
        sourceHandle: null,
        targetHandle: null,
      },
      [start, process],
    );

    expect(result.allowed).toBe(true);
  });
});
