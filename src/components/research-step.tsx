"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
import { improveIdea, researchTopics } from "@/app/actions";
import { toast } from "sonner";

interface ResearchStepProps {
  apiKey: string;
  onResearchComplete: (idea: string) => void;
}

interface ResearchResult {
  title: string;
  description: string;
}

const topics = [
  "Technology",
  "Health & Wellness",
  "Finance & Investing",
  "Education",
  "Travel",
];

export function ResearchStep({
  apiKey,
  onResearchComplete,
}: ResearchStepProps) {
  const [researchTopic, setResearchTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [researching, setResearching] = useState(false);
  const [researchResults, setResearchResults] = useState<ResearchResult[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string>("");
  const [customIdea, setCustomIdea] = useState("");
  const [improving, setImproving] = useState(false);

  const handleResearch = async () => {
    const topic = researchTopic === "Other" ? customTopic : researchTopic;
    if (!topic) {
      toast.error("Please select or enter a topic.");
      return;
    }
    setResearching(true);
    setResearchResults([]);
    setSelectedIdea("");
    try {
      const results = await researchTopics(topic, apiKey);
      setResearchResults(results);
    } catch (error) {
      toast.error("Failed to fetch research topics. Please try again.");
      console.error(error);
    } finally {
      setResearching(false);
    }
  };

  const improveCustomIdea = async () => {
    if (!customIdea) {
      toast.error("Please enter an idea to improve.");
      return;
    }
    setImproving(true);
    try {
      const improvedContent = await improveIdea(customIdea, apiKey);
      setCustomIdea(improvedContent);
      toast.success("Your idea has been improved!");
    } catch (error) {
      toast.error("Failed to improve idea. Please try again.");
      console.error(error);
    } finally {
      setImproving(false);
    }
  };

  const handleGenerateHook = () => {
    if (!selectedIdea) {
      toast.error("Please select an idea to generate a hook.");
      return;
    }

    let ideaToUse = "";
    if (selectedIdea === "custom") {
      ideaToUse = customIdea;
    } else if (selectedIdea.startsWith("topic-")) {
      const index = parseInt(selectedIdea.split("-")[1], 10);
      if (researchResults[index]) {
        ideaToUse = researchResults[index].title;
      }
    }

    if (!ideaToUse) {
      toast.error(
        "Please select or write an idea before generating a hook."
      );
      return;
    }
    onResearchComplete(ideaToUse);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Research Your Topic</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Select a topic to get AI-powered ideas.</p>
          <RadioGroup
            value={researchTopic}
            onValueChange={setResearchTopic}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {topics.map((topic) => (
              <div key={topic}>
                <RadioGroupItem
                  value={topic}
                  id={topic}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={topic}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  {topic}
                </Label>
              </div>
            ))}
            <div>
              <RadioGroupItem
                value="Other"
                id="other"
                className="peer sr-only"
              />
              <Label
                htmlFor="other"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                Other
              </Label>
            </div>
          </RadioGroup>
          {researchTopic === "Other" && (
            <Input
              placeholder="Enter your topic"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
          )}
          <Button onClick={handleResearch} disabled={researching}>
            {researching && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Research
          </Button>
        </CardContent>
      </Card>

      {researching && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Researching ideas...</p>
        </div>
      )}

      {researchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Choose an Idea</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedIdea}
              onValueChange={setSelectedIdea}
              className="space-y-2"
            >
              {researchResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-md border border-transparent hover:border-primary/50 transition-colors"
                >
                  <RadioGroupItem
                    value={`topic-${index}`}
                    id={`topic-${index}`}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={`topic-${index}`}
                    className="flex flex-col cursor-pointer w-full"
                  >
                    <span className="font-bold">{result.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {result.description}
                    </span>
                  </Label>
                </div>
              ))}
              <div className="flex items-start space-x-3 p-3 rounded-md border border-transparent hover:border-primary/50 transition-colors">
                <RadioGroupItem
                  value="custom"
                  id="idea-custom"
                  className="mt-1"
                />
                <div className="grid w-full gap-2">
                  <Label
                    htmlFor="idea-custom"
                    className="cursor-pointer font-bold"
                  >
                    Or write your own idea here...
                  </Label>
                  <div className="relative">
                    <Textarea
                      placeholder="Be specific about the topic and angle..."
                      value={customIdea}
                      onClick={() => setSelectedIdea("custom")}
                      onChange={(e) => {
                        setCustomIdea(e.target.value);
                        setSelectedIdea("custom");
                      }}
                      className="w-full pr-10"
                      rows={3}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute top-1 right-1 h-8 w-8"
                      onClick={improveCustomIdea}
                      disabled={improving || !customIdea}
                      aria-label="Improve with AI"
                    >
                      {improving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </RadioGroup>
            <Button
              onClick={handleGenerateHook}
              disabled={!selectedIdea}
              className="mt-4"
            >
              Generate Hook
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}