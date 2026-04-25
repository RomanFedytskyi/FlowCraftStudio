import { createId } from '@utils/id';

describe('createId', () => {
  it('creates ids with a prefix', () => {
    const value = createId('diagram');

    expect(value).toMatch(/^diagram-/);
  });
});
