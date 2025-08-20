"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useSession } from "@/context/session-context";
import { createOrUpdateSession } from "@/lib/storage";
import { saveHistoryEntry } from "@/lib/history";

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
  initialScript?: string | null;
}

function cleanScriptText(text: string): string {
  let t = text;

  // Remove common headings/labels
  t = t.replace(/^\s*\[(?:hook|introduction|intro|point|cta|outro)[^\]]*\]\s*$/gim, "");
  t = t.replace(/^\s*(hook|intro(?:duction)?|section|point|cta|outro)\s*[:\-].*$/gim, "");

  // Remove timestamps like 0:00–0:05 or 00:00 - 00:05 anywhere in a line
  t = t.replace(/\b\d{1,2}:\d{2}\s*(?:[–-]|to)\s*\d{1,2}:\d{2}\b/g, "");
  // Remove single timestamps at start like 0:05:
  t = t.replace(/^\s*\d{1,2}:\d{2}\s*[:\-]\s*/gim, "");

  // Remove stage directions and on-screen notes
  t = t.replace(/^\s*(on[- ]screen\s*text|b[- ]?roll|music|sfx|cut\s*to|camera|lower third|graphic|overlay)\s*[:\-].*$/gim, "");
  // Remove bracketed or parenthetical directions inside lines
  t = t.replace(/\((?:[^)]{0,120})\)/g, (m) => (m.length <= 6 ? m : "")); // keep tiny emotive parentheses like (ok) else drop
  t = t.replace(/\[(?:[^\]]{0,120})\]/g, "");

  // Remove leftover double spaces and excessive punctuation spacing
  t = t.replace(/[ \t]{2,}/g, " ");

  // Normalize newlines: remove empty lines that are just artifacts
  const lines = t.split("\n")
    .map(l => l.replace(/\s+/g, " ").trim())
    .filter(l => l.length > 0);

  // Return as teleprompter-friendly: one sentence per line if possible
  const joined = lines.join(" ");
  const sentences = joined
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  return sentences.join("\n").trim();
}

export function ScriptStep({ idea, hook, apiKey, model, onNext, onBack, initialScript }: ScriptStepProps) {
  const [script, setScript] = useState(initialScript || "");
  const [loading, setLoading] = useState(false);
  const session = useSession();
  const didInit = useRef(false);

  const persistScript = async (text: string) => {
    await saveHistoryEntry({
      type: "script",
      ideaTitle: idea.title,
      ideaSnippet: idea.snippet,
      source: idea.source,
      url: idea.url,
      hook,
      scriptText: text,
    });

    if (!session.sessionMeta) return;
    try {
      await createOrUpdateSession({
        sessionId: session.sessionMeta.sessionId,
        idea,
        selectedHook: hook,
        script: { text, edited: true, lastEdited: Date.now() },
      });
    } catch (err) {
      console.error("Failed to save script to session:", err);
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
      const cleaned = cleanScriptText(data.script);
      setScript(cleaned);
      await persistScript(cleaned);
      toast.success("Your script is ready!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while generating the script.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (!initialScript) {
      generateScript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNextClick = () => {
    if (script) onNext(script);
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