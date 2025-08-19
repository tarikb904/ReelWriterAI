"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

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

  const createNewSession = (title?: string) => {
    const meta: SessionMeta = {
      sessionId: uuidv4(),
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
    setSessionMeta(null);
    try {
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-apiKey`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-model`);
      sessionStorage.removeItem(`${SESSION_STORAGE_KEY}-meta`);
    } catch {}
  };

  const value: SessionContextValue = {
    apiKey,
    setApiKey,
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