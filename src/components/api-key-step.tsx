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
  }, model: string) => void;
}

const FREE_MODELS = [
  { id: "openrouter/mistralai/mistral-7b-instruct:free", label: "OpenRouter: Mistral 7B Instruct (free)" },
  { id: "openai/gpt-4", label: "OpenAI: GPT-4" },
  { id: "openai/gpt-3.5-turbo", label: "OpenAI: GPT-3.5 Turbo" },
  { id: "google/gemini-1", label: "Google: Gemini 1 (free)" },
  { id: "anthropic/claude-v1", label: "Anthropic: Claude v1" },
];

export function ApiKeyStep({ onValidated }: ApiKeyStepProps) {
  const session = useSession();

  const [openRouterApiKey, setOpenRouterApiKey] = useState(session.openRouterApiKey ?? "");
  const [openAiApiKey, setOpenAiApiKey] = useState(session.openAiApiKey ?? "");
  const [googleGeminiApiKey, setGoogleGeminiApiKey] = useState(session.googleGeminiApiKey ?? "");
  const [anthropicApiKey, setAnthropicApiKey] = useState(session.anthropicApiKey ?? "");
  const [model, setModel] = useState(session.model ?? FREE_MODELS[0].id);

  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");

  const validateKey = async () => {
    // Determine which API key to validate based on selected model prefix
    let keyToValidate: string | null = null;
    if (model.startsWith("openai/")) keyToValidate = openAiApiKey;
    else if (model.startsWith("google/gemini")) keyToValidate = googleGeminiApiKey;
    else if (model.startsWith("anthropic/")) keyToValidate = anthropicApiKey;
    else keyToValidate = openRouterApiKey;

    if (!keyToValidate) {
      setValid(false);
      setMessage("Please enter the API key for the selected model.");
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
        // Save keys to session context
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
          model
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="max-w-md w-full glass-card elevated space-y-4">
        <h2 className="text-2xl font-semibold text-center">Enter Your API Keys</h2>

        <div>
          <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
          <Input
            id="openrouter-api-key"
            type="password"
            placeholder="sk-or-..."
            value={openRouterApiKey}
            onChange={(e) => setOpenRouterApiKey(e.target.value)}
            aria-label="OpenRouter API Key"
          />
        </div>

        <div>
          <Label htmlFor="openai-api-key">OpenAI API Key</Label>
          <Input
            id="openai-api-key"
            type="password"
            placeholder="sk-..."
            value={openAiApiKey}
            onChange={(e) => setOpenAiApiKey(e.target.value)}
            aria-label="OpenAI API Key"
          />
        </div>

        <div>
          <Label htmlFor="google-gemini-api-key">Google Gemini API Key</Label>
          <Input
            id="google-gemini-api-key"
            type="password"
            placeholder="Your Google Gemini API Key"
            value={googleGeminiApiKey}
            onChange={(e) => setGoogleGeminiApiKey(e.target.value)}
            aria-label="Google Gemini API Key"
          />
        </div>

        <div>
          <Label htmlFor="anthropic-api-key">Anthropic Claude API Key</Label>
          <Input
            id="anthropic-api-key"
            type="password"
            placeholder="Your Anthropic API Key"
            value={anthropicApiKey}
            onChange={(e) => setAnthropicApiKey(e.target.value)}
            aria-label="Anthropic API Key"
          />
        </div>

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
          disabled={validating}
          className="w-full"
          aria-label="Validate API keys and start research"
        >
          {validating ? "Validating..." : "Validate & Start Research"}
        </Button>
      </div>
    </div>
  );
}