"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type SessionMeta = {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  title?: string;
};

type SessionContextValue = {
  openRouterApiKey: string | null;
  setOpenRouterApiKey: (key: string | null) => void;
  openAiApiKey: string | null;
  setOpenAiApiKey: (key: string | null) => void;
  googleGeminiApiKey: string | null;
  setGoogleGeminiApiKey: (key: string | null) => void;
  anthropicApiKey: string | null;
  setAnthropicApiKey: (key: string | null) => void;
  model: string;
  setModel: (m: string) => void;
  sessionMeta: SessionMeta | null;
  createNewSession: (title?: string) => SessionMeta;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const SESSION_STORAGE_KEY = "reelwriter-session";
const DEFAULT_EXPIRE_DAYS = 7;

function getExpiresAt(days = DEFAULT_EXPIRE_DAYS) {
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

function generateId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
      return (crypto as any).randomUUID();
    }
  } catch {
    // ignore
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [openRouterApiKey, setOpenRouterApiKeyState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(`${SESSION_STORAGE_KEY}-openrouter-apiKey`);
    } catch {
      return null;
    }
  });

  const [openAiApiKey, setOpenAiApiKeyState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(`${SESSION_STORAGE_KEY}-openai-apiKey`);
    } catch {
      return null;
    }
  });

  const [googleGeminiApiKey, setGoogleGeminiApiKeyState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(`${SESSION_STORAGE_KEY}-google-gemini-apiKey`);
    } catch {
      return null;
    }
  });

  const [anthropicApiKey, setAnthropicApiKeyState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(`${SESSION_STORAGE_KEY}-anthropic-apiKey`);
    } catch {
      return null;
    }
  });

  const [model, setModelState] = useState<string>(() => {
    try {
      return sessionStorage.getItem(`${SESSION_STORAGE_KEY}-model`) || "mistralai/mistral-7b-instruct:free";
    } catch {
      return "mistralai/mistral-7b-instruct:free";
    }
  });

  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(() => {
    try {
      const raw = sessionStorage.getItem(`${SESSION_STORAGE_KEY}-meta`);
      return raw ? (JSON.parse(raw) as SessionMeta) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (openRouterApiKey) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-openrouter-apiKey`, openRouterApiKey);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-openrouter-apiKey`);
    } catch {}
  }, [openRouterApiKey]);

  useEffect(() => {
    try {
      if (openAiApiKey) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-openai-apiKey`, openAiApiKey);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-openai-apiKey`);
    } catch {}
  }, [openAiApiKey]);

  useEffect(() => {
    try {
      if (googleGeminiApiKey) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-google-gemini-apiKey`, googleGeminiApiKey);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-google-gemini-apiKey`);
    } catch {}
  }, [googleGeminiApiKey]);

  useEffect(() => {
    try {
      if (anthropicApiKey) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-anthropic-apiKey`, anthropicApiKey);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-anthropic-apiKey`);
    } catch {}
  }, [anthropicApiKey]);

  useEffect(() => {
    try {
      if (model) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-model`, model);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-model`);
    } catch {}
  }, [model]);

  useEffect(() => {
    try {
      if (sessionMeta) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-meta`, JSON.stringify(sessionMeta));
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-meta`);
    } catch {}
  }, [sessionMeta]);

  const setOpenRouterApiKey = (k: string | null) => {
    setOpenRouterApiKeyState(k);
  };

  const setOpenAiApiKey = (k: string | null) => {
    setOpenAiApiKeyState(k);
  };

  const setGoogleGeminiApiKey = (k: string | null) => {
    setGoogleGeminiApiKeyState(k);
  };

  const setAnthropicApiKey = (k: string | null) => {
    setAnthropicApiKeyState(k);
  };

  const setModel = (m: string) => {
    setModelState(m);
  };

  const createNewSession = (title?: string) => {
    const meta: SessionMeta = {
      sessionId: generateId(),
      createdAt: Date.now(),
      expiresAt: getExpiresAt(),
      title,
    };
    setSessionMeta(meta);
    return meta;
  };

  const clearSession = () => {
    setOpenRouterApiKeyState(null);
    setOpenAiApiKeyState(null);
    setGoogleGeminiApiKeyState(null);
    setAnthropicApiKeyState(null);
    setModelState("mistralai/mistral-7b-instruct:free");
    setSessionMeta(null);
    try {
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-openrouter-apiKey`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-openai-apiKey`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-google-gemini-apiKey`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-anthropic-apiKey`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-model`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-meta`);
    } catch {}
  };

  const value: SessionContextValue = {
    openRouterApiKey,
    setOpenRouterApiKey,
    openAiApiKey,
    setOpenAiApiKey,
    googleGeminiApiKey,
    setGoogleGeminiApiKey,
    anthropicApiKey,
    setAnthropicApiKey,
    model,
    setModel,
    sessionMeta,
    createNewSession,
    clearSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}