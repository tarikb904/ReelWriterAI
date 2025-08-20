import React from "react";
import HistoryList from "@/components/history";
import { Sidebar } from "@/components/sidebar";
import HeaderBanner from "@/components/header-banner";
import ThemeToggle from "@/components/theme-toggle";
import { History as HistoryIcon } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <Sidebar />
      <main className="flex-1 flex flex-col gap-4 p-4 sm:ml-28 md:gap-8 md:p-8">
        <HeaderBanner
          title="History"
          subtitle="All scripts and captions saved locally for the last 7 days"
          icon={<HistoryIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />}
          right={<ThemeToggle />}
        />
        <HistoryList />
      </main>
    </div>
  );
}