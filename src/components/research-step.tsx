"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, ExternalLink, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [filterTopic, setFilterTopic] = useState<string | null>(null);
  const [customIdea, setCustomIdea] = useState<string>("");
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topics = useMemo(() => extractTopics(ideas), [ideas]);

  // ... rest of component unchanged ...

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Viral Content Ideas</h2>
          <div className="mb-4 flex flex-wrap gap-3 items-center">
            <span className="font-medium mr-2">Filter by Topic:</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="filter-topic"
                value=""
                checked={filterTopic === null}
                onChange={() => setFilterTopic(null)}
                className="mr-2"
              />
              All
            </label>
            {topics.map((t: { word: string; count: number }) => (
              <label key={t.word} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="filter-topic"
                  value={t.word}
                  checked={filterTopic === t.word}
                  onChange={() => setFilterTopic(t.word)}
                  className="mr-2"
                />
                {t.word} <span className="ml-1 text-xs text-muted-foreground">({t.count})</span>
              </label>
            ))}
          </div>
          {/* ... rest of UI unchanged ... */}
        </div>
      </div>
    </div>
  );
}