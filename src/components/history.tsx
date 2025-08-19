"use client";

import React, { useEffect, useMemo, useState } from "react";
import { listSessions, deleteSession, purgeExpiredSessions, StoredSession } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function HistoryList() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const items = await listSessions();
      setSessions(items);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => {
      if (s.idea?.title && s.idea.title.toLowerCase().includes(q)) return true;
      if (s.script?.text && s.script.text.toLowerCase().includes(q)) return true;
      if (s.selectedHook && String(s.selectedHook).toLowerCase().includes(q)) return true;
      return false;
    });
  }, [sessions, query]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-semibold">History</h2>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, script or hook..."
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
              No saved sessions match your query. Generate a script and it will be saved here.
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
                  // Open in new tab of the app — route to /history/:id not implemented yet, so copy to clipboard as fallback
                  const payload = JSON.stringify(s, null, 2);
                  navigator.clipboard.writeText(payload);
                  toast.success("Session JSON copied to clipboard (use import later).");
                }}>
                  Export
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
                  <p className="text-xs text-muted-foreground">Instagram generated — click Export to copy full session.</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}