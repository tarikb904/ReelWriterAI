"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useSession } from "@/context/session-context";
import { getSession, saveSession, type StoredSession } from "@/lib/storage";

interface ContentIdea {
  id: string;
  title: string;
  snippet: string;
  source: string;
  url: string;
}

interface ScriptStepProps {
  idea: ContentIdea;
  hook: string;
  apiKey: string;
  model: string;
  onNext: (script: string) => void;
  onBack: () => void;
}

export function ScriptStep({ idea, hook, apiKey, model, onNext, onBack }: ScriptStepProps) {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const session = useSession();

  const persistScript = async (text: string) => {
    if (!session.sessionMeta) return;
    try {
      const existing = await getSession(session.sessionMeta.sessionId);
      const updated: StoredSession = {
        sessionId: session.sessionMeta.sessionId,
        createdAt: existing?.createdAt ?? session.sessionMeta.createdAt,
        expiresAt: existing?.expiresAt ?? session.sessionMeta.expiresAt,
        ...(existing || {}),
        script: { text, edited: true, lastEdited: Date.now() },
      };
      await saveSession(updated);
    } catch (err) {
      console.error("Failed to save script:", err);
    }
  };

  const generateScript = async () => {
    setLoading(true);
    setScript("");
    toast.info("Writing your video script now...", { duration: 3000 });

    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, hook, apiKey, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate script.");
      }

      const data = await response.json();
      setScript(data.script);
      await persistScript(data.script);
      toast.success("Your script is ready!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while generating the script.");
    } finally {
      setLoading(false);
    }
  };

  // Automatically generate script on component mount
  useState(() => {
    generateScript();
  });

  const handleNextClick = () => {
    if (script) {
      onNext(script);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Edit Your Script</h2>
          <Button variant="outline" size="sm" onClick={generateScript} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
        {loading ? (
          <Skeleton className="w-full h-[70vh] rounded-lg" />
        ) : (
          <Textarea
            value={script}
            onChange={(e) => setScript(e.target.value)}
            onBlur={() => persistScript(script)}
            className="w-full h-[70vh] text-base"
            placeholder="Your generated script will appear here..."
          />
        )}
      </div>
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Your Foundation</CardTitle>
            <CardDescription>This is the idea and hook you're building on.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold text-md mb-1">Selected Idea:</h3>
              <p className="text-sm text-muted-foreground mb-3">{idea.title}</p>
              <h3 className="font-semibold text-md mb-1">Selected Hook:</h3>
              <p className="text-sm text-muted-foreground">{hook}</p>
            </div>
            <Button size="lg" className="w-full" disabled={!script} onClick={() => { persistScript(script); handleNextClick(); }}>
              Step 4: Generate Captions
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={onBack}>
              Back to Hooks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}