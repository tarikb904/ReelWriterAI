"use client";

import { useEffect, useState } from "react";
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

const openRouterModels = [
    // Free Models
    "mistralai/mistral-7b-instruct:free",
    "google/gemma-7b-it:free",
    "nousresearch/nous-hermes-2-mixtral-8x7b-dpo:free",
    "openchat/openchat-7b:free",
    // Paid Models
    "openai/gpt-3.5-turbo",
    "openai/gpt-4o",
    "google/gemini-pro",
    "anthropic/claude-3-haiku-20240307",
    "meta-llama/llama-3-8b-instruct",
    "meta-llama/llama-3-70b-instruct",
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
  const [apiKey, setApiKey] = useState<string | null>(session.apiKey ?? "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");
  const [selectedApi, setSelectedApi] = useState<string>(session.model || openRouterModels[0]);

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
      const uniqueIdeas = Array.from(new Map(combinedIdeas.map(idea => [idea.title, idea])).values());
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

  const handleNextClick = async () => {
    if (!selectedIdea || !apiKey) return;
    // Store apiKey & model into session context (session-scoped)
    session.setApiKey(apiKey);
    session.setModel(selectedApi);

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

    onNext(selectedIdea, apiKey, selectedApi);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select a Viral Idea</h2>
          <Button variant="outline" size="sm" onClick={() => fetchIdeas(true)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
            ideas.map((idea) => (
              <Card
                key={idea.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
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
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Select your AI model and proceed to the next step.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="api-key">OpenRouter API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your OpenRouter API key"
                value={apiKey ?? ""}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="api-select" className="text-sm font-medium">AI Model</Label>
              <Select value={selectedApi} onValueChange={setSelectedApi}>
                <SelectTrigger id="api-select">
                  <SelectValue placeholder="Select an AI model" />
                </SelectTrigger>
                <SelectContent>
                  {openRouterModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" className="w-full" disabled={!selectedIdea || !apiKey} onClick={handleNextClick}>
              Step 2: Generate Hooks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}