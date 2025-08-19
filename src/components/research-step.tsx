"use client";

import { useState } from "react";
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

export function ResearchStep({ apiKey, model, onNext }: ResearchStepProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [customIdea, setCustomIdea] = useState<string>("");
  const [improving, setImproving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIdeas = async () => {
    setLoading(true);
    setError(null);
    setIdeas([]);
    setSelectedIdeaId(null);
    setCustomIdea("");
    try {
      const res = await fetch("/api/research", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch viral content");
        setIdeas([]);
      } else {
        const data = await res.json();
        setIdeas(data);
      }
    } catch {
      setError("Could not fetch viral content. Please try again later.");
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const improveCustomIdea = async () => {
    if (!customIdea.trim()) {
      toast.error("Please enter your custom idea first.");
      return;
    }
    setImproving(true);
    try {
      const promptForImprovement = `
You are an expert content strategist. Improve the following viral content idea to make it more engaging, clear, and compelling:

"${customIdea}"
`;
      const res = await fetch("/api/ai-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptForImprovement, apiKey, model }),
      });
      if (!res.ok) {
        toast.error("Failed to improve idea");
      } else {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].title) {
          setCustomIdea(data[0].title);
          setSelectedIdeaId("custom");
          toast.success("Idea improved!");
        } else {
          toast.error("Could not parse improved idea");
        }
      }
    } catch {
      toast.error("Failed to improve idea");
    } finally {
      setImproving(false);
    }
  };

  const handleGenerateHook = () => {
    let ideaToUse: ContentIdea | null = null;
    if (selectedIdeaId === "custom") {
      if (!customIdea.trim()) {
        toast.error("Please enter your custom idea.");
        return;
      }
      ideaToUse = {
        id: "custom",
        title: customIdea.trim(),
        snippet: customIdea.trim(),
        source: "Custom Idea",
        url: "",
      };
    } else if (selectedIdeaId) {
      ideaToUse = ideas.find((i) => i.id === selectedIdeaId) || null;
    }
    if (!ideaToUse) {
      toast.error("Please select a topic or enter a custom idea.");
      return;
    }
    onNext(ideaToUse);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Viral Content Ideas</h2>
          <div className="mb-4">
            <Button size="sm" onClick={fetchIdeas} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Researching...
                </>
              ) : (
                "Start Research"
              )}
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
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
            ideas.map((idea) => (
              <label
                key={idea.id}
                htmlFor={`idea-radio-${idea.id}`}
                className={cn(
                  "cursor-pointer rounded-md border p-4 block",
                  selectedIdeaId === idea.id
                    ? "border-primary ring-2 ring-primary bg-muted"
                    : "border-transparent hover:border-border"
                )}
              >
                <input
                  type="radio"
                  id={`idea-radio-${idea.id}`}
                  name="idea-selection"
                  className="sr-only"
                  checked={selectedIdeaId === idea.id}
                  onChange={() => setSelectedIdeaId(idea.id)}
                />
                <CardTitle className="text-lg">{idea.title}</CardTitle>
                <CardDescription className="flex items-center justify-between mb-2">
                  <span>Source: {idea.source}</span>
                  <a
                    href={idea.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    View Source <ExternalLink className="h-3 w-3" />
                  </a>
                </CardDescription>
                <p className="text-sm text-muted-foreground line-clamp-3">{idea.snippet}</p>
              </label>
            ))
          )}

          {/* Custom idea input */}
          <label
            htmlFor="idea-radio-custom"
            className={cn(
              "cursor-pointer rounded-md border p-4 block",
              selectedIdeaId === "custom"
                ? "border-primary ring-2 ring-primary bg-muted"
                : "border-transparent hover:border-border"
            )}
          >
            <input
              type="radio"
              id="idea-radio-custom"
              name="idea-selection"
              className="sr-only"
              checked={selectedIdeaId === "custom"}
              onChange={() => setSelectedIdeaId("custom")}
            />
            <CardTitle className="text-lg mb-2">Or enter your own idea</CardTitle>
            <div className="relative">
              <textarea
                rows={4}
                className="w-full rounded-md border border-border bg-background p-3 text-sm text-foreground resize-y pr-10"
                placeholder="Enter your custom viral content idea here..."
                value={customIdea}
                onChange={(e) => {
                  setCustomIdea(e.target.value);
                  setSelectedIdeaId("custom");
                }}
                onClick={() => setSelectedIdeaId("custom")}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  improveCustomIdea();
                }}
                disabled={improving || !customIdea.trim()}
                aria-label="Improve with AI"
              >
                {improving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Cpu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </label>
        </div>

        <div className="mt-4">
          <Button
            size="lg"
            className="w-full"
            disabled={
              !selectedIdeaId || (selectedIdeaId === "custom" && !customIdea.trim())
            }
            onClick={handleGenerateHook}
          >
            Generate Hook
          </Button>
        </div>
      </div>
    </div>
  );
}