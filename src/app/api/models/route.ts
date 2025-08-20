import { NextResponse } from "next/server";

type Provider = "openrouter" | "openai" | "google" | "anthropic";

export async function POST(req: Request) {
  const { provider, apiKey } = await req.json() as { provider: Provider; apiKey?: string };

  if (!provider) {
    return NextResponse.json({ error: "Missing provider" }, { status: 400 });
  }

  try {
    if (provider === "openrouter") {
      if (!apiKey) return NextResponse.json({ models: fallbackOpenRouter() });
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (!res.ok) return NextResponse.json({ models: fallbackOpenRouter() });
      const data = await res.json();
      const raw = Array.isArray(data.models) ? data.models : (Array.isArray(data.data) ? data.data : []);
      const models = raw
        .map((m: any) => {
          const id = typeof m === "string" ? m : (m.id || m.name);
          const label = typeof m === "string" ? m : (m.name || m.id);
          return id ? { id, label } : null;
        })
        .filter(Boolean);
      return NextResponse.json({ models });
    }

    if (provider === "openai") {
      if (!apiKey) return NextResponse.json({ models: fallbackOpenAI() });
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });
      if (!res.ok) return NextResponse.json({ models: fallbackOpenAI() });
      const data = await res.json();
      const models = (data.data || [])
        .map((m: any) => m.id as string)
        .filter((id: string) => {
          const lower = id.toLowerCase();
          if (lower.includes("embedding") || lower.includes("whisper") || lower.includes("tts") || lower.includes("audio") || lower.includes("moderation")) return false;
          return lower.startsWith("gpt") || lower.startsWith("o") || lower.includes("4o");
        })
        .sort()
        .map((id: string) => ({ id: `openai/${id}`, label: `OpenAI: ${id}` }));
      return NextResponse.json({ models: models.length ? models : fallbackOpenAI() });
    }

    if (provider === "google") {
      if (!apiKey) return NextResponse.json({ models: fallbackGoogle() });
      const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(apiKey)}`, {
        cache: "no-store",
      });
      if (!res.ok) return NextResponse.json({ models: fallbackGoogle() });
      const data = await res.json();
      const models = (data.models || [])
        .map((m: any) => {
          const rawName: string = m.name || "";
          const name = rawName.replace(/^models\//, "");
          return name.includes("gemini") ? { id: `google/${name}`, label: `Google: ${m.displayName || name}` } : null;
        })
        .filter(Boolean);
      return NextResponse.json({ models: models.length ? models : fallbackGoogle() });
    }

    if (provider === "anthropic") {
      if (!apiKey) return NextResponse.json({ models: fallbackAnthropic() });
      const res = await fetch("https://api.anthropic.com/v1/models", {
        headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        cache: "no-store",
      });
      if (!res.ok) return NextResponse.json({ models: fallbackAnthropic() });
      const data = await res.json();
      const raw = Array.isArray(data.data) ? data.data : (Array.isArray(data.models) ? data.models : []);
      const models = raw
        .map((m: any) => {
          const id = m.id || m.name;
          return (id && String(id).toLowerCase().startsWith("claude")) ? { id: `anthropic/${id}`, label: `Anthropic: ${id}` } : null;
        })
        .filter(Boolean);
      return NextResponse.json({ models: models.length ? models : fallbackAnthropic() });
    }

    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  } catch (err) {
    console.error("models route error:", err);
    // Fall back to basic sets
    switch (provider) {
      case "openrouter": return NextResponse.json({ models: fallbackOpenRouter() });
      case "openai": return NextResponse.json({ models: fallbackOpenAI() });
      case "google": return NextResponse.json({ models: fallbackGoogle() });
      case "anthropic": return NextResponse.json({ models: fallbackAnthropic() });
      default: return NextResponse.json({ models: [] });
    }
  }
}

function fallbackOpenRouter() {
  return [
    { id: "openrouter/mistralai/mistral-7b-instruct:free", label: "OpenRouter: Mistral 7B Instruct (free)" },
    { id: "openrouter/z-ai/glm-4.5-air", label: "OpenRouter: GLM 4.5 Air (free)" },
    { id: "openrouter/qwen/qwen3-coder", label: "OpenRouter: Qwen3 Coder (free)" },
    { id: "openrouter/mistralai/mistral-small-3.2-24b", label: "OpenRouter: Mistral Small 3.2 24B (free)" },
  ];
}

function fallbackOpenAI() {
  return [
    { id: "openai/gpt-4o", label: "OpenAI: gpt-4o" },
    { id: "openai/gpt-4o-mini", label: "OpenAI: gpt-4o-mini" },
    { id: "openai/gpt-3.5-turbo", label: "OpenAI: gpt-3.5-turbo" },
  ];
}

function fallbackGoogle() {
  return [
    { id: "google/gemini-1.5-pro", label: "Google: Gemini 1.5 Pro" },
    { id: "google/gemini-1.5-flash", label: "Google: Gemini 1.5 Flash" },
  ];
}

function fallbackAnthropic() {
  return [
    { id: "anthropic/claude-3-opus", label: "Anthropic: Claude 3 Opus" },
    { id: "anthropic/claude-3-sonnet", label: "Anthropic: Claude 3 Sonnet" },
    { id: "anthropic/claude-3-haiku", label: "Anthropic: Claude 3 Haiku" },
  ];
}