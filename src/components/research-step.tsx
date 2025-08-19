"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/context/session-context";
import { saveSession } from "@/lib/storage";

export interface ContentIdea {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url: string;
}

interface ResearchStepProps {
  onNext: (idea: ContentIdea, apiKey: string, model: string) => void;
}

const DEFAULT_MODELS = [
  "mistralai/mistral-7b-instruct:free",
  "google/gemma-7b-it:free",
  "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
  "openchat/openchat-7b:free",
  "openai/gpt-3.5-turbo",
];

function maskKey(key?: string | null) {
  if (!key) return null;
  if (key.length <= 10) return key;
  return `${key.slice(0,6)}...${key.slice(-4)}`;
}

export function ResearchStep({ onNext }: ResearchStepProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const session = useSession();
  const [apiKeyInput, setApiKeyInput] = useState<string | null>(session.apiKey ?? "");
  const [selectedApi, setSelectedApi] = useState<string>(session.model || DEFAULT_MODELS[0]);
  const [availableModels, setAvailableModels] = useState<string[]>(DEFAULT_MODELS);
  const [validatingOpenRouter, setValidatingOpenRouter] = useState(false);
  const [openRouterStatus, setOpenRouterStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const [redditIdInput, setRedditIdInput] = useState<string | null>(session.redditClientId ?? "");
  const [redditSecretInput, setRedditSecretInput] = useState<string | null>(session.redditClientSecret ?? "");
  const [validatingReddit, setValidatingReddit] = useState(false);
  const [redditStatus, setRedditStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const fetchIdeas = async (forceRefresh = false) => {
    setLoading(true);
    setSelectedIdea(null);

    const cachedData = localStorage.getItem("contentIdeas");
    if (cachedData && !forceRefresh) {
      const { timestamp, data } = JSON.parse(cachedData);
      // Cache is valid for 1 day
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        setIdeas(data);
        setLoading(false);
        return;
      }
    }

    try {
      const [redditRes, rssRes, hnRes] = await Promise.all([
        fetch("/api/reddit"),
        fetch("/api/rss"),
        fetch("/api/hackernews"),
      ]);

      if (!redditRes.ok || !rssRes.ok || !hnRes.ok) {
        throw new Error("Failed to fetch content ideas from one or more sources.");
      }

      const redditIdeas = await redditRes.json();
      const rssIdeas = await rssRes.json();
      const hnIdeas = await hnRes.json();

      const combinedIdeas = [...redditIdeas, ...rssIdeas, ...hnIdeas];
      
      // Deduplicate and shuffle
      const uniqueIdeas = Array.from(new Map(combinedIdeas.map((idea: any) => [idea.title, idea])).values());
      const shuffledIdeas = uniqueIdeas.sort(() => 0.5 - Math.random()).slice(0, 50);

      setIdeas(shuffledIdeas);
      localStorage.setItem("contentIdeas", JSON.stringify({ timestamp: Date.now(), data: shuffledIdeas }));
      toast.success("Fresh content ideas have been loaded!");
    } catch (error) {
      console.error(error);
      toast.error("Could not fetch content ideas. Please check API keys and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const validateOpenRouter = async () => {
    if (!apiKeyInput) {
      setOpenRouterStatus({ ok: false, message: "No OpenRouter API key entered" });
      return;
    }
    setValidatingOpenRouter(true);
    setOpenRouterStatus(null);
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKeyInput }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setOpenRouterStatus({ ok: true, message: "OpenRouter key validated" });
        if (Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(data.models);
          setSelectedApi(data.models[0]);
        }
        session.setApiKey(apiKeyInput);
      } else {
        setOpenRouterStatus({ ok: false, message: data?.message || "Validation failed" });
      }
    } catch (err) {
      console.error("OpenRouter validation error:", err);
      setOpenRouterStatus({ ok: false, message: "Validation request failed" });
    } finally {
      setValidatingOpenRouter(false);
    }
  };

  const validateReddit = async () => {
    if (!redditIdInput || !redditSecretInput) {
      setRedditStatus({ ok: false, message: "Missing Reddit client id or secret" });
      return;
    }
    setValidatingReddit(true);
    setRedditStatus(null);
    try {
      const res = await fetch("/api/validate-reddit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: redditIdInput, clientSecret: redditSecretInput }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setRedditStatus({ ok: true, message: "Reddit credentials validated" });
        session.setRedditClientId(redditIdInput);
        session.setRedditClientSecret(redditSecretInput);
      } else {
        setRedditStatus({ ok: false, message: data?.message || "Validation failed" });
      }
    } catch (err) {
      console.error("Reddit validation error:", err);
      setRedditStatus({ ok: false, message: "Validation request failed" });
    } finally {
      setValidatingReddit(false);
    }
  };

  const handleNextClick = async () => {
    if (!selectedIdea) return;
    // store model and masked key meta into history session when creating
    session.setModel(selectedApi);
    const meta = session.createNewSession(selectedIdea.title || "");
    const stored = {
      sessionId: meta.sessionId,
      createdAt: meta.createdAt,
      expiresAt: meta.expiresAt,
      idea: {
        id: selectedIdea.id,
        title: selectedIdea.title,
        snippet: selectedIdea.snippet,
        source: selectedIdea.source,
        url: selectedIdea.url,
      },
      model: selectedApi,
      meta: {
        apiKeyMasked: maskKey(apiKeyInput),
        redditIdMasked: maskKey(redditIdInput),
      },
    };
    try {
      await saveSession(stored);
      toast.success("Session started and saved to history.");
    } catch (err) {
      console.error("Failed to save session:", err);
      toast.error("Failed to initialize session in history.");
    }

    onNext(selectedIdea, apiKeyInput || "", selectedApi);
  };

  const topics = useMemo(() => {
    const freq: Record<string, number> = {};
    ideas.forEach((idea) => {
      const text = `${idea.title} ${idea.snippet}`.toLowerCase();
      const words = text.match(/\b[a-z0-9]{3,}\b/g) || [];
      words.forEach((w) => {
        if (["the","and","for","to","of","in","on","a","is","how","this","that","with","you","your","are","my","i","be","from","by","at","it"].includes(w)) return;
        freq[w] = (freq[w] || 0) + 1;
      });
    });
    return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,8).map(([word,count])=>({word,count}));
  }, [ideas]);

  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const filteredIdeas = useMemo(() => {
    if (!filterTopic) return ideas;
    const t = filterTopic.toLowerCase();
    return ideas.filter((i) => (i.title + " " + i.snippet).toLowerCase().includes(t));
  }, [ideas, filterTopic]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Select a Viral Idea</h2>
            <p className="text-sm text-muted-foreground">Ideas pulled from Reddit, Hacker News, and top industry blogs.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchIdeas(true)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Topics */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Trending Topics</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <button
                key={t.word}
                onClick={() => setFilterTopic(t.word === filterTopic ? null : t.word)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm cursor-pointer transition",
                  filterTopic === t.word ? "bg-accent text-accent-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted/80"
                )}
              >
                {t.word} <span className="ml-2 text-xs text-muted-foreground">({t.count})</span>
              </button>
            ))}
            {topics.length === 0 && <span className="text-sm text-muted-foreground">No clear topics yet</span>}
          </div>
        </div>

        <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/4 mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6 mt-2" />
                </CardContent>
              </Card>
            ))
          ) : (
            filteredIdeas.map((idea) => (
              <Card
                key={idea.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg",
                  selectedIdea?.id === idea.id && "border-primary ring-2 ring-primary"
                )}
                onClick={() => setSelectedIdea(idea)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{idea.title}</CardTitle>
                  <CardDescription className="flex items-center justify-between">
                    <span>Source: {idea.source}</span>
                    <a href={idea.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      View Source <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{idea.snippet}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Right-side: API Keys panel */}
      <div className="lg:col-span-1">
        <Card className="sticky top-8 glass-card">
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your session keys and validate them before generating content.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {/* OpenRouter */}
            <div className="grid gap-2">
              <Label htmlFor="api-key">OpenRouter API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your OpenRouter API key"
                  value={apiKeyInput ?? ""}
                  onChange={(e) => { setApiKeyInput(e.target.value); setOpenRouterStatus(null); }}
                />
                <Button onClick={validateOpenRouter} disabled={validatingOpenRouter || !apiKeyInput}>
                  {validatingOpenRouter ? "Validating..." : "Validate"}
                </Button>
              </div>
              {openRouterStatus && (
                <p className={`text-sm ${openRouterStatus.ok ? "text-green-500" : "text-red-500"}`}>{openRouterStatus.message}</p>
              )}
              <div className="text-xs text-muted-foreground">
                Stored only for this browser session. Masked copy will be kept in history entries.
              </div>
            </div>

            {/* Reddit */}
            <div className="grid gap-2">
              <Label htmlFor="reddit-id">Reddit Client ID</Label>
              <Input
                id="reddit-id"
                type="text"
                placeholder="client id"
                value={redditIdInput ?? ""}
                onChange={(e) => { setRedditIdInput(e.target.value); setRedditStatus(null); }}
              />
              <Label htmlFor="reddit-secret">Reddit Client Secret</Label>
              <div className="flex gap-2">
                <Input
                  id="reddit-secret"
                  type="password"
                  placeholder="client secret"
                  value={redditSecretInput ?? ""}
                  onChange={(e) => { setRedditSecretInput(e.target.value); setRedditStatus(null); }}
                />
                <Button onClick={validateReddit} disabled={validatingReddit || !redditIdInput || !redditSecretInput}>
                  {validatingReddit ? "Validating..." : "Validate"}
                </Button>
              </div>
              {redditStatus && (
                <p className={`text-sm ${redditStatus.ok ? "text-green-500" : "text-red-500"}`}>{redditStatus.message}</p>
              )}
              <div className="text-xs text-muted-foreground">
                Reddit credentials are optional — used to improve Reddit fetch reliability when present.
              </div>
            </div>

            <div className="pt-2">
              <Label className="text-sm font-medium">Selected Model</Label>
              <Select value={selectedApi} onValueChange={setSelectedApi}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an AI model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button size="lg" className="w-full" disabled={!selectedIdea} onClick={handleNextClick}>
              Step 2: Generate Hooks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}