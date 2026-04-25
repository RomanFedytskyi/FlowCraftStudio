import { describe, expect, it } from 'vitest';

import { resolveNodeCapabilities } from '@configs/nodeCapabilities.config';

describe('nodeCapabilities', () => {
  it('returns defaults for a node type', () => {
    expect(resolveNodeCapabilities('process')).toMatchObject({
      connectable: true,
      resizable: true,
      toolbar: true,
    });
  });

  it('allows overrides', () => {
    expect(
      resolveNodeCapabilities('process', { resizable: false }),
    ).toMatchObject({
      connectable: true,
      resizable: false,
      toolbar: true,
    });
  });
});
