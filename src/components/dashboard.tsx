"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { ResearchStep, type ContentIdea } from "./research-step";
import { HookStep } from "./hook-step";
import { ScriptStep } from "./script-step";
import { CaptionStep } from "./caption-step";
import { Toaster } from "@/components/ui/sonner";

type AppStep = "research" | "hooks" | "script" | "captions";

export default function Dashboard() {
  const [step, setStep] = useState<AppStep>("research");
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [finalScript, setFinalScript] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("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");
  const [model, setModel] = useState("mistralai/mistral-7b-instruct:free");

  const handleProceedToHooks = (
    idea: ContentIdea,
    apiKey?: string,
    selectedModel?: string
  ) => {
    setSelectedIdea(idea);
    if (apiKey) setApiKey(apiKey);
    if (selectedModel) setModel(selectedModel);
    setStep("hooks");
  };

  const handleProceedToScript = (hook: string) => {
    setSelectedHook(hook);
    setStep("script");
  };

  const handleProceedToCaptions = (script: string) => {
    setFinalScript(script);
    setStep("captions");
  };

  const handleBackToResearch = () => {
    setStep("research");
    setSelectedIdea(null);
  };

  const handleBackToHooks = () => {
    setStep("hooks");
    setSelectedHook(null);
  };

  const handleBackToScript = () => {
    setStep("script");
    setFinalScript(null);
  };

  const renderStep = () => {
    switch (step) {
      case "captions":
        if (finalScript) {
          return (
            <CaptionStep
              script={finalScript}
              apiKey={apiKey}
              model={model}
              onBack={handleBackToScript}
            />
          );
        }
      case "script":
        if (selectedIdea && selectedHook) {
          return (
            <ScriptStep
              idea={selectedIdea}
              hook={selectedHook}
              apiKey={apiKey}
              model={model}
              onNext={handleProceedToCaptions}
              onBack={handleBackToHooks}
            />
          );
        }
      case "hooks":
        if (selectedIdea) {
          return (
            <HookStep
              idea={selectedIdea}
              apiKey={apiKey}
              model={model}
              onNext={handleProceedToScript}
              onBack={handleBackToResearch}
            />
          );
        }
      case "research":
      default:
        return <ResearchStep onNext={handleProceedToHooks} />;
    }
  };

  const getTitleForStep = (currentStep: AppStep) => {
    switch (currentStep) {
      case "research":
        return "Step 1: Viral Content Research";
      case "hooks":
        return "Step 2: Hook Generation";
      case "script":
        return "Step 3: Script Writing";
      case "captions":
        return "Step 4: Caption Generation";
      default:
        return "ReelWriterAI";
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 md:pl-24">
        <div className="flex items-center">
          <h1 className="text-3xl font-semibold">{getTitleForStep(step)}</h1>
        </div>
        {renderStep()}
      </main>
      <Toaster />
    </div>
  );
}