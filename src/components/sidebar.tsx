"use client";

import Link from "next/link";
import React, { useState } from "react";
import {
  History,
  Search,
  Settings,
  Menu,
  X,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import { useSession } from "@/context/session-context";

const navItems = [
  { href: "/", label: "Research", icon: Search },
  { href: "/history", label: "History", icon: History },
];

const FREE_MODELS = [
  {
    id: "openai/gpt-oss-20b",
    label: "OpenAI: gpt-oss-20b (free)",
  },
  {
    id: "z-ai/glm-4.5-air",
    label: "Z.AI: GLM 4.5 Air (free)",
  },
  {
    id: "qwen/qwen3-coder",
    label: "Qwen: Qwen3 Coder (free)",
  },
  {
    id: "moonshotai/kimi-k2",
    label: "MoonshotAI: Kimi K2 (free)",
  },
  {
    id: "cognitivecomputations/venice-uncensored",
    label: "Venice: Uncensored (free)",
  },
  {
    id: "google/gemma-3n-2b",
    label: "Google: Gemma 3n 2B (free)",
  },
  {
    id: "tencent/hunyuan-a13b-instruct",
    label: "Tencent: Hunyuan A13B Instruct (free)",
  },
  {
    id: "tngtech/deepseek-r1t2-chimera",
    label: "TNG: DeepSeek R1T2 Chimera (free)",
  },
  {
    id: "mistralai/mistral-small-3.2-24b",
    label: "Mistral: Mistral Small 3.2 24B (free)",
  },
  {
    id: "moonshotai/kimi-dev-72b",
    label: "MoonshotAI: Kimi Dev 72B (free)",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useSession();

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    session.setModel(e.target.value);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-pressed={mobileOpen}
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-30 inline-flex items-center justify-center rounded-md bg-background p-2 text-muted-foreground shadow-md sm:hidden"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-24 flex-col border-r bg-background/80 backdrop-blur-sm transition-transform sm:flex",
          mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        )}
      >
        <div className="flex flex-col items-center gap-4 px-3 py-4 border-b border-border">
          <div className="rounded-full p-2 logo-gradient shadow-md">
            <Logo size={36} />
          </div>
          <select
            aria-label="Select AI model"
            className="w-full rounded-md border border-border bg-background p-1 text-sm text-foreground"
            value={session.model || FREE_MODELS[0].id}
            onChange={handleModelChange}
          >
            {FREE_MODELS.map((m) => (
              <option key={m.id} value={m.id} title={m.label}>
                {m.label}
              </option>
            ))}
          </select>
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