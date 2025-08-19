"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { ApiKeyStep } from "./api-key-step";
import { ResearchStep, type ContentIdea } from "./research-step";
import { HookStep } from "./hook-step";
import { ScriptStep } from "./script-step";
import { CaptionStep } from "./caption-step";
import { Toaster } from "@/components/ui/sonner";

type AppStep = "apiKey" | "research" | "hooks" | "script" | "captions";

export default function Dashboard() {
  const [step, setStep] = useState<AppStep>("apiKey");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [finalScript, setFinalScript] = useState<string | null>(null);
  const [model, setModel] = useState("mistralai/mistral-7b-instruct:free");

  const handleApiKeyValidated = (key: string) => {
    setApiKey(key);
    setStep("research");
  };

  const handleProceedToHooks = (
    idea: ContentIdea,
    apiKeyOverride?: string,
    selectedModel?: string
  ) => {
    setSelectedIdea(idea);
    if (apiKeyOverride) setApiKey(apiKeyOverride);
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

  const handleBackToApiKey = () => {
    setStep("apiKey");
    setApiKey(null);
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
      case "apiKey":
        return <ApiKeyStep onValidated={handleApiKeyValidated} />;
      case "research":
        if (apiKey) {
          return <ResearchStep apiKey={apiKey} onNext={handleProceedToHooks} />;
        }
        return <ApiKeyStep onValidated={handleApiKeyValidated} />;
      case "hooks":
        if (selectedIdea && apiKey) {
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
        return <ResearchStep apiKey={apiKey ?? ""} onNext={handleProceedToHooks} />;
      case "script":
        if (selectedIdea && selectedHook && apiKey) {
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
        return <HookStep idea={selectedIdea!} apiKey={apiKey ?? ""} model={model} onNext={handleProceedToScript} onBack={handleBackToResearch} />;
      case "captions":
        if (finalScript && apiKey) {
          return <CaptionStep script={finalScript} apiKey={apiKey} model={model} onBack={handleBackToScript} />;
        }
        return <ScriptStep idea={selectedIdea!} hook={selectedHook!} apiKey={apiKey ?? ""} model={model} onNext={handleProceedToCaptions} onBack={handleBackToHooks} />;
      default:
        return <ApiKeyStep onValidated={handleApiKeyValidated} />;
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 md:p-8 md:pl-24">
        <div className="flex items-center">
          <h1 className="text-3xl font-semibold">
            {step === "apiKey" ? "Enter OpenRouter API Key" : `Step ${["apiKey", "research", "hooks", "script", "captions"].indexOf(step)}: ${step.charAt(0).toUpperCase() + step.slice(1)}`}
          </h1>
        </div>
        {renderStep()}
      </main>
      <Toaster />
    </div>
  );
}