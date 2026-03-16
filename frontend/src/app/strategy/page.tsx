"use client";

import { useState } from "react";
import { Chat } from "@/components/chat";
import {
  Target,
  TrendingUp,
  DollarSign,
  BarChart3,
  Clock,
  Search,
  Lightbulb,
  PieChart,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const quickPrompts = [
  "Analyze my business and suggest a marketing strategy",
  "Create a 90-day marketing plan for social media growth",
  "What channels should I focus on with a $5000/month budget?",
  "Research current marketing trends in my industry",
  "Build a content calendar for next month",
  "How should I allocate budget across channels?",
];

const strategyCards = [
  {
    title: "Goals & Objectives",
    icon: Target,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    description: "Define your marketing goals and measurable objectives",
    items: [
      "Increase brand awareness by 40%",
      "Generate 200+ qualified leads/month",
      "Grow social media following by 5k",
      "Achieve 3% conversion rate",
    ],
  },
  {
    title: "Channel Strategy",
    icon: TrendingUp,
    color: "text-green-400",
    bg: "bg-green-500/10",
    description: "Recommended marketing channels and tactics",
    items: [
      "Instagram - Visual storytelling",
      "LinkedIn - Thought leadership",
      "Google Ads - Search intent capture",
      "Email - Nurture sequences",
    ],
  },
  {
    title: "Budget Allocation",
    icon: PieChart,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    description: "Optimized budget distribution across channels",
    items: [
      "Social Media Ads: 35%",
      "Content Creation: 25%",
      "SEO & Search: 20%",
      "Email Marketing: 10%",
      "Tools & Analytics: 10%",
    ],
  },
  {
    title: "Key Performance Indicators",
    icon: BarChart3,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    description: "Track these metrics to measure success",
    items: [
      "Cost per Acquisition (CPA)",
      "Customer Lifetime Value (CLV)",
      "Return on Ad Spend (ROAS)",
      "Engagement Rate",
    ],
  },
];

const phases = [
  {
    phase: "Foundation",
    weeks: "1-2",
    icon: Lightbulb,
    color: "from-violet-500 to-purple-600",
    tasks: [
      "Brand audit & competitor analysis",
      "Setup analytics tracking",
      "Define brand voice & guidelines",
    ],
  },
  {
    phase: "Launch",
    weeks: "3-4",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500",
    tasks: [
      "Launch initial campaigns",
      "Begin content publishing",
      "Activate paid channels",
    ],
  },
  {
    phase: "Optimize",
    weeks: "5-8",
    icon: BarChart3,
    color: "from-emerald-500 to-teal-500",
    tasks: [
      "A/B test ad creatives",
      "Refine targeting",
      "Scale winning campaigns",
    ],
  },
  {
    phase: "Scale",
    weeks: "9-12",
    icon: Target,
    color: "from-amber-500 to-orange-500",
    tasks: [
      "Expand to new channels",
      "Increase budget on ROI+",
      "Build referral programs",
    ],
  },
];

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<"chat" | "overview">("chat");

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Marketing Strategy</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered strategy creation with Google Search grounding
                </p>
              </div>
            </div>
            <div className="flex gap-1 rounded-xl bg-secondary p-1">
              <button
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
                  activeTab === "chat"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-xs font-medium transition-all",
                  activeTab === "overview"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Strategy Overview
              </button>
            </div>
          </div>
        </div>

        {activeTab === "chat" ? (
          <Chat
            agentName="strategy"
            placeholder="Ask about marketing strategy..."
            className="flex-1"
            quickPrompts={quickPrompts}
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            {/* Strategy Cards */}
            <div className="mb-8 grid grid-cols-2 gap-4">
              {strategyCards.map((card) => (
                <div
                  key={card.title}
                  className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        card.bg
                      )}
                    >
                      <card.icon className={cn("h-5 w-5", card.color)} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{card.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {card.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary/50" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">90-Day Roadmap</h2>
                </div>
                <Link
                  href="/content"
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  Go to Content Studio
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {phases.map((item, i) => (
                  <div key={item.phase} className="relative">
                    <div
                      className={cn(
                        "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                        item.color
                      )}
                    >
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold">{item.phase}</h3>
                    <p className="mb-2 text-xs text-primary">
                      Week {item.weeks}
                    </p>
                    <div className="space-y-1.5">
                      {item.tasks.map((task, j) => (
                        <p
                          key={j}
                          className="text-xs text-muted-foreground leading-relaxed"
                        >
                          {task}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              This is a sample strategy overview. Chat with the Strategy Agent to generate a personalized plan for your business.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
