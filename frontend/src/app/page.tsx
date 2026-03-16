"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Mic,
  Target,
  FileText,
  Instagram,
  ArrowRight,
  Zap,
  Brain,
  BarChart3,
  Activity,
  Sparkles,
  TrendingUp,
  Globe,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { healthCheck } from "@/lib/api";

const agents = [
  {
    name: "Onboarding Agent",
    description:
      "Voice-based business intake powered by Gemini Live API. Tell us about your business and we'll build your marketing profile.",
    href: "/onboarding",
    icon: Mic,
    color: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20",
    status: "Ready",
    features: ["Voice Input", "Real-time Transcript", "Profile Builder"],
  },
  {
    name: "Strategy Agent",
    description:
      "AI-powered marketing strategy creation with Google Search grounding. Get data-driven plans tailored to your business.",
    href: "/strategy",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/20",
    status: "Ready",
    features: ["Search Grounding", "90-Day Plans", "Budget Allocation"],
  },
  {
    name: "Content Agent",
    description:
      "Generate platform-specific content and manage your content calendar. Blog posts, social media, emails, and more.",
    href: "/content",
    icon: FileText,
    color: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/20",
    status: "Ready",
    features: ["Multi-Platform", "Calendar View", "AI Generation"],
  },
  {
    name: "Instagram Agent",
    description:
      "Multi-agent Instagram manager with research, posting, and engagement sub-agents. Grow your Instagram presence.",
    href: "/instagram",
    icon: Instagram,
    color: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/20",
    status: "Ready",
    features: ["Sub-Agents", "Auto-Engage", "Analytics"],
  },
];

const stats = [
  {
    label: "AI Agents",
    value: "4",
    icon: Brain,
    description: "Specialized marketing agents",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    label: "Sub-Agents",
    value: "3",
    icon: Zap,
    description: "Instagram sub-agents",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    label: "Platforms",
    value: "6+",
    icon: Globe,
    description: "Content platforms supported",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

const workflow = [
  {
    step: "1",
    title: "Onboard",
    desc: "Tell us about your business via voice or text",
    icon: Mic,
    color: "from-emerald-500 to-teal-600",
  },
  {
    step: "2",
    title: "Strategize",
    desc: "AI creates a data-driven marketing plan",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "3",
    title: "Create",
    desc: "Generate content for all your platforms",
    icon: FileText,
    color: "from-amber-500 to-orange-500",
  },
  {
    step: "4",
    title: "Manage",
    desc: "Post, engage, and grow your audience",
    icon: Instagram,
    color: "from-pink-500 to-rose-500",
  },
];

export default function DashboardPage() {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  useEffect(() => {
    healthCheck()
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, []);

  return (
    <div className="min-h-full p-8">
      {/* Hero Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Powered by Google ADK + Gemini
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Marketing AI Agency
            </h1>
            <p className="mt-2 max-w-lg text-base text-muted-foreground">
              Your AI-powered marketing team. Onboard, strategize, create, and
              manage -- all with intelligent agents orchestrated by Google&apos;s
              Agent Development Kit.
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium",
              backendOnline === true
                ? "bg-green-500/10 text-green-400"
                : backendOnline === false
                ? "bg-red-500/10 text-red-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            {backendOnline === true
              ? "All Systems Online"
              : backendOnline === false
              ? "Backend Offline"
              : "Checking Status..."}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4 animate-slide-up">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                stat.bg
              )}
            >
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Agents Grid */}
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-lg font-semibold">AI Agents</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {agents.length} active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {agents.map((agent, idx) => (
            <Link
              key={agent.name}
              href={agent.href}
              onMouseEnter={() => setHoveredAgent(agent.name)}
              onMouseLeave={() => setHoveredAgent(null)}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Gradient accent line at top */}
              <div
                className={cn(
                  "absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r opacity-0 transition-opacity group-hover:opacity-100",
                  agent.color
                )}
              />

              <div className="mb-4 flex items-center justify-between">
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                    agent.color,
                    agent.shadow
                  )}
                >
                  <agent.icon className="h-5 w-5 text-white" />
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  {agent.status}
                </span>
              </div>
              <h3 className="text-base font-semibold">{agent.name}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {agent.description}
              </p>

              {/* Feature tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.features.map((f) => (
                  <span
                    key={f}
                    className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                Open agent{" "}
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Workflow */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Workflow Pipeline</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {workflow.map((item, i) => (
            <div key={item.step} className="group relative text-center">
              <div
                className={cn(
                  "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110",
                  item.color
                )}
              >
                <item.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
              {i < workflow.length - 1 && (
                <ChevronRight className="absolute -right-3 top-5 hidden h-5 w-5 text-muted-foreground/30 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
