"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";

interface ApiKeyStepProps {
  onValidated: (keys: {
    openRouterApiKey: string | null;
    openAiApiKey: string | null;
    googleGeminiApiKey: string | null;
    anthropicApiKey: string | null;
  }, model: string, activeKeyType: string) => void;
}

type ModelItem = { id: string; label: string };

const FALLBACKS: Record<string, ModelItem[]> = {
  openRouterApiKey: [
    { id: "mistralai/mistral-7b-instruct:free", label: "OpenRouter: Mistral 7B Instruct (free)" },
    { id: "z-ai/glm-4.5-air", label: "OpenRouter: GLM 4.5 Air (free)" },
  ],
  openAiApiKey: [
    { id: "openai/gpt-5", label: "OpenAI: gpt-5" },
    { id: "openai/gpt-4o", label: "OpenAI: gpt-4o" },
    { id: "openai/gpt-4o-mini", label: "OpenAI: gpt-4o-mini" },
  ],
  googleGeminiApiKey: [
    { id: "google/gemini-1.5-pro", label: "Google: Gemini 1.5 Pro" },
    { id: "google/gemini-1.5-flash", label: "Google: Gemini 1.5 Flash" },
  ],
  anthropicApiKey: [
    { id: "anthropic/claude-3-sonnet", label: "Anthropic: Claude 3 Sonnet" },
    { id: "anthropic/claude-3-haiku", label: "Anthropic: Claude 3 Haiku" },
  ],
};

export function ApiKeyStep({ onValidated }: ApiKeyStepProps) {
  const session = useSession();

  const [openRouterApiKey, setOpenRouterApiKey] = useState(session.openRouterApiKey ?? "");
  const [openAiApiKey, setOpenAiApiKey] = useState(session.openAiApiKey ?? "");
  const [googleGeminiApiKey, setGoogleGeminiApiKey] = useState(session.googleGeminiApiKey ?? "");
  const [anthropicApiKey, setAnthropicApiKey] = useState(session.anthropicApiKey ?? "");

  const initialKeyType = (() => {
    if (session.model?.startsWith("openai/")) return "openAiApiKey";
    if (session.model?.startsWith("google/")) return "googleGeminiApiKey";
    if (session.model?.startsWith("anthropic/")) return "anthropicApiKey";
    return "openRouterApiKey";
  })();

  const [activeKeyType, setActiveKeyType] = useState<string>(initialKeyType);

  const [availableModels, setAvailableModels] = useState<ModelItem[]>(FALLBACKS[activeKeyType]);
  const [modelsLoading, setModelsLoading] = useState(false);

  const [model, setModel] = useState<string>(() => {
    const all = FALLBACKS[activeKeyType];
    if (session.model && all.some((m) => m.id === session.model)) return session.model;
    return all[0]?.id ?? "";
  });

  const fetchModels = async (keyType: string) => {
    const provider = keyType === "openAiApiKey"
      ? "openai"
      : keyType === "googleGeminiApiKey"
        ? "google"
        : keyType === "anthropicApiKey"
          ? "anthropic"
          : "openrouter";

    const key = keyType === "openAiApiKey"
      ? openAiApiKey
      : keyType === "googleGeminiApiKey"
        ? googleGeminiApiKey
        : keyType === "anthropicApiKey"
          ? anthropicApiKey
          : openRouterApiKey;

    setModelsLoading(true);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey: key || undefined }),
      });
      const data = await res.json();
      const list: ModelItem[] = Array.isArray(data.models) ? data.models : [];
      if (list.length) {
        setAvailableModels(list);
        setModel((prev) => list.some((m) => m.id === prev) ? prev : list[0].id);
      } else {
        setAvailableModels(FALLBACKS[keyType] || []);
        setModel((FALLBACKS[keyType] || [])[0]?.id ?? "");
      }
    } catch (e) {
      setAvailableModels(FALLBACKS[keyType] || []);
      setModel((FALLBACKS[keyType] || [])[0]?.id ?? "");
    } finally {
      setModelsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels(activeKeyType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKeyType]);

  const onActiveKeyTypeChange = (keyType: string) => {
    setActiveKeyType(keyType);
  };

  const validateKey = async () => {
    let keyToValidate: string | null = null;
    switch (activeKeyType) {
      case "openAiApiKey":
        keyToValidate = openAiApiKey;
        break;
      case "googleGeminiApiKey":
        keyToValidate = googleGeminiApiKey;
        break;
      case "anthropicApiKey":
        keyToValidate = anthropicApiKey;
        break;
      default:
        keyToValidate = openRouterApiKey;
    }

    if (!keyToValidate) {
      toast.error("Please enter the API key for the selected model provider.");
      return;
    }

    try {
      await fetchModels(activeKeyType);
      session.setOpenRouterApiKey(openRouterApiKey || null);
      session.setOpenAiApiKey(openAiApiKey || null);
      session.setGoogleGeminiApiKey(googleGeminiApiKey || null);
      session.setAnthropicApiKey(anthropicApiKey || null);
      session.setModel(model);
      toast.success("API key validated!");
      onValidated(
        {
          openRouterApiKey: openRouterApiKey || null,
          openAiApiKey: openAiApiKey || null,
          googleGeminiApiKey: googleGeminiApiKey || null,
          anthropicApiKey: anthropicApiKey || null,
        },
        model,
        activeKeyType
      );
    } catch {
      toast.error("Validation failed. Please check your API key.");
    }
  };

  const isValidateDisabled = () => {
    switch (activeKeyType) {
      case "openAiApiKey":
        return !openAiApiKey.trim();
      case "googleGeminiApiKey":
        return !googleGeminiApiKey.trim();
      case "anthropicApiKey":
        return !anthropicApiKey.trim();
      default:
        return !openRouterApiKey.trim();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="max-w-md w-full glass-card elevated space-y-6">
        <h2 className="text-2xl font-semibold text-center">Enter Your API Keys</h2>

        {[
          { label: "OpenRouter API Key", value: openRouterApiKey, setter: setOpenRouterApiKey, keyType: "openRouterApiKey", id: "openrouter-api-key", placeholder: "sk-or-..." },
          { label: "OpenAI API Key", value: openAiApiKey, setter: setOpenAiApiKey, keyType: "openAiApiKey", id: "openai-api-key", placeholder: "sk-..." },
          { label: "Google Gemini API Key", value: googleGeminiApiKey, setter: setGoogleGeminiApiKey, keyType: "googleGeminiApiKey", id: "google-gemini-api-key", placeholder: "Your Google Gemini API Key" },
          { label: "Anthropic Claude API Key", value: anthropicApiKey, setter: setAnthropicApiKey, keyType: "anthropicApiKey", id: "anthropic-api-key", placeholder: "Your Anthropic API Key" },
        ].map(({ label, value, setter, keyType, id, placeholder }) => (
          <div key={keyType} className="flex items-center space-x-2">
            <input
              type="radio"
              id={`key-${keyType}`}
              name="active-api-key"
              checked={activeKeyType === keyType}
              onChange={() => onActiveKeyTypeChange(keyType)}
              className="h-4 w-4"
              aria-label={`Select ${label} as active API key`}
            />
            <div className="flex-1">
              <Label htmlFor={id}>{label}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id={id}
                  type="password"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  aria-describedby={`${id}-help`}
                />
                {value && (
                  <button
                    type="button"
                    aria-label={`Clear ${label}`}
                    onClick={() => setter("")}
                    className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div>
          <Label htmlFor="model-select">Select Model</Label>
          <select
            id="model-select"
            className="w-full rounded-md border border-border bg-background p-2"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            aria-label="Select AI model"
          >
            {availableModels.map((m) => (
              <option key={m.id} value={m.id} title={m.label}>
                {m.label}
              </option>
            ))}
          </select>
          {modelsLoading && <p className="text-xs text-muted-foreground mt-1">Loading models…</p>}
        </div>

        <Button
          onClick={validateKey}
          disabled={isValidateDisabled()}
          className="w-full"
          aria-label="Validate API keys and start research"
        >
          Validate & Start Research
        </Button>
      </div>
    </div>
  );
}