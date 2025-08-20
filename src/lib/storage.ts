import localforage from "localforage";

export type StoredSession = {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  idea?: {
    id?: string;
    title?: string;
    snippet?: string;
    source?: string;
    url?: string;
  };
  hooks?: string[];
  selectedHook?: string | null;
  script?: { text: string; edited?: boolean; lastEdited?: number } | null;
  captions?: { instagram?: string; linkedin?: string; youtubeTitles?: string[] } | null;
  model?: string;
  meta?: Record<string, any>;
};

const SESSIONS_STORE = "reelwriter-sessions";

localforage.config({
  name: "reelwriterai",
  storeName: SESSIONS_STORE,
});

export async function saveSession(session: StoredSession) {
  if (!session || !session.sessionId) throw new Error("sessionId is required");
  await localforage.setItem(session.sessionId, session);
  return session;
}

export async function getSession(sessionId: string): Promise<StoredSession | null> {
  const s = await localforage.getItem<StoredSession>(sessionId);
  return s || null;
}

export async function listSessions(): Promise<StoredSession[]> {
  const sessions: StoredSession[] = [];
  await localforage.iterate<StoredSession, void>((value) => {
    if (value) sessions.push(value);
  });
  // Sort by createdAt desc
  sessions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return sessions;
}

export async function deleteSession(sessionId: string) {
  await localforage.removeItem(sessionId);
}

export async function purgeExpiredSessions() {
  const now = Date.now();
  const toDelete: string[] = [];
  await localforage.iterate<StoredSession, void>((value, key) => {
    if (value && value.expiresAt && value.expiresAt < now) {
      toDelete.push(String(key));
    }
  });
  await Promise.all(toDelete.map((k) => localforage.removeItem(k)));
  return toDelete.length;
}

/**
 * Create a new session with timestamps and save it.
 * If sessionId is provided, update existing session.
 */
export async function createOrUpdateSession(session: Partial<StoredSession> & { sessionId?: string }) {
  const now = Date.now();
  const sessionId = session.sessionId ?? `${now.toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
  const existing = await getSession(sessionId);
  const createdAt = existing?.createdAt ?? now;
  const expiresAt = existing?.expiresAt ?? (now + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

  const newSession: StoredSession = {
    sessionId,
    createdAt,
    expiresAt,
    ...existing,
    ...session,
  };

  await saveSession(newSession);
  return newSession;
}