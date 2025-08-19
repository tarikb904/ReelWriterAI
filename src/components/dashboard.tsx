"use client";

import { Sidebar } from "./sidebar";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:pl-14 md:gap-8 md:p-8">
        <h1 className="text-2xl font-bold">Step 1: Viral Content Research</h1>
        <p className="text-muted-foreground">
          This is where you'll find trending content ideas. This feature is coming soon!
        </p>
      </main>
    </div>
  );
}