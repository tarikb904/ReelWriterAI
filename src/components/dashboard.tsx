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
import HeaderBanner from "./header-banner";
import ThemeToggle from "./theme-toggle";
import { Sparkles } from "lucide-react";

type AppStep = "apiKey" | "research" | "hooks" | "script" | "captions";

export default function Dashboard() {
  const session = useSession();
  const [step, setStep] = useState<AppStep>(session.openRouterApiKey ? "research" : "apiKey");
  const [selectedIdea, setSelectedIdea] = useState<ContentIdea | null>(null);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [finalScript, setFinalScript] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any>(null);
  const [model, setModel] = useState(session.model || "mistralai/mistral-7b-instruct:free");

  const getActiveApiKey = () => {
    if (model.startsWith("openai/")) return session.openAiApiKey ?? "";
    if (model.startsWith("google/")) return session.googleGeminiApiKey ?? "";
    if (model.startsWith("anthropic/")) return session.anthropicApiKey ?? "";
    return session.openRouterApiKey ?? "";
  };

  const activeApiKey = getActiveApiKey();

  useEffect(() => {
    const openSessionRaw = sessionStorage.getItem("reelwriter-open-session");
    if (openSessionRaw) {
      try {
        const openSession = JSON.parse(openSessionRaw);
        sessionStorage.removeItem("reelwriter-open-session");

        if (openSession.openRouterApiKey) session.setOpenRouterApiKey(openSession.openRouterApiKey);
        if (openSession.openAiApiKey) session.setOpenAiApiKey(openSession.openAiApiKey);
        if (openSession.googleGeminiApiKey) session.setGoogleGeminiApiKey(openSession.googleGeminiApiKey);
        if (openSession.anthropicApiKey) session.setAnthropicApiKey(openSession.anthropicApiKey);
        if (openSession.model) {
          setModel(openSession.model);
          session.setModel(openSession.model);
        }
        if (openSession.idea) setSelectedIdea(openSession.idea);
        if (openSession.selectedHook) setSelectedHook(openSession.selectedHook);
        if (openSession.script?.text) setFinalScript(openSession.script.text);
        if (openSession.captions) setCaptions(openSession.captions);

        if (openSession.captions) setStep("captions");
        else if (openSession.script?.text) setStep("script");
        else if (openSession.selectedHook) setStep("hooks");
        else if (openSession.openRouterApiKey || openSession.openAiApiKey || openSession.googleGeminiApiKey || openSession.anthropicApiKey) setStep("research");
        else setStep("apiKey");
      } catch (err) {
        console.error("Failed to parse opened session:", err);
      }
    }
  }, [session]);

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

  const handleProceedToHooks = (idea: ContentIdea) => {
    setSelectedIdea(idea);
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
    // keep finalScript so the editor is not emptied
  };

  const titles: Record<AppStep, string> = {
    apiKey: "Enter API Keys",
    research: "Step 1: Research Viral Ideas",
    hooks: "Step 2: Generate Hooks",
    script: "Step 3: Write Script",
    captions: "Step 4: Captions & Titles",
  };

  const subtitles: Record<AppStep, string> = {
    apiKey: "Connect a model to begin",
    research: "Curate what’s trending and relevant",
    hooks: "Pick a winning opener",
    script: "Craft a compelling, high-retention script",
    captions: "Publish-ready, platform-optimized output",
  };

  function renderStep() {
    switch (step) {
      case "apiKey":
        return <ApiKeyStep onValidated={handleApiKeyValidated} />;
      case "research":
        return activeApiKey ? (
          <ResearchStep apiKey={activeApiKey} model={model} onNext={handleProceedToHooks} />
        ) : (
          <ApiKeyStep onValidated={handleApiKeyValidated} />
        );
      case "hooks":
        return selectedIdea && activeApiKey ? (
          <HookStep idea={selectedIdea} apiKey={activeApiKey} model={model} onNext={handleProceedToScript} onBack={handleBackToResearch} />
        ) : (
          <ResearchStep apiKey={activeApiKey} model={model} onNext={handleProceedToHooks} />
        );
      case "script":
        return selectedIdea && selectedHook && activeApiKey ? (
          <ScriptStep
            idea={selectedIdea}
            hook={selectedHook}
            apiKey={activeApiKey}
            model={model}
            initialScript={finalScript}
            onNext={handleProceedToCaptions}
            onBack={handleBackToHooks}
          />
        ) : null;
      case "captions":
        return finalScript && activeApiKey ? (
          <CaptionStep
            script={finalScript}
            apiKey={activeApiKey}
            model={model}
            initialCaptions={captions}
            onBack={handleBackToScript}
          />
        ) : null;
      default:
        return <ApiKeyStep onValidated={handleApiKeyValidated} />;
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:ml-28 md:gap-8 md:p-8">
        <HeaderBanner
          title={titles[step]}
          subtitle={subtitles[step]}
          icon={<Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />}
          right={<ThemeToggle />}
        />
        {renderStep()}
      </main>
      <Toaster />
    </div>
  );
}