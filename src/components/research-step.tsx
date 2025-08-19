"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContentIdea {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url: string;
}

interface ResearchStepProps {
  onNext: (idea: ContentIdea, apiKey?: string, model?: string) => void;
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

export function ResearchStep({ onNext }: ResearchStepProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);

  const fetchIdeas = async () => {
    setLoading(true);
    setSelectedIdea(null);
    try {
      const res = await fetch("/api/research");
      if (!res.ok) throw new Error("Failed to fetch viral content");
      const data = await res.json();
      setIdeas(data);
    } catch (err) {
      console.error(err);
      alert("Could not fetch viral content. Please try again later.");
    } finally {
      setLoading(false);
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
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Viral Content Ideas</h2>
          <Button variant="default" size="sm" onClick={fetchIdeas} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Start Research
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
                  filterTopic === t.word ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted/80"
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
                  <p className="text-sm text-muted-foreground line-clamp-3">{idea.snippet}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}