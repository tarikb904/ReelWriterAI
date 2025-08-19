"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSession } from "@/context/session-context";

interface ApiKeyStepProps {
  onValidated: (apiKey: string) => void;
}

export function ApiKeyStep({ onValidated }: ApiKeyStepProps) {
  const session = useSession();
  const [apiKey, setApiKey] = useState(session.apiKey ?? "");
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
        toast.success("API key validated!");
        onValidated(apiKey);
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
          />
        </div>
        {message && (
          <p className={`mb-4 text-center ${valid ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <Button onClick={validateKey} disabled={validating} className="w-full">
          {validating ? "Validating..." : "Validate & Start Research"}
        </Button>
      </div>
    </div>
  );
}