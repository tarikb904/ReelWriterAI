"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { History, Search, Settings, Menu, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import { useSession } from "@/context/session-context";

type ModelItem = { id: string; label: string };

const navItems = [
  { href: "/", label: "Research", icon: Search },
  { href: "/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useSession();

  const [models, setModels] = useState<ModelItem[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const activeProvider = useMemo(() => {
    if (session.model?.startsWith("openai/")) return "openai";
    if (session.model?.startsWith("google/")) return "google";
    if (session.model?.startsWith("anthropic/")) return "anthropic";
    // default preference based on available keys
    if (session.openRouterApiKey) return "openrouter";
    if (session.openAiApiKey) return "openai";
    if (session.googleGeminiApiKey) return "google";
    if (session.anthropicApiKey) return "anthropic";
    return "openrouter";
  }, [session.model, session.openRouterApiKey, session.openAiApiKey, session.googleGeminiApiKey, session.anthropicApiKey]);

  const activeKey = useMemo(() => {
    switch (activeProvider) {
      case "openai": return session.openAiApiKey || "";
      case "google": return session.googleGeminiApiKey || "";
      case "anthropic": return session.anthropicApiKey || "";
      default: return session.openRouterApiKey || "";
    }
  }, [activeProvider, session]);

  const activeApiKeyLabel = useMemo(() => {
    switch (activeProvider) {
      case "openai": return session.openAiApiKey ? "OpenAI API Key Active" : "OpenAI API Key Not Set";
      case "google": return session.googleGeminiApiKey ? "Google Gemini API Key Active" : "Google Gemini API Key Not Set";
      case "anthropic": return session.anthropicApiKey ? "Anthropic API Key Active" : "Anthropic API Key Not Set";
      default: return session.openRouterApiKey ? "OpenRouter API Key Active" : "OpenRouter API Key Not Set";
    }
  }, [activeProvider, session]);

  const loadModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: activeProvider, apiKey: activeKey || undefined }),
      });
      const data = await res.json();
      const list: ModelItem[] = Array.isArray(data.models) ? data.models : [];
      setModels(list);
      if (list.length && !list.some((m) => m.id === session.model)) {
        // Keep current selection if still valid; otherwise choose first
        session.setModel(list[0].id);
      }
    } catch (e) {
      // ignore; UI already shows label based on key
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProvider, activeKey]);

  return (
    <>
      <button
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-pressed={mobileOpen}
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-30 inline-flex items-center justify-center rounded-md bg-background p-2 text-muted-foreground shadow-md sm:hidden"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-28 flex-col border-r bg-background/80 backdrop-blur-sm transition-transform sm:flex",
          mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        <div className="flex flex-col items-center gap-4 px-3 py-4 border-b border-border">
          <div className="rounded-xl p-2 bg-white/70 shadow-sm dark:bg-white/10">
            <Logo size={32} />
          </div>
          <select
            aria-label="Select AI model"
            className="w-full rounded-md border border-border bg-background p-1 text-sm text-foreground"
            value={session.model}
            onChange={(e) => session.setModel(e.target.value)}
          >
            {models.length ? models.map((m) => (
              <option key={m.id} value={m.id} title={m.label}>
                {m.label}
              </option>
            )) : (
              <option value={session.model || ""}>{loadingModels ? "Loading…" : (session.model || "Select a model in API setup")}</option>
            )}
          </select>
          <p className="text-xs text-muted-foreground text-center mt-1 px-1">
            {activeApiKeyLabel}
          </p>
        </div>

        <nav className="flex flex-col items-center gap-4 px-3 py-6">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-all",
                      pathname === item.href
                        ? "bg-gradient-to-br from-purple-500 via-indigo-600 to-teal-400 text-white shadow-lg"
                        : "text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        <nav className="mt-auto flex flex-col items-center gap-4 px-3 py-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/60">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
    </>
  );
}