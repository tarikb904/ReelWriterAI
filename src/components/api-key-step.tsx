"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";

interface ApiKeyStepProps {
  onValidated: (apiKey: string, model: string) => void;
}

const FREE_MODELS = [
  {
    id: "openai/gpt-oss-20b",
    label: "OpenAI: gpt-oss-20b (free) - 21B param MoE, 131K context",
  },
  {
    id: "z-ai/glm-4.5-air",
    label: "Z.AI: GLM 4.5 Air (free) - 35.2B param MoE, 131K context",
  },
  {
    id: "qwen/qwen3-coder",
    label: "Qwen: Qwen3 Coder (free) - 480B param MoE, 262K context",
  },
  {
    id: "moonshotai/kimi-k2",
    label: "MoonshotAI: Kimi K2 (free) - 1T param MoE, 33K context",
  },
  {
    id: "cognitivecomputations/venice-uncensored",
    label: "Venice: Uncensored (free) - Mistral 24B variant, 33K context",
  },
  {
    id: "google/gemma-3n-2b",
    label: "Google: Gemma 3n 2B (free) - 2B param multimodal, 8K context",
  },
  {
    id: "tencent/hunyuan-a13b-instruct",
    label: "Tencent: Hunyuan A13B Instruct (free) - 80B param MoE, 33K context",
  },
  {
    id: "tngtech/deepseek-r1t2-chimera",
    label: "TNG: DeepSeek R1T2 Chimera (free) - 671B param MoE, 164K context",
  },
  {
    id: "mistralai/mistral-small-3.2-24b",
    label: "Mistral: Mistral Small 3.2 24B (free) - 24B param, 131K context",
  },
  {
    id: "moonshotai/kimi-dev-72b",
    label: "MoonshotAI: Kimi Dev 72B (free) - 72B param fine-tuned for code",
  },
];

export function ApiKeyStep({ onValidated }: ApiKeyStepProps) {
  const session = useSession();
  const [apiKey, setApiKey] = useState(session.apiKey ?? "");
  const [model, setModel] = useState(session.model ?? FREE_MODELS[0].id);
  const [validating, setValidating] = useState(false);
  const [valid, setValid] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string>("");

  const validateKey = async () => {
    if (!apiKey) {
      setValid(false);
      setMessage("Please enter your OpenRouter API key.");
      return;
    }
    setValidating(true);
    setValid(null);
    setMessage("");
    try {
      const res = await fetch("/api/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setValid(true);
        setMessage("API key validated successfully!");
        session.setApiKey(apiKey);
        session.setModel(model);
        toast.success("API key validated!");
        onValidated(apiKey, model);
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
      <div className="max-w-md w-full glass-card elevated">
        <h2 className="text-2xl font-semibold mb-4 text-center">Enter Your OpenRouter API Key</h2>
        <div className="mb-4">
          <Label htmlFor="api-key">OpenRouter API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="sk-or-..."
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setValid(null); setMessage(""); }}
            aria-label="OpenRouter API Key"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="model-select">Select Model</Label>
          <select
            id="model-select"
            className="w-full rounded-md border border-border bg-background p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
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
          <p className={`mb-4 text-center ${valid ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <Button
          onClick={validateKey}
          disabled={validating}
          className="w-full transition-colors hover:bg-primary/90 focus:ring-2 focus:ring-primary"
          aria-label="Validate API key and start research"
        >
          {validating ? "Validating..." : "Validate & Start Research"}
        </Button>
      </div>
    </div>
  );
}