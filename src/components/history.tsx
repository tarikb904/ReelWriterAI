"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, ExternalLink, RefreshCw, FileText, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteHistoryEntry, listHistoryEntries, purgeOldEntries, type HistoryEntry } from "@/lib/history";

export default function HistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const items = await listHistoryEntries();
      setEntries(items);
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
    if (!confirm("Delete this item? This action cannot be undone.")) return;
    await deleteHistoryEntry(id);
    toast.success("Deleted");
    load();
  };

  const handlePurge = async () => {
    setLoading(true);
    try {
      const removed = await purgeOldEntries(7);
      toast.success(`Purged ${removed} old item(s).`);
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to purge.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async (e: HistoryEntry) => {
    // Prepare a minimal payload for the dashboard opener
    const payload = {
      idea: e.ideaTitle ? { title: e.ideaTitle, snippet: e.ideaSnippet, url: e.url, source: e.source } : undefined,
      selectedHook: e.hook,
      script: e.scriptText ? { text: e.scriptText } : undefined,
      captions: e.captions,
      createdAt: e.createdAt,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    sessionStorage.setItem("reelwriter-open-session", JSON.stringify(payload));
    toast.success("Opening...");
    router.push("/");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((e) => {
      if (e.ideaTitle && e.ideaTitle.toLowerCase().includes(q)) return true;
      if (e.ideaSnippet && e.ideaSnippet.toLowerCase().includes(q)) return true;
      if (e.hook && e.hook.toLowerCase().includes(q)) return true;
      if (e.scriptText && e.scriptText.toLowerCase().includes(q)) return true;
      if (e.captions?.instagram && e.captions.instagram.toLowerCase().includes(q)) return true;
      if (e.captions?.linkedin && e.captions.linkedin.toLowerCase().includes(q)) return true;
      if (e.captions?.youtubeTitles && e.captions.youtubeTitles.some(t => t.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [entries, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold">History (Last 7 Days)</h2>
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, script, hook, or captions..."
            className="rounded-md border px-3 py-2 text-sm bg-background"
          />
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="destructive" onClick={handlePurge} disabled={loading}>
            Purge 7d+
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No items yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate scripts and captions to see them here.
            </p>
          </CardContent>
        </Card>
      ) : (
        filtered.map((e) => (
          <Card key={e.id} className="overflow-hidden">
            <CardHeader className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {e.type === "script" ? <FileText className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  {e.type === "script" ? "Script" : "Captions"}
                </span>
                <CardTitle className="text-base">
                  {e.ideaTitle || (e.type === "captions" ? "Captions" : "Script")}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {e.url && (
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-sm">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <Button variant="outline" size="sm" onClick={() => handleOpen(e)}>
                  Open
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(e.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {e.hook && (
                  <p className="text-sm"><strong>Hook:</strong> {e.hook}</p>
                )}
                {e.scriptText && (
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">{e.scriptText}</p>
                )}
                {e.captions?.instagram && (
                  <p className="text-xs text-muted-foreground">Instagram/Facebook caption saved</p>
                )}
                {e.captions?.linkedin && (
                  <p className="text-xs text-muted-foreground">LinkedIn caption saved</p>
                )}
                {e.captions?.youtubeTitles && e.captions.youtubeTitles.length > 0 && (
                  <p className="text-xs text-muted-foreground">YouTube titles saved</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(e.createdAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}