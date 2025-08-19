"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { ApiKeyStep } from "./api-key-step";
import { ResearchStep, type ContentIdea } from "./research-step";
import { HookStep } from "./hook-step";
import { ScriptStep } from "./script-step";
import { CaptionStep } from "./caption-step";
import { Toaster } from "@/components/ui/sonner";
import { useSession } from "@/context/session-context";

type AppStep = "apiKey" | "research" | "hooks" | "script" | "captions";

export default function Dashboard() {
  const session = useSession();
  const [step, setStep] = useState<AppStep>(session.apiKey ? "research" : "apiKey");
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [finalScript, setFinalScript] = useState<string | null>(null);
  const [model, setModel] = useState(session.model || "mistralai/mistral-7b-instruct:free");

  const handleApiKeyValidated = (key: string) => {
    session.setApiKey(key);
    setStep("research");
  };

  const handleProceedToHooks = (
    idea: ContentIdea,
    apiKeyOverride?: string,
    selectedModel?: string
  ) => {
    setSelectedIdea(idea);
    if (apiKeyOverride) session.setApiKey(apiKeyOverride);
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
    session.setApiKey(null);
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
        if (session.apiKey) {
          return <ResearchStep apiKey={session.apiKey} model={model} onNext={handleProceedToHooks} />;
        }
        return <ApiKeyStep onValidated={handleApiKeyValidated} />;
      case "hooks":
        if (selectedIdea && session.apiKey) {
          return (
            <HookStep
              idea={selectedIdea}
              apiKey={session.apiKey}
              model={model}
              onNext={handleProceedToScript}
              onBack={handleBackToResearch}
            />
          );
        }
        return <ResearchStep apiKey={session.apiKey ?? ""} model={model} onNext={handleProceedToHooks} />;
      case "script":
        if (selectedIdea && selectedHook && session.apiKey) {
          return (
            <ScriptStep
              idea={selectedIdea}
              hook={selectedHook}
              apiKey={session.apiKey}
              model={model}
              onNext={handleProceedToCaptions}
              onBack={handleBackToHooks}
            />
          );
        }
        return <HookStep idea={selectedIdea!} apiKey={session.apiKey ?? ""} model={model} onNext={handleProceedToScript} onBack={handleBackToResearch} />;
      case "captions":
        if (finalScript && session.apiKey) {
          return <CaptionStep script={finalScript} apiKey={session.apiKey} model={model} onBack={handleBackToScript} />;
        }
        return <ScriptStep idea={selectedIdea!} hook={selectedHook!} apiKey={session.apiKey ?? ""} model={model} onNext={handleProceedToCaptions} onBack={handleBackToHooks} />;
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