"use client";

import { Sidebar } from "./sidebar";
import { ResearchStep } from "./research-step";
import { Toaster } from "@/components/ui/sonner";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:pl-14 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-3xl font-semibold">Step 1: Viral Content Research</h1>
        </div>
        <ResearchStep />
      </main>
      <Toaster />
    </div>
  );
}