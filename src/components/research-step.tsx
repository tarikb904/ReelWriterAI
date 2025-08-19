"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Fixes errors 1,2,3

export interface ContentIdea {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url: string;
}

interface ResearchStepProps {
  apiKey: string;
  model: string;
  onNext: (idea: ContentIdea) => void;
}

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

export function ResearchStep({ apiKey, model, onNext }: ResearchStepProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>(`
You are an expert content researcher specializing in the "Make Money Online" and "Business Operations" niches. Your task is to generate a list of 20 viral content ideas that are currently trending or highly engaging.

Each idea should include:
- A concise, catchy title.
- A brief snippet or summary (max 150 characters).
- The source or platform where this idea is trending (e.g., Reddit, Hacker News, Blogs).
- A URL to the original content or a relevant link.

Format the output as a JSON array of objects with keys: id, title, snippet, source, url.

Begin generating the ideas now.
`);
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = async () => {
    setLoading(true);
    setSelectedIdea(null);
    setError(null);
    try {
      const res = await fetch("/api/ai-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey, model }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch viral content");
        setIdeas([]);
      } else {
        const data = await res.json();
        setIdeas(data);
      }
    } catch (err) {
      setError("Could not fetch viral content. Please try again later.");
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const improvePrompt = async () => {
    setImproving(true);
    try {
      const res = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, apiKey, model }),
      });
      if (!res.ok) {
        toast.error("Failed to improve prompt"); // error 1 fixed by import
      } else {
        const data = await res.json();
        if (data.improvedPrompt) {
          setPrompt(data.improvedPrompt);
          toast.success("Prompt improved!"); // error 2 fixed by import
        }
      }
    } catch {
      toast.error("Failed to improve prompt"); // error 3 fixed by import
    } finally {
      setImproving(false);
    }
  };

  const topics = useMemo(() => extractTopics(ideas), [ideas]);

  const filteredIdeas = useMemo(() => {
    if (!filterTopic) return ideas;
    const t = filterTopic.toLowerCase();
    return ideas.filter((i) => (i.title + " " + i.snippet).toLowerCase().includes(t));
  }, [ideas, filterTopic]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-muted-foreground mb-1">
            Research Prompt (editable)
          </label>
          <textarea
            id="prompt"
            rows={8}
            className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground resize-y"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="flex justify-end mt-2 gap-2">
            <Button size="sm" onClick={improvePrompt} disabled={improving}>
              {improving ? "Improving..." : "Improve Prompt"}
            </Button>
            <Button size="sm" variant="default" onClick={fetchIdeas} disabled={loading}> {/* error 4 fixed: variant 'default' */}
              {loading ? "Researching..." : "Start Research"}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Viral Content Ideas</h2>

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
                    filterTopic === t.word ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {t.word} <span className="ml-2 text-xs text-muted-foreground">({t.count})</span>
                </button>
              ))}
              {topics.length === 0 && <span className="text-sm text-muted-foreground">No clear topics yet</span>}
            </div>
          </div>

          <div className="grid gap-4 max-h-[60vh] overflow-y-auto pr-4">
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
                    <p className="text-sm text-muted-foreground line-clamp-3">{idea.snippet}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}