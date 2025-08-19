import React from "react";
import HistoryList from "@/components/history";
import { Sidebar } from "@/components/sidebar";

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:pl-14 md:gap-8 md:p-8">
        <HistoryList />
      </main>
    </div>
  );
}