"use client";

import React from "react";
import { cn } from "@/lib/utils";

type HeaderBannerProps = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
};

export default function HeaderBanner({ title, subtitle, icon, right, className }: HeaderBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border",
        "bg-[radial-gradient(1200px_400px_at_0%_-10%,hsl(var(--grad-1)/0.25),transparent),radial-gradient(1200px_400px_at_100%_110%,hsl(var(--grad-3)/0.25),transparent)]",
        "dark:bg-[radial-gradient(1200px_400px_at_0%_-10%,hsl(var(--grad-1)/0.35),transparent),radial-gradient(1200px_400px_at_100%_110%,hsl(var(--grad-3)/0.35),transparent)]",
        "px-5 py-6 md:px-8 md:py-8",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 text-foreground shadow-sm dark:bg-white/10">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1 text-sm md:text-base text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-purple-500/40 via-indigo-500/30 to-teal-400/40 blur-2xl dark:from-purple-500/30 dark:via-indigo-500/20 dark:to-teal-400/30" />
        <div className="absolute -left-16 bottom-0 h-24 w-24 rounded-full bg-gradient-to-tr from-cyan-400/40 via-fuchsia-500/30 to-indigo-500/40 blur-2xl dark:from-cyan-400/30 dark:via-fuchsia-500/20 dark:to-indigo-500/30" />
      </div>
    </div>
  );
}