import localforage from "localforage";

export type HistoryEntry = {
  id: string;
  createdAt: number;
  type: "script" | "captions" | "project";
  // common context
  ideaTitle?: string;
  ideaSnippet?: string;
  source?: string;
  url?: string;
  hook?: string | null;

  // payloads
  scriptText?: string;
  captions?: {
    instagram?: string;
    linkedin?: string;
    youtubeTitles?: string[];
  };
};

const HISTORY_STORE = "reelwriter-history";

localforage.config({
  name: "reelwriterai",
  storeName: HISTORY_STORE,
});

export async function saveHistoryEntry(entry: Omit<HistoryEntry, "id" | "createdAt"> & { id?: string; createdAt?: number }) {
  const id = entry.id ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const createdAt = entry.createdAt ?? Date.now();
  const value: HistoryEntry = { ...entry, id, createdAt };
  await localforage.setItem(id, value);
  return value;
}

export async function listHistoryEntries(): Promise<HistoryEntry[]> {
  const items: HistoryEntry[] = [];
  await localforage.iterate<HistoryEntry, void>((value) => {
    if (value) items.push(value);
  });
  items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}

export async function deleteHistoryEntry(id: string) {
  await localforage.removeItem(id);
}

export async function purgeOldEntries(days = 7) {
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  const toDelete: string[] = [];
  await localforage.iterate<HistoryEntry, void>((value, key) => {
    if (value && value.createdAt < cutoff) toDelete.push(String(key));
  });
  await Promise.all(toDelete.map((k) => localforage.removeItem(k)));
  return toDelete.length;
}