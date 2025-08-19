"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Anchor,
  Captions,
  FileText,
  History,
  Search,
  Settings,
  User,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-20 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-3 sm:py-6">
        <Link
          href="#"
          className="group flex h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-600 to-teal-400 shadow-md"
        >
          {/* Logo placed center; keep using provided logo.png but inside vibrant container */}
          <div className="relative h-8 w-8 rounded-md overflow-hidden">
            <Image src="/logo.png" alt="ReelWriterAI Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="sr-only">ReelWriterAI</span>
        </Link>
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9",
                    pathname === item.href && "bg-accent text-accent-foreground"
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
      <nav className="mt-auto flex flex-col items-center gap-4 px-3 sm:py-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9"
              >
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