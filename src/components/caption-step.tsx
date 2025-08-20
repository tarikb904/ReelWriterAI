"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Instagram, Linkedin, Youtube, RefreshCw } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useSession } from "@/context/session-context";
import { createOrUpdateSession } from "@/lib/storage";
import { saveHistoryEntry } from "@/lib/history";

interface CaptionStepProps {
  script: string;
  apiKey: string;
  model: string;
  onBack: () => void;
}

interface Captions {
  instagram: string;
  linkedin: string;
  youtubeTitles: string[];
}

export function CaptionStep({ script, apiKey, model, onBack }: CaptionStepProps) {
  const [captions, setCaptions] = useState<Captions | null>(null);
  const [loading, setLoading] = useState(false);
  const session = useSession();

  const persistCaptions = async (caps: Captions) => {
    // Save to standalone history
    await saveHistoryEntry({
      type: "captions",
      scriptText: script,
      captions: {
        instagram: caps.instagram,
        linkedin: caps.linkedin,
        youtubeTitles: caps.youtubeTitles,
      },
    });

    // Legacy session persistence (best-effort)
    if (!session.sessionMeta) return;
    try {
      await createOrUpdateSession({
        sessionId: session.sessionMeta.sessionId,
        captions: caps,
      });
    } catch (err) {
      console.error("Failed to save captions:", err);
    }
  };

  const generateCaptions = async () => {
    setLoading(true);
    setCaptions(null);
    toast.info("Generating your social media captions...", { duration: 3000 });

    try {
      const response = await fetch("/api/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, apiKey, model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate captions.");
      }

      const data = await response.json();
      const normalized: Captions = {
        instagram: data.instagram || "",
        linkedin: data.linkedin || "",
        youtubeTitles: Array.isArray(data.youtubeTitles) ? data.youtubeTitles : [],
      };
      setCaptions(normalized);
      await persistCaptions(normalized);
      toast.success("Your captions are ready!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while generating captions.");
    } finally {
      setLoading(false);
    }
  };

  // Automatically generate captions on component mount
  useState(() => {
    generateCaptions();
  });

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Generated Captions</h2>
          <Button variant="outline" size="sm" onClick={generateCaptions} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          {loading ? (
            <>
              <Skeleton className="w-full h-48 rounded-lg" />
              <Skeleton className="w-full h-40 rounded-lg" />
              <Skeleton className="w-full h-56 rounded-lg" />
            </>
          ) : (
            captions && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Instagram className="h-5 w-5 text-pink-500" /> Instagram / Facebook</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground">{captions.instagram}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => handleCopy(captions.instagram, "Instagram caption")}>
                      Copy
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Linkedin className="h-5 w-5 text-blue-500" /> LinkedIn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-muted-foreground">{captions.linkedin}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => handleCopy(captions.linkedin, "LinkedIn caption")}>
                      Copy
                    </Button>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Youtube className="h-5 w-5 text-red-500" /> YouTube Titles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                      {captions.youtubeTitles.map((title, i) => <li key={i}>{title}</li>)}
                    </ul>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => handleCopy(captions.youtubeTitles.join('\n'), "YouTube titles")}>
                      Copy All
                    </Button>
                  </CardContent>
                </Card>
              </>
            )
          )}
        </div>
      </div>
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Final Script</CardTitle>
            <CardDescription>The captions were generated from this script.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea value={script} readOnly className="h-48 text-sm bg-muted/50" />
            <Button size="lg" variant="outline" className="w-full mt-4" onClick={onBack}>
              Back to Script
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}