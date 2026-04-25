import type { BlockLibraryNodeItem } from '@configs/blockLibrary.config';

const EXPANDED_KEY = 'flowcraft:sidebar:expanded-tabs:v1';
const RECENT_KEY = 'flowcraft:sidebar:recent-shape-ids:v1';
const MAX_RECENT = 8;

export type SidebarExpandedMap = Record<string, boolean>;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function readSidebarExpandedTabs(): SidebarExpandedMap | null {
  return readJson<SidebarExpandedMap | null>(EXPANDED_KEY, null);
}

export function writeSidebarExpandedTabs(map: SidebarExpandedMap) {
  localStorage.setItem(EXPANDED_KEY, JSON.stringify(map));
}

export function readRecentShapeIds(): string[] {
  const value = readJson<string[] | null>(RECENT_KEY, null);
  return Array.isArray(value)
    ? value.filter((id) => typeof id === 'string')
    : [];
}

export function rememberRecentShapeId(itemId: string) {
  const previous = readRecentShapeIds().filter((id) => id !== itemId);
  const next = [itemId, ...previous].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function resolveRecentItems(
  ids: string[],
  catalog: BlockLibraryNodeItem[],
): BlockLibraryNodeItem[] {
  const byId = new Map(catalog.map((item) => [item.id, item]));
  return ids
    .map((id) => byId.get(id))
    .filter(Boolean) as BlockLibraryNodeItem[];
}
