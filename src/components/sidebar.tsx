"use client";

import Link from "next/link";
import {
  Anchor,
  Captions,
  FileText,
  History,
  Search,
  Settings,
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

const navItems = [
  { href: "/", label: "Research", icon: Search },
  { href: "/hook", label: "Hook", icon: Anchor },
  { href: "/script", label: "Script", icon: FileText },
  { href: "/captions", label: "Captions", icon: Captions },
  { href: "/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-20 flex-col border-r bg-background/80 backdrop-blur-sm sm:flex">
      <nav className="flex flex-col items-center gap-4 px-3 py-6">
        <Link href="#" className="flex items-center justify-center">
          <div className="rounded-full p-2 logo-gradient shadow-md">
            <Logo size={36} />
          </div>
        </Link>

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
  );
}