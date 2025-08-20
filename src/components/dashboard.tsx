"use client";

import { useState, useEffect } from "react";
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
  const [step, setStep] = useState<AppStep>(session.openRouterApiKey ? "research" : "apiKey");
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [finalScript, setFinalScript] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any>(null);
  const [model, setModel] = useState(session.model || "mistralai/mistral-7b-instruct:free");

  // Load opened session from sessionStorage on mount
  useEffect(() => {
    const openSessionRaw = sessionStorage.getItem("reelwriter-open-session");
    if (openSessionRaw) {
      try {
        const openSession = JSON.parse(openSessionRaw);
        sessionStorage.removeItem("reelwriter-open-session");

        if (openSession.openRouterApiKey) {
          session.setOpenRouterApiKey(openSession.openRouterApiKey);
        }
        if (openSession.openAiApiKey) {
          session.setOpenAiApiKey(openSession.openAiApiKey);
        }
        if (openSession.googleGeminiApiKey) {
          session.setGoogleGeminiApiKey(openSession.googleGeminiApiKey);
        }
        if (openSession.anthropicApiKey) {
          session.setAnthropicApiKey(openSession.anthropicApiKey);
        }
        if (openSession.model) {
          setModel(openSession.model);
          session.setModel(openSession.model);
        }
        if (openSession.idea) {
          setSelectedIdea(openSession.idea);
        }
        if (openSession.selectedHook) {
          setSelectedHook(openSession.selectedHook);
        }
        if (openSession.script?.text) {
          setFinalScript(openSession.script.text);
        }
        if (openSession.captions) {
          setCaptions(openSession.captions);
        }

        // Determine step based on loaded data
        if (openSession.captions) {
          setStep("captions");
        } else if (openSession.script?.text) {
          setStep("script");
        } else if (openSession.selectedHook) {
          setStep("hooks");
        } else if (
          openSession.openRouterApiKey ||
          openSession.openAiApiKey ||
          openSession.googleGeminiApiKey ||
          openSession.anthropicApiKey
        ) {
          setStep("research");
        } else {
          setStep("apiKey");
        }
      } catch (err) {
        console.error("Failed to parse opened session:", err);
      }
    }
  }, [session]);

  // Updated handler signature to accept all keys and model
  const handleApiKeyValidated = (
    keys: {
      openRouterApiKey: string | null;
      openAiApiKey: string | null;
      googleGeminiApiKey: string | null;
      anthropicApiKey: string | null;
    },
    selectedModel: string
  ) => {
    session.setOpenRouterApiKey(keys.openRouterApiKey);
    session.setOpenAiApiKey(keys.openAiApiKey);
    session.setGoogleGeminiApiKey(keys.googleGeminiApiKey);
    session.setAnthropicApiKey(keys.anthropicApiKey);
    session.setModel(selectedModel);
    setModel(selectedModel);
    setStep("research");
  };

  const handleProceedToHooks = (idea: ContentIdea, apiKeyOverride?: string, selectedModel?: string) => {
    setSelectedIdea(idea);
    if (apiKeyOverride) session.setOpenRouterApiKey(apiKeyOverride);
    if (selectedModel) {
      setModel(selectedModel);
      session.setModel(selectedModel);
    }
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
    session.setOpenRouterApiKey(null);
    session.setOpenAiApiKey(null);
    session.setGoogleGeminiApiKey(null);
    session.setAnthropicApiKey(null);
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
        if (
          session.openRouterApiKey ||
          session.openAiApiKey ||
          session.googleGeminiApiKey ||
          session.anthropicApiKey
        ) {
          // Pass the correct API key based on model prefix
          let apiKey = "";
          if (model.startsWith("openai/")) apiKey = session.openAiApiKey ?? "";
          else if (model.startsWith("google/gemini")) apiKey = session.googleGeminiApiKey ?? "";
          else if (model.startsWith("anthropic/")) apiKey = session.anthropicApiKey ?? "";
          else apiKey = session.openRouterApiKey ?? "";

          return <ResearchStep apiKey={apiKey} model={model} onNext={handleProceedToHooks} />;
        }
        return <ApiKeyStep onValidated={handleApiKeyValidated} />;
      case "hooks":
        if (selectedIdea) {
          let apiKey = "";
          if (model.startsWith("openai/")) apiKey = session.openAiApiKey ?? "";
          else if (model.startsWith("google/gemini")) apiKey = session.googleGeminiApiKey ?? "";
          else if (model.startsWith("anthropic/")) apiKey = session.anthropicApiKey ?? "";
          else apiKey = session.openRouterApiKey ?? "";

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
        return <ResearchStep apiKey="" model={model} onNext={handleProceedToHooks} />;
      case "script":
        if (selectedIdea && selectedHook) {
          let apiKey = "";
          if (model.startsWith("openai/")) apiKey = session.openAiApiKey ?? "";
          else if (model.startsWith("google/gemini")) apiKey = session.googleGeminiApiKey ?? "";
          else if (model.startsWith("anthropic/")) apiKey = session.anthropicApiKey ?? "";
          else apiKey = session.openRouterApiKey ?? "";

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
        return <HookStep idea={selectedIdea!} apiKey="" model={model} onNext={handleProceedToScript} onBack={handleBackToResearch} />;
      case "captions":
        if (finalScript) {
          let apiKey = "";
          if (model.startsWith("openai/")) apiKey = session.openAiApiKey ?? "";
          else if (model.startsWith("google/gemini")) apiKey = session.googleGeminiApiKey ?? "";
          else if (model.startsWith("anthropic/")) apiKey = session.anthropicApiKey ?? "";
          else apiKey = session.openRouterApiKey ?? "";

          return <CaptionStep script={finalScript} apiKey={apiKey} model={model} onBack={handleBackToScript} />;
        }
        return <ScriptStep idea={selectedIdea!} hook={selectedHook!} apiKey="" model={model} onNext={handleProceedToCaptions} onBack={handleBackToHooks} />;
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
            {step === "apiKey" ? "Enter API Keys" : `Step ${["apiKey", "research", "hooks", "script", "captions"].indexOf(step)}: ${step.charAt(0).toUpperCase() + step.slice(1)}`}
          </h1>
        </div>
        {renderStep()}
      </main>
      <Toaster />
    </div>
  );
}