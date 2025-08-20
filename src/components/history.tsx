"use client";

import React, { useEffect, useMemo, useState } from "react";
import { listSessions, deleteSession, purgeExpiredSessions, saveSession, type StoredSession } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function HistoryList() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const router = useRouter();

  // Load all saved sessions from local storage, filter last 7 days
  const load = async () => {
    setLoading(true);
    try {
      const items = await listSessions();
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      // Filter sessions created within last 7 days
      const recentSessions = items.filter(s => s.createdAt && s.createdAt >= sevenDaysAgo);
      setSessions(recentSessions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this session? This action cannot be undone.")) return;
    await deleteSession(id);
    toast.success("Session deleted");
    load();
  };

  const handlePurgeExpired = async () => {
    setLoading(true);
    try {
      const removed = await purgeExpiredSessions();
      toast.success(`Purged ${removed} expired session(s).`);
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to purge expired sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (s: StoredSession) => {
    try {
      sessionStorage.setItem("reelwriter-open-session", JSON.stringify(s));
      toast.success("Opening session...");
      router.push("/");
    } catch (err) {
      console.error("Failed to open session:", err);
      toast.error("Failed to open session.");
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => {
      if (s.idea?.title && s.idea.title.toLowerCase().includes(q)) return true;
      if (s.script?.text && s.script.text.toLowerCase().includes(q)) return true;
      if (s.selectedHook && String(s.selectedHook).toLowerCase().includes(q)) return true;
      if (s.captions?.instagram && s.captions.instagram.toLowerCase().includes(q)) return true;
      if (s.captions?.linkedin && s.captions.linkedin.toLowerCase().includes(q)) return true;
      if (s.captions?.youtubeTitles && s.captions.youtubeTitles.some(title => title.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [sessions, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold">History (Last 7 Days)</h2>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, script, hook, or captions..."
            className="rounded-md border px-3 py-2 text-sm bg-background"
          />
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="destructive" onClick={handlePurgeExpired} disabled={loading}>
            Purge Expired
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No sessions found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No saved scripts or captions found for the last 7 days. Generate content to see it here.
            </p>
          </CardContent>
        </Card>
      ) : (
        filtered.map((s) => (
          <Card key={s.sessionId}>
            <CardHeader className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>{s.idea?.title || s.sessionId}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(s.createdAt).toLocaleString()} — Expires {new Date(s.expiresAt).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={s.idea?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                  onClick={(e) => {
                    if (!s.idea?.url) e.preventDefault();
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Button variant="ghost" onClick={() => {
                  const payload = JSON.stringify(s, null, 2);
                  navigator.clipboard.writeText(payload);
                  toast.success("Session JSON copied to clipboard (use import later).");
                }}>
                  Export
                </Button>
                <Button variant="outline" onClick={() => handleOpen(s)}>
                  Open
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(s.sessionId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {s.selectedHook && (
                  <p>
                    <strong>Hook:</strong> {s.selectedHook}
                  </p>
                )}
                {s.script?.text && (
                  <p className="line-clamp-3 text-sm text-muted-foreground whitespace-pre-wrap">{s.script.text}</p>
                )}
                {s.captions?.instagram && (
                  <p className="text-xs text-muted-foreground">Instagram caption generated</p>
                )}
                {s.captions?.linkedin && (
                  <p className="text-xs text-muted-foreground">LinkedIn caption generated</p>
                )}
                {s.captions?.youtubeTitles && s.captions.youtubeTitles.length > 0 && (
                  <p className="text-xs text-muted-foreground">YouTube titles generated</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}