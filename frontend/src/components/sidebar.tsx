"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Mic,
  Target,
  FileText,
  Instagram,
  Sparkles,
  ChevronRight,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { healthCheck } from "@/lib/api";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "text-violet-400" },
  { href: "/onboarding", label: "Onboarding", icon: Mic, color: "text-emerald-400" },
  { href: "/strategy", label: "Strategy", icon: Target, color: "text-blue-400" },
  { href: "/content", label: "Content", icon: FileText, color: "text-amber-400" },
  { href: "/instagram", label: "Instagram", icon: Instagram, color: "text-pink-400" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    healthCheck()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));

    const interval = setInterval(() => {
      healthCheck()
        .then(() => setBackendOnline(true))
        .catch(() => setBackendOnline(false));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="flex w-[260px] flex-col border-r border-border bg-card/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">Marketing AI</h1>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Agency Platform
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Agents
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                  isActive ? "bg-primary/20" : "bg-secondary group-hover:bg-accent"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? item.color : ""
                  )}
                />
              </div>
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 text-primary/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2.5">
          <Activity
            className={cn(
              "h-3.5 w-3.5",
              backendOnline === true
                ? "text-green-500"
                : backendOnline === false
                ? "text-red-500"
                : "text-muted-foreground"
            )}
          />
          <div className="flex-1">
            <p className="text-[11px] font-medium">
              Backend{" "}
              {backendOnline === true
                ? "Online"
                : backendOnline === false
                ? "Offline"
                : "Checking..."}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Gemini + Google ADK
            </p>
          </div>
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              backendOnline === true
                ? "bg-green-500 shadow-sm shadow-green-500/50"
                : backendOnline === false
                ? "bg-red-500"
                : "bg-muted-foreground animate-pulse"
            )}
          />
        </div>
      </div>
    </aside>
  );
}
