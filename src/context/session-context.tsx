"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type SessionMeta = {
  sessionId: string;
  createdAt: number;
  expiresAt: number;
  title?: string;
};

type SessionContextValue = {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  model: string;
  setModel: (m: string) => void;
  redditClientId: string | null;
  setRedditClientId: (id: string | null) => void;
  redditClientSecret: string | null;
  setRedditClientSecret: (s: string | null) => void;
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
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(`${SESSION_STORAGE_KEY}-apiKey`);
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

  const [redditClientId, setRedditClientIdState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(`${SESSION_STORAGE_KEY}-reddit-id`);
    } catch {
      return null;
    }
  });

  const [redditClientSecret, setRedditClientSecretState] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(`${SESSION_STORAGE_KEY}-reddit-secret`);
    } catch {
      return null;
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
      if (apiKey) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-apiKey`, apiKey);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-apiKey`);
    } catch {}
  }, [apiKey]);

  useEffect(() => {
    try {
      if (model) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-model`, model);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-model`);
    } catch {}
  }, [model]);

  useEffect(() => {
    try {
      if (redditClientId) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-reddit-id`, redditClientId);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-reddit-id`);
    } catch {}
  }, [redditClientId]);

  useEffect(() => {
    try {
      if (redditClientSecret) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-reddit-secret`, redditClientSecret);
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-reddit-secret`);
    } catch {}
  }, [redditClientSecret]);

  useEffect(() => {
    try {
      if (sessionMeta) sessionStorage.setItem(`${SESSION_STORAGE_KEY}-meta`, JSON.stringify(sessionMeta));
      else sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-meta`);
    } catch {}
  }, [sessionMeta]);

  const setApiKey = (k: string | null) => {
    setApiKeyState(k);
  };

  const setModel = (m: string) => {
    setModelState(m);
  };

  const setRedditClientId = (id: string | null) => {
    setRedditClientIdState(id);
  };

  const setRedditClientSecret = (s: string | null) => {
    setRedditClientSecretState(s);
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
    setApiKeyState(null);
    setModelState("mistralai/mistral-7b-instruct:free");
    setRedditClientIdState(null);
    setRedditClientSecretState(null);
    setSessionMeta(null);
    try {
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-apiKey`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-model`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-reddit-id`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-reddit-secret`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-meta`);
    } catch {}
  };

  const value: SessionContextValue = {
    apiKey,
    setApiKey,
    model,
    setModel,
    redditClientId,
    setRedditClientId,
    redditClientSecret,
    setRedditClientSecret,
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