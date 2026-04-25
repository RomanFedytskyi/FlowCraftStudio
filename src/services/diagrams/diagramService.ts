import {
  readDiagramStorage,
  writeDiagramStorage,
} from '@services/diagrams/storage';

import {
  createEmptyDiagram,
  duplicateDiagram as cloneDiagram,
  renameDiagram,
} from '@utils/diagram';

import type { Diagram } from '../../types/diagram';

function sortByUpdatedAt(diagrams: Diagram[]) {
  return [...diagrams].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export const diagramService = {
  list(): Diagram[] {
    return sortByUpdatedAt(readDiagramStorage().diagrams);
  },

  getById(diagramId: string): Diagram | null {
    return (
      readDiagramStorage().diagrams.find(
        (diagram) => diagram.id === diagramId,
      ) ?? null
    );
  },

  create(rawName?: string): Diagram {
    const diagrams = readDiagramStorage().diagrams;
    const name = rawName?.trim() ? rawName.trim() : 'Untitled Diagram';
    const diagram = createEmptyDiagram(name);
    writeDiagramStorage([diagram, ...diagrams]);
    return diagram;
  },

  update(diagramId: string, updater: (diagram: Diagram) => Diagram): Diagram {
    const diagrams = readDiagramStorage().diagrams;
    const nextDiagrams = diagrams.map((diagram) =>
      diagram.id === diagramId ? updater(diagram) : diagram,
    );
    const updated = nextDiagrams.find((diagram) => diagram.id === diagramId);

    if (!updated) {
      throw new Error(`Diagram "${diagramId}" not found.`);
    }

    writeDiagramStorage(nextDiagrams);
    return updated;
  },

  rename(diagramId: string, name: string): Diagram {
    return this.update(diagramId, (diagram) => renameDiagram(diagram, name));
  },

  delete(diagramId: string) {
    const diagrams = readDiagramStorage().diagrams.filter(
      (diagram) => diagram.id !== diagramId,
    );
    writeDiagramStorage(diagrams);
  },

  duplicate(diagramId: string): Diagram {
    const diagrams = readDiagramStorage().diagrams;
    const existing = diagrams.find((diagram) => diagram.id === diagramId);

    if (!existing) {
      throw new Error(`Diagram "${diagramId}" not found.`);
    }

    const duplicate = cloneDiagram(existing);
    writeDiagramStorage([duplicate, ...diagrams]);
    return duplicate;
  },
};
