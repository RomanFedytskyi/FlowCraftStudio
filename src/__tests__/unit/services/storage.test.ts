import {
  readDiagramStorage,
  writeDiagramStorage,
} from '@services/diagrams/storage';

import { STORAGE_KEY, STORAGE_VERSION } from '@configs/app';

import { createEmptyDiagram } from '@utils/diagram';

describe('diagram storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty envelope for empty storage', () => {
    expect(readDiagramStorage()).toEqual({
      version: STORAGE_VERSION,
      diagrams: [],
    });
  });

  it('writes and reads diagrams', () => {
    const diagram = createEmptyDiagram('Stored');
    writeDiagramStorage([diagram]);

    const envelope = readDiagramStorage();

    expect(envelope.diagrams).toHaveLength(1);
    expect(envelope.diagrams[0]?.name).toBe('Stored');
  });

  it('recovers from corrupted payloads', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid-json');

    const envelope = readDiagramStorage();

    expect(envelope.diagrams).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
