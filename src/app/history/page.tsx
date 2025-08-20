import React from "react";
import HistoryList from "@/components/history";
import { Sidebar } from "@/components/sidebar";

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <main className="flex-1 flex flex-col gap-4 p-4 sm:pl-28 md:gap-8 md:p-8">
        <HistoryList />
      </main>
    </div>
  );
}