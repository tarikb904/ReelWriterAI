"use client";

import { useState } from "react";
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

const FREE_MODELS = [
  { id: "openrouter/mistralai/mistral-7b-instruct:free", label: "OpenRouter: Mistral 7B Instruct (free)", keyType: "openRouterApiKey" },
  { id: "openai/gpt-4", label: "OpenAI: GPT-4", keyType: "openAiApiKey" },
  { id: "openai/gpt-3.5-turbo", label: "OpenAI: GPT-3.5 Turbo", keyType: "openAiApiKey" },
  { id: "google/gemini-1", label: "Google: Gemini 1 (free)", keyType: "googleGeminiApiKey" },
  { id: "anthropic/claude-v1", label: "Anthropic: Claude v1", keyType: "anthropicApiKey" },
];

export function ApiKeyStep({ onValidated }: ApiKeyStepProps) {
  const session = useSession();

  const [openRouterApiKey, setOpenRouterApiKey] = useState(session.openRouterApiKey ?? "");
  const [openAiApiKey, setOpenAiApiKey] = useState(session.openAiApiKey ?? "");
  const [googleGeminiApiKey, setGoogleGeminiApiKey] = useState(session.googleGeminiApiKey ?? "");
  const [anthropicApiKey, setAnthropicApiKey] = useState(session.anthropicApiKey ?? "");
  const [model, setModel] = useState(session.model ?? FREE_MODELS[0].id);

  const initialKeyType = (() => {
    if (model.startsWith("openai/")) return "openAiApiKey";
    if (model.startsWith("google/gemini")) return "googleGeminiApiKey";
    if (model.startsWith("anthropic/")) return "anthropicApiKey";
    return "openRouterApiKey";
  })();

  const [activeKeyType, setActiveKeyType] = useState<string>(initialKeyType);
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");

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
      setValid(false);
      setMessage("Please enter the API key for the selected model.");
      toast.error("Please enter the API key for the selected model.");
      return;
    }

    setValidating(true);
    setValid(null);
    setMessage("");
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToValidate }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setValid(true);
        setMessage("API key validated successfully!");
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
      } else {
        setValid(false);
        setMessage(data.message || "Validation failed.");
        toast.error("API key validation failed.");
      }
    } catch (err) {
      setValid(false);
      setMessage("Validation request failed.");
      toast.error("API key validation request failed.");
    } finally {
      setValidating(false);
    }
  };

  const clearKey = (keyType: string) => {
    switch (keyType) {
      case "openRouterApiKey":
        setOpenRouterApiKey("");
        break;
      case "openAiApiKey":
        setOpenAiApiKey("");
        break;
      case "googleGeminiApiKey":
        setGoogleGeminiApiKey("");
        break;
      case "anthropicApiKey":
        setAnthropicApiKey("");
        break;
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
              onChange={() => setActiveKeyType(keyType)}
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
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Clear ${label}`}
                    onClick={() => clearKey(keyType)}
                    className="h-8 w-8"
                  >
                    ×
                  </Button>
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
            {FREE_MODELS.map((m) => (
              <option key={m.id} value={m.id} title={m.label}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <p className={`text-center ${valid ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}

        <Button
          onClick={validateKey}
          disabled={validating || isValidateDisabled()}
          className="w-full"
          aria-label="Validate API keys and start research"
        >
          {validating ? "Validating..." : "Validate & Start Research"}
        </Button>
      </div>
    </div>
  );
}