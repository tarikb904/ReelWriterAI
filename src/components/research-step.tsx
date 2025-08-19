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

// Basic stop words list for topic extraction
const STOPWORDS = new Set([
  "the","and","for","to","of","in","on","a","is","how","this","that","with","you","your","are","my","i","be","from","by","at","it"
]);

function extractTopics(ideas: ContentIdea[], topN = 8) {
  const freq: Record<string, number> = {};
  ideas.forEach((idea) => {
    const text = `${idea.title} ${idea.snippet}`.toLowerCase();
    const words = text.match(/\b[a-z0-9]{3,}\b/g) || [];
    words.forEach((w) => {
      if (STOPWORDS.has(w)) return;
      freq[w] = (freq[w] || 0) + 1;
    });
  });
  const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return entries.slice(0, topN).map(([word, count]) => ({ word, count }));
}

export function ResearchStep({ onNext }: ResearchStepProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const session = useSession();
  const [apiKey, setApiKey] = useState<string | null>(session.apiKey ?? "");
  const [selectedApi, setSelectedApi] = useState<string>(session.model || DEFAULT_MODELS[0]);
  const [availableModels, setAvailableModels] = useState<string[]>(DEFAULT_MODELS);
  const [validating, setValidating] = useState(false);
  const [isValidKey, setIsValidKey] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);

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

  const validateKey = async () => {
    if (!apiKey) {
      setIsValidKey(false);
      setValidationMessage("No API key entered");
      return;
    }
    setValidating(true);
    setIsValidKey(null);
    setValidationMessage(null);

    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setIsValidKey(true);
        setValidationMessage("API key validated");
        if (Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(data.models);
          setSelectedApi(data.models[0]);
        }
        // also persist to session context (sessionStorage)
        session.setApiKey(apiKey);
      } else {
        setIsValidKey(false);
        setValidationMessage(data?.message || "Validation failed");
      }
    } catch (err) {
      console.error("Validation error:", err);
      setIsValidKey(false);
      setValidationMessage("Validation request failed");
    } finally {
      setValidating(false);
    }
  };

  const handleNextClick = async () => {
    if (!selectedIdea) return;
    // If key validated, store it session-scoped
    if (isValidKey && apiKey) {
      session.setApiKey(apiKey);
      session.setModel(selectedApi);
    } else {
      // allow proceeding without validated key but warn
      if (!confirm("API key not validated — you can proceed but generation may fail. Continue?")) return;
      session.setApiKey(apiKey || null);
      session.setModel(selectedApi);
    }

    // Create a new session meta and persist initial session object
    const meta = session.createNewSession(selectedIdea.title);

    // Prepare stored session (do not save raw API key)
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
        apiKeyMasked: maskKey(apiKey),
      },
    };

    try {
      await saveSession(stored);
      toast.success("Session started and saved to history.");
    } catch (err) {
      console.error("Failed to save session:", err);
      toast.error("Failed to initialize session in history.");
    }

    onNext(selectedIdea, apiKey || "", selectedApi);
  };

  const topics = useMemo(() => extractTopics(ideas), [ideas]);

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

      <div className="lg:col-span-1">
        <Card className="sticky top-8 glass-card">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select your AI model and validate your OpenRouter key.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">OpenRouter API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your OpenRouter API key"
                  value={apiKey ?? ""}
                  onChange={(e) => { setApiKey(e.target.value); setIsValidKey(null); setValidationMessage(null); }}
                />
                <Button onClick={validateKey} disabled={validating || !apiKey}>
                  {validating ? "Validating..." : "Validate"}
                </Button>
              </div>
              {isValidKey === true && <p className="text-sm text-green-500">{validationMessage}</p>}
              {isValidKey === false && <p className="text-sm text-red-500">{validationMessage}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="api-select" className="text-sm font-medium">AI Model</Label>
              <Select value={selectedApi} onValueChange={setSelectedApi}>
                <SelectTrigger id="api-select">
                  <SelectValue placeholder="Select an AI model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xs text-muted-foreground">
              Your API key is stored only for this browser session and not persisted in history (masked copy saved).
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