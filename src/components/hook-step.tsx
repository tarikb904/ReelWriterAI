"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { RefreshCw, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/context/session-context";
import { getSession, saveSession, type StoredSession } from "@/lib/storage";

interface ContentIdea {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url: string;
}

interface HookStepProps {
  idea: ContentIdea;
  apiKey: string;
  model: string;
  onNext: (hook: string) => void;
  onBack: () => void;
}

export function HookStep({ idea, apiKey, model, onNext, onBack }: HookStepProps) {
  const [hooks, setHooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const session = useSession();
  const didInit = useRef(false);

  const generateHooks = async () => {
    setLoading(true);
    setSelectedHook(null);
    setHooks([]);
    toast.info("Generating fresh hooks for you...", { duration: 2000 });

    try {
      const response = await fetch("/api/generate-hooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, apiKey, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate hooks.");
      }

      const data = await response.json();
      setHooks(data.hooks);
      toast.success("10 new hooks have been generated!");

      if (session.sessionMeta) {
        try {
          const existing = await getSession(session.sessionMeta.sessionId);
          const updated: StoredSession = {
            sessionId: session.sessionMeta.sessionId,
            createdAt: existing?.createdAt ?? session.sessionMeta.createdAt,
            expiresAt: existing?.expiresAt ?? session.sessionMeta.expiresAt,
            ...(existing || {}),
            hooks: data.hooks,
          };
          await saveSession(updated);
        } catch (err) {
          console.error("Failed to save hooks to session:", err);
        }
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while generating hooks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (hooks.length === 0) generateHooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextClick = async () => {
    if (!selectedHook) return;
    if (session.sessionMeta) {
      try {
        const existing = await getSession(session.sessionMeta.sessionId);
        const updated: StoredSession = {
          sessionId: session.sessionMeta.sessionId,
          createdAt: existing?.createdAt ?? session.sessionMeta.createdAt,
          expiresAt: existing?.expiresAt ?? session.sessionMeta.expiresAt,
          ...(existing || {}),
          selectedHook,
        };
        await saveSession(updated);
      } catch (err) {
        console.error("Failed to save selected hook:", err);
      }
    }

    onNext(selectedHook);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Select a Winning Hook</h2>
          <Button variant="outline" size="sm" onClick={generateHooks} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
        <div className="grid gap-4 max-h-[70vh] overflow-y-auto pr-4">
          {loading && hooks.length === 0 ? (
            Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))
          ) : (
            hooks.map((hook, index) => (
              <Card
                key={index}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary flex items-center p-4",
                  selectedHook === hook && "border-primary ring-2 ring-primary"
                )}
                onClick={() => setSelectedHook(hook)}
              >
                <Wand2 className="h-5 w-5 mr-4 text-primary" />
                <p className="text-md font-medium">{hook}</p>
              </Card>
            ))
          )}
        </div>
      </div>
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Your Selected Idea</CardTitle>
            <CardDescription>This is the idea you're generating hooks for.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold text-md mb-2">{idea.title}</h3>
              <p className="text-sm text-muted-foreground">{idea.snippet}</p>
            </div>
            <Button size="lg" className="w-full" disabled={!selectedHook} onClick={handleNextClick}>
              Step 3: Generate Script
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={onBack}>
              Back to Research
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}