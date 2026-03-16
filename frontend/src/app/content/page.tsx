"use client";

import { useState } from "react";
import { Chat } from "@/components/chat";
import {
  FileText,
  Instagram,
  Twitter,
  Linkedin,
  Globe,
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  PenLine,
  Eye,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Platform = "all" | "blog" | "instagram" | "twitter" | "linkedin";

const platforms: { key: Platform; label: string; icon: React.ElementType; color: string }[] =
  [
    { key: "all", label: "All", icon: Globe, color: "" },
    { key: "blog", label: "Blog", icon: FileText, color: "text-green-500" },
    { key: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
    { key: "twitter", label: "Twitter/X", icon: Twitter, color: "text-sky-500" },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  ];

const sampleCalendar = [
  {
    day: "Mon",
    date: "Mar 17",
    platform: "instagram",
    theme: "Product Spotlight - Feature Deep Dive",
    time: "10:00 AM",
    status: "scheduled",
    preview: "Discover how our AI agents can transform your marketing workflow...",
  },
  {
    day: "Mon",
    date: "Mar 17",
    platform: "twitter",
    theme: "Industry Thread: AI in Marketing 2025",
    time: "3:00 PM",
    status: "draft",
    preview: "Thread: 5 ways AI is changing marketing forever...",
  },
  {
    day: "Tue",
    date: "Mar 18",
    platform: "blog",
    theme: "How-To Guide: Content Calendar Mastery",
    time: "9:00 AM",
    status: "draft",
    preview: "A complete guide to building and maintaining an effective content calendar...",
  },
  {
    day: "Wed",
    date: "Mar 19",
    platform: "instagram",
    theme: "Behind the Scenes: Building AI Agents",
    time: "12:00 PM",
    status: "planned",
    preview: "Take a peek behind the curtain at how we build our AI marketing agents...",
  },
  {
    day: "Wed",
    date: "Mar 19",
    platform: "linkedin",
    theme: "Thought Leadership: Future of Marketing AI",
    time: "10:00 AM",
    status: "planned",
    preview: "The intersection of AI and marketing is creating unprecedented opportunities...",
  },
  {
    day: "Thu",
    date: "Mar 20",
    platform: "twitter",
    theme: "Tips & Tricks: Growth Hacking 101",
    time: "2:00 PM",
    status: "planned",
    preview: "Quick tips for rapid growth using AI-powered tools...",
  },
  {
    day: "Fri",
    date: "Mar 21",
    platform: "instagram",
    theme: "User Story: Client Success Spotlight",
    time: "11:00 AM",
    status: "planned",
    preview: "How @techstartup grew their Instagram by 300% in 3 months...",
  },
  {
    day: "Fri",
    date: "Mar 21",
    platform: "linkedin",
    theme: "Case Study: ROI of AI Marketing",
    time: "9:00 AM",
    status: "planned",
    preview: "Measuring the real impact of AI-powered marketing campaigns...",
  },
];

const quickPrompts = [
  "Write an Instagram caption for a product launch",
  "Create a blog post outline about AI marketing",
  "Generate a Twitter thread about growth hacking",
  "Write a LinkedIn thought leadership post",
];

const weeklyStats = [
  { label: "Scheduled", value: "1", icon: CheckCircle2, color: "text-green-400" },
  { label: "Drafts", value: "2", icon: PenLine, color: "text-amber-400" },
  { label: "Planned", value: "5", icon: Clock, color: "text-blue-400" },
  { label: "Published", value: "12", icon: Eye, color: "text-purple-400" },
];

export default function ContentPage() {
  const [activePlatform, setActivePlatform] = useState<Platform>("all");
  const [view, setView] = useState<"calendar" | "chat">("calendar");

  const filteredCalendar =
    activePlatform === "all"
      ? sampleCalendar
      : sampleCalendar.filter((item) => item.platform === activePlatform);

  const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
    scheduled: { color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
    draft: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: PenLine },
    planned: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock },
  };

  const platformIcons: Record<string, { icon: React.ElementType; color: string }> = {
    instagram: { icon: Instagram, color: "text-pink-500" },
    twitter: { icon: Twitter, color: "text-sky-500" },
    linkedin: { icon: Linkedin, color: "text-blue-600" },
    blog: { icon: FileText, color: "text-green-500" },
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Content Studio</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage content across all platforms
              </p>
            </div>
          </div>
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
                view === "calendar"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              Calendar
            </button>
            <button
              onClick={() => setView("chat")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
                view === "chat"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Create with AI
            </button>
          </div>
        </div>

        {/* Platform Tabs */}
        {view === "calendar" && (
          <div className="mt-4 flex gap-2">
            {platforms.map((platform) => (
              <button
                key={platform.key}
                onClick={() => setActivePlatform(platform.key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  activePlatform === platform.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <platform.icon className="h-3.5 w-3.5" />
                {platform.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "calendar" ? (
        <div className="flex-1 overflow-y-auto p-6">
          {/* Weekly Stats */}
          <div className="mb-6 grid grid-cols-4 gap-3">
            {weeklyStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <stat.icon className={cn("h-5 w-5", stat.color)} />
                <div>
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">This Week</h2>
              <span className="text-xs text-muted-foreground">
                Mar 17 - Mar 21, 2025
              </span>
            </div>
            <button className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25">
              <Plus className="h-3.5 w-3.5" />
              New Post
            </button>
          </div>

          <div className="space-y-3">
            {filteredCalendar.map((item, i) => {
              const pi = platformIcons[item.platform];
              const sc = statusConfig[item.status];
              const StatusIcon = sc.icon;
              const PlatformIcon = pi.icon;
              return (
                <div
                  key={i}
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center pt-0.5">
                    <p className="text-xs font-bold text-muted-foreground">
                      {item.day}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {item.date}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary"
                    )}
                  >
                    <PlatformIcon className={cn("h-4 w-4", pi.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{item.theme}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.preview}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground/60">
                      {item.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium capitalize",
                        sc.color
                      )}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCalendar.length === 0 && (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm">No content scheduled for this platform yet.</p>
              <button className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                <Plus className="h-3.5 w-3.5" />
                Create content
              </button>
            </div>
          )}
        </div>
      ) : (
        <Chat
          agentName="content"
          placeholder="Describe the content you want to create..."
          className="flex-1"
          quickPrompts={quickPrompts}
        />
      )}
    </div>
  );
}
