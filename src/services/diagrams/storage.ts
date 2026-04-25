import { STORAGE_KEY, STORAGE_VERSION } from '@configs/app';

import type { Diagram, DiagramStorageEnvelopeV1 } from '../../types/diagram';

type UnknownStorageEnvelope = {
  version?: string;
  diagrams?: unknown;
};

function isDiagramArray(value: unknown): value is Diagram[] {
  return Array.isArray(value);
}

function createEmptyEnvelope(): DiagramStorageEnvelopeV1 {
  return {
    version: STORAGE_VERSION,
    diagrams: [],
  };
}

function migrateEnvelope(
  raw: UnknownStorageEnvelope,
): DiagramStorageEnvelopeV1 {
  if (raw.version === STORAGE_VERSION && isDiagramArray(raw.diagrams)) {
    return {
      version: STORAGE_VERSION,
      diagrams: raw.diagrams,
    };
  }

  return createEmptyEnvelope();
}

export function readDiagramStorage(): DiagramStorageEnvelopeV1 {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return createEmptyEnvelope();
  }

  try {
    const parsed = JSON.parse(rawValue) as UnknownStorageEnvelope;
    return migrateEnvelope(parsed);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return createEmptyEnvelope();
  }
}

export function writeDiagramStorage(diagrams: Diagram[]) {
  const payload: DiagramStorageEnvelopeV1 = {
    version: STORAGE_VERSION,
    diagrams,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
