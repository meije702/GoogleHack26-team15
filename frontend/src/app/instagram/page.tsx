"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { formatNumber, timeAgo } from "@/lib/utils";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  Plus,
  X,
  TrendingUp,
  Eye,
  Users,
  BarChart3,
  Search,
  Loader2,
  Image as ImageIcon,
  Home,
  Compass,
  Film,
  Bell,
  PlusSquare,
  Menu,
  ChevronLeft,
  ChevronRight,
  Smile,
  Bot,
  Sparkles,
  Share2,
  UserPlus,
  Settings,
  Activity,
  Zap,
} from "lucide-react";
import { getInstagramPosts, createInstagramPost, type InstagramPost } from "@/lib/api";
import { Chat } from "@/components/chat";

// ---- Mock data for demo when backend is not running ----

const MOCK_STORIES = [
  { id: "your-story", username: "Your story", avatar: "", isYou: true, hasNew: false },
  { id: "s1", username: "tech_daily", avatar: "TD", hasNew: true, isYou: false },
  { id: "s2", username: "ai_insights", avatar: "AI", hasNew: true, isYou: false },
  { id: "s3", username: "design_lab", avatar: "DL", hasNew: true, isYou: false },
  { id: "s4", username: "startup_hub", avatar: "SH", hasNew: true, isYou: false },
  { id: "s5", username: "growth_tips", avatar: "GT", hasNew: true, isYou: false },
  { id: "s6", username: "brand_voice", avatar: "BV", hasNew: true, isYou: false },
  { id: "s7", username: "viral_mktg", avatar: "VM", hasNew: false, isYou: false },
  { id: "s8", username: "seo_master", avatar: "SM", hasNew: false, isYou: false },
];

const MOCK_POSTS: InstagramPost[] = [
  {
    id: "p1",
    image_url: "https://picsum.photos/seed/marketing1/600/600",
    caption:
      "Revolutionizing marketing with AI agents. Our multi-agent system handles everything from strategy to content creation to Instagram management. The future of marketing is autonomous.",
    hashtags: ["#AIMarketing", "#FutureOfMarketing", "#MarketingAutomation", "#AI", "#GoogleADK"],
    likes: 2847,
    saves: 342,
    shares: 128,
    reach: 15200,
    impressions: 28400,
    comments: [
      {
        id: "c1",
        username: "tech_enthusiast",
        text: "This is incredible! How do the agents coordinate with each other?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        likes: 24,
        avatar_url: "",
        replies: [
          {
            id: "r1",
            username: "marketing_ai_agency",
            text: "They use Google's ADK for orchestration! Each agent specializes in a specific task.",
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            likes: 12,
          },
        ],
      },
      {
        id: "c2",
        username: "digital_sarah",
        text: "Been following your journey. The progress is amazing!",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        likes: 18,
        avatar_url: "",
        replies: [],
      },
      {
        id: "c3",
        username: "growth_hacker_pro",
        text: "Would love to see a case study on the results you are getting",
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        likes: 31,
        avatar_url: "",
        replies: [],
      },
    ],
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    comment_count: 3,
  },
  {
    id: "p2",
    image_url: "https://picsum.photos/seed/strategy2/600/600",
    caption:
      "Behind the scenes: our Strategy Agent uses Google Search grounding to research industry trends in real-time. No more guessing -- pure data-driven decisions.",
    hashtags: ["#DataDriven", "#MarketingStrategy", "#GeminiAI", "#Innovation"],
    likes: 1923,
    saves: 256,
    shares: 87,
    reach: 11800,
    impressions: 21500,
    comments: [
      {
        id: "c4",
        username: "startup_founder",
        text: "This is exactly what we needed for our launch strategy!",
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        likes: 15,
        avatar_url: "",
        replies: [],
      },
      {
        id: "c5",
        username: "marketing_mike",
        text: "The grounding feature is game-changing. Real-time data in strategy creation.",
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        likes: 22,
        avatar_url: "",
        replies: [],
      },
    ],
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    comment_count: 2,
  },
  {
    id: "p3",
    image_url: "https://picsum.photos/seed/content3/600/600",
    caption:
      "Content creation at scale. Our AI generates platform-specific content -- from blog posts to Instagram captions to LinkedIn articles. One brief, infinite content.",
    hashtags: ["#ContentCreation", "#AIContent", "#ScaleUp", "#MarketingAI"],
    likes: 3456,
    saves: 498,
    shares: 201,
    reach: 22100,
    impressions: 38700,
    comments: [
      {
        id: "c6",
        username: "content_queen",
        text: "Love the multi-platform approach! This saves so much time.",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        likes: 45,
        avatar_url: "",
        replies: [],
      },
    ],
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    comment_count: 1,
  },
  {
    id: "p4",
    image_url: "https://picsum.photos/seed/voice4/600/600",
    caption:
      "Voice-first onboarding: Just talk to our AI and it builds your complete marketing profile. Powered by Gemini Live API for natural, conversational intake.",
    hashtags: ["#VoiceAI", "#Onboarding", "#GeminiLive", "#ConversationalAI"],
    likes: 1654,
    saves: 189,
    shares: 67,
    reach: 9800,
    impressions: 17600,
    comments: [
      {
        id: "c7",
        username: "ux_designer",
        text: "The voice UX is so smooth! This is the future of B2B onboarding.",
        timestamp: new Date(Date.now() - 57600000).toISOString(),
        likes: 19,
        avatar_url: "",
        replies: [],
      },
      {
        id: "c8",
        username: "product_mgr",
        text: "How accurate is the transcription?",
        timestamp: new Date(Date.now() - 64800000).toISOString(),
        likes: 8,
        avatar_url: "",
        replies: [
          {
            id: "r2",
            username: "marketing_ai_agency",
            text: "Very accurate! Gemini handles it natively with context awareness.",
            timestamp: new Date(Date.now() - 61200000).toISOString(),
            likes: 5,
          },
        ],
      },
    ],
    timestamp: new Date(Date.now() - 72000000).toISOString(),
    comment_count: 2,
  },
];

const SUGGESTED_ACCOUNTS = [
  { name: "growth_hacker_pro", label: "Growth Expert", mutual: 12, avatar: "GH" },
  { name: "social_media_daily", label: "Social Media Tips", mutual: 8, avatar: "SM" },
  { name: "content_king_99", label: "Content Creator", mutual: 15, avatar: "CK" },
  { name: "digital_nomad_mkt", label: "Digital Marketing", mutual: 6, avatar: "DN" },
  { name: "ai_startup_hub", label: "AI Startups", mutual: 21, avatar: "AS" },
];

const AGENT_ACTIVITIES = [
  {
    agent: "Research Agent",
    action: "Analyzed trending hashtags in #AIMarketing niche",
    time: "2m ago",
    icon: Search,
    color: "text-blue-400",
  },
  {
    agent: "Content Agent",
    action: "Generated 3 new caption variants for next post",
    time: "5m ago",
    icon: Sparkles,
    color: "text-violet-400",
  },
  {
    agent: "Engagement Agent",
    action: "Replied to 12 comments with personalized responses",
    time: "8m ago",
    icon: MessageCircle,
    color: "text-emerald-400",
  },
  {
    agent: "Analytics Agent",
    action: "Updated performance metrics for all posts",
    time: "15m ago",
    icon: BarChart3,
    color: "text-amber-400",
  },
  {
    agent: "Research Agent",
    action: "Identified 5 competitor strategies worth adapting",
    time: "22m ago",
    icon: Eye,
    color: "text-blue-400",
  },
  {
    agent: "Content Agent",
    action: "Scheduled carousel post for tomorrow 10 AM",
    time: "30m ago",
    icon: ImageIcon,
    color: "text-violet-400",
  },
];

// ---- IG Nav sidebar items ----

const igNavItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Search, label: "Search", active: false },
  { icon: Compass, label: "Explore", active: false },
  { icon: Film, label: "Reels", active: false },
  { icon: Send, label: "Messages", active: false },
  { icon: Bell, label: "Notifications", active: false },
  { icon: PlusSquare, label: "Create", active: false },
];

// ---- Component ----

export default function InstagramPage() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"feed" | "insights" | "ai">("feed");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [likeAnimations, setLikeAnimations] = useState<Set<string>>(new Set());
  const [createCaption, setCreateCaption] = useState("");
  const [createHashtags, setCreateHashtags] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [followedAccounts, setFollowedAccounts] = useState<Set<string>>(new Set());
  const storiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const data = await getInstagramPosts();
      setPosts(data.length > 0 ? data : MOCK_POSTS);
    } catch {
      setPosts(MOCK_POSTS);
    } finally {
      setLoading(false);
    }
  }

  function toggleLike(postId: string) {
    // Trigger heart animation
    setLikeAnimations((prev) => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
    setTimeout(() => {
      setLikeAnimations((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }, 600);

    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPosts((p) =>
          p.map((post) =>
            post.id === postId ? { ...post, likes: post.likes - 1 } : post
          )
        );
      } else {
        next.add(postId);
        setPosts((p) =>
          p.map((post) =>
            post.id === postId ? { ...post, likes: post.likes + 1 } : post
          )
        );
      }
      return next;
    });
  }

  function doubleTapLike(postId: string) {
    if (!likedPosts.has(postId)) {
      toggleLike(postId);
    } else {
      // Show animation even if already liked
      setLikeAnimations((prev) => {
        const next = new Set(prev);
        next.add(postId);
        return next;
      });
      setTimeout(() => {
        setLikeAnimations((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      }, 600);
    }
  }

  function toggleSave(postId: string) {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function toggleComments(postId: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  function scrollStories(direction: "left" | "right") {
    if (storiesRef.current) {
      const amount = direction === "left" ? -200 : 200;
      storiesRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  }

  async function handleCreatePost() {
    if (!createCaption.trim()) return;
    setIsCreating(true);
    try {
      const hashtags = createHashtags
        .split(/\s+/)
        .filter((h) => h.startsWith("#"))
        .map((h) => h.trim());
      const newPost = await createInstagramPost(
        `https://picsum.photos/seed/${Date.now()}/600/600`,
        createCaption,
        hashtags
      );
      setPosts((prev) => [newPost, ...prev]);
      setShowCreateDialog(false);
      setCreateCaption("");
      setCreateHashtags("");
    } catch {
      // Create a local mock post if backend fails
      const newPost: InstagramPost = {
        id: `local-${Date.now()}`,
        image_url: `https://picsum.photos/seed/${Date.now()}/600/600`,
        caption: createCaption,
        hashtags: createHashtags.split(/\s+/).filter((h) => h.startsWith("#")),
        likes: 0,
        saves: 0,
        shares: 0,
        reach: 0,
        impressions: 0,
        comments: [],
        timestamp: new Date().toISOString(),
        comment_count: 0,
      };
      setPosts((prev) => [newPost, ...prev]);
      setShowCreateDialog(false);
      setCreateCaption("");
      setCreateHashtags("");
    } finally {
      setIsCreating(false);
    }
  }

  const totalLikes = posts.reduce((a, p) => a + p.likes, 0);
  const totalComments = posts.reduce((a, p) => a + p.comment_count, 0);
  const totalReach = posts.reduce((a, p) => a + (p.reach || 0), 0);
  const totalImpressions = posts.reduce((a, p) => a + (p.impressions || 0), 0);
  const totalSaves = posts.reduce((a, p) => a + (p.saves || 0), 0);
  const engagementRate =
    totalImpressions > 0
      ? (((totalLikes + totalComments + totalSaves) / totalImpressions) * 100).toFixed(1)
      : "0";

  return (
    <div className="flex h-full bg-black">
      {/* IG Left Sidebar Navigation */}
      <div className="flex w-[220px] flex-col border-r border-[#262626] bg-black px-3 py-6">
        {/* Instagram Logo */}
        <div className="mb-8 px-3">
          <h1 className="text-2xl font-semibold italic text-[#f5f5f5] tracking-tight">
            Instagram
          </h1>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1">
          {igNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.label === "Create") setShowCreateDialog(true);
              }}
              className={cn(
                "flex w-full items-center gap-4 rounded-lg px-3 py-3 text-sm transition-all hover:bg-[#1a1a1a]",
                item.active
                  ? "font-bold text-[#f5f5f5]"
                  : "font-normal text-[#f5f5f5]"
              )}
            >
              <item.icon
                className={cn("h-6 w-6", item.active ? "stroke-[2.5]" : "stroke-[1.5]")}
              />
              {item.label}
            </button>
          ))}

          {/* Profile */}
          <button className="flex w-full items-center gap-4 rounded-lg px-3 py-3 text-sm font-normal text-[#f5f5f5] transition-all hover:bg-[#1a1a1a]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[1.5px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-[8px] font-bold text-white">
                MA
              </div>
            </div>
            Profile
          </button>
        </nav>

        {/* Agent Switcher at bottom */}
        <div className="border-t border-[#262626] pt-4">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[#a8a8a8]">
            View Mode
          </div>
          <div className="space-y-0.5">
            {(["feed", "insights", "ai"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all",
                  activeTab === tab
                    ? "bg-[#262626] font-semibold text-white"
                    : "text-[#a8a8a8] hover:bg-[#1a1a1a] hover:text-white"
                )}
              >
                {tab === "feed" && <Home className="h-4 w-4" />}
                {tab === "insights" && <BarChart3 className="h-4 w-4" />}
                {tab === "ai" && <Bot className="h-4 w-4" />}
                {tab === "ai" ? "AI Agent" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Menu */}
        <button className="mt-4 flex w-full items-center gap-4 rounded-lg px-3 py-3 text-sm text-[#f5f5f5] transition-all hover:bg-[#1a1a1a]">
          <Menu className="h-6 w-6 stroke-[1.5]" />
          More
        </button>
      </div>

      {/* ---- Main Content Area ---- */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Feed Tab */}
        {activeTab === "feed" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Feed */}
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-[470px] py-4">
                {/* Stories Bar */}
                <div className="relative mb-4 rounded-lg border border-[#262626] bg-black py-4">
                  <button
                    onClick={() => scrollStories("left")}
                    className="absolute left-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-md hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div
                    ref={storiesRef}
                    className="scrollbar-hide flex gap-4 overflow-x-auto px-4"
                  >
                    {MOCK_STORIES.map((story) => (
                      <div
                        key={story.id}
                        className="flex flex-col items-center gap-1"
                      >
                        <div
                          className={cn(
                            "flex h-16 w-16 shrink-0 items-center justify-center rounded-full p-[3px]",
                            story.isYou
                              ? "bg-[#262626]"
                              : story.hasNew
                              ? "story-ring"
                              : "bg-[#363636]"
                          )}
                        >
                          <div className="relative flex h-full w-full items-center justify-center rounded-full bg-black text-xs font-bold text-[#a8a8a8]">
                            {story.isYou ? (
                              <>
                                MA
                                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-black bg-[#0095f6]">
                                  <Plus className="h-3 w-3 text-white" />
                                </div>
                              </>
                            ) : (
                              story.avatar
                            )}
                          </div>
                        </div>
                        <span className="max-w-[66px] truncate text-[11px] text-[#f5f5f5]">
                          {story.isYou ? "Your story" : story.username}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => scrollStories("right")}
                    className="absolute right-1 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-md hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Posts */}
                {loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#a8a8a8]" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center text-[#a8a8a8]">
                    <ImageIcon className="mb-2 h-8 w-8" />
                    <p className="text-sm">No posts yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className="border-b border-[#262626] pb-4"
                      >
                        {/* Post Header */}
                        <div className="flex items-center justify-between px-0 py-2">
                          <div className="flex items-center gap-3">
                            <div className="story-ring flex h-9 w-9 items-center justify-center rounded-full p-[2px]">
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                                MA
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#f5f5f5]">
                                marketing_ai_agency
                              </p>
                              <p className="text-[11px] text-[#a8a8a8]">
                                Original
                              </p>
                            </div>
                          </div>
                          <button className="text-[#f5f5f5] hover:text-[#a8a8a8]">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Post Image with double-tap to like */}
                        <div
                          className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-[4px] bg-[#121212]"
                          onDoubleClick={() => doubleTapLike(post.id)}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.image_url}
                            alt="Post"
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          {/* Double-tap heart animation */}
                          {likeAnimations.has(post.id) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Heart className="h-24 w-24 animate-heart-beat fill-white text-white drop-shadow-2xl" />
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleLike(post.id)}
                              className="transition-transform active:scale-110"
                            >
                              <Heart
                                className={cn(
                                  "h-6 w-6 transition-colors",
                                  likedPosts.has(post.id)
                                    ? "fill-[#ff3040] text-[#ff3040]"
                                    : "text-[#f5f5f5] hover:text-[#a8a8a8]"
                                )}
                              />
                            </button>
                            <button
                              onClick={() => setSelectedPost(post)}
                              className="text-[#f5f5f5] hover:text-[#a8a8a8] transition-colors"
                            >
                              <MessageCircle className="h-6 w-6" />
                            </button>
                            <button className="text-[#f5f5f5] hover:text-[#a8a8a8] transition-colors">
                              <Send className="h-5 w-5 -rotate-12" />
                            </button>
                          </div>
                          <button
                            onClick={() => toggleSave(post.id)}
                            className="transition-transform active:scale-110"
                          >
                            <Bookmark
                              className={cn(
                                "h-6 w-6 transition-colors",
                                savedPosts.has(post.id)
                                  ? "fill-[#f5f5f5] text-[#f5f5f5]"
                                  : "text-[#f5f5f5] hover:text-[#a8a8a8]"
                              )}
                            />
                          </button>
                        </div>

                        {/* Likes */}
                        <p className="text-sm font-semibold text-[#f5f5f5]">
                          {formatNumber(post.likes)} likes
                        </p>

                        {/* Caption */}
                        <div className="mt-1">
                          <p className="text-sm text-[#f5f5f5]">
                            <span className="mr-1 font-semibold">
                              marketing_ai_agency
                            </span>
                            {post.caption}
                          </p>
                          {post.hashtags.length > 0 && (
                            <p className="mt-1 text-sm text-[#e0f1ff]">
                              {post.hashtags.join(" ")}
                            </p>
                          )}
                        </div>

                        {/* View Comments */}
                        {post.comment_count > 0 && (
                          <div className="mt-1">
                            <button
                              onClick={() => toggleComments(post.id)}
                              className="text-sm text-[#a8a8a8]"
                            >
                              {expandedComments.has(post.id)
                                ? "Hide comments"
                                : `View all ${post.comment_count} comments`}
                            </button>
                            {expandedComments.has(post.id) && (
                              <div className="mt-2 space-y-2">
                                {post.comments.map((comment) => (
                                  <div key={comment.id}>
                                    <p className="text-sm text-[#f5f5f5]">
                                      <span className="mr-1.5 font-semibold">
                                        {comment.username}
                                      </span>
                                      {comment.text}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-3 text-xs text-[#a8a8a8]">
                                      <span>{timeAgo(comment.timestamp)}</span>
                                      <span>
                                        {comment.likes} likes
                                      </span>
                                      <button className="font-semibold">
                                        Reply
                                      </button>
                                    </div>
                                    {/* Replies */}
                                    {comment.replies.length > 0 && (
                                      <div className="ml-6 mt-2 space-y-1.5">
                                        {comment.replies.map((reply) => (
                                          <div key={reply.id}>
                                            <p className="text-sm text-[#f5f5f5]">
                                              <span className="mr-1.5 font-semibold text-[#e0f1ff]">
                                                {reply.username}
                                              </span>
                                              {reply.text}
                                            </p>
                                            <div className="mt-0.5 flex items-center gap-3 text-xs text-[#a8a8a8]">
                                              <span>{timeAgo(reply.timestamp)}</span>
                                              <span>{reply.likes} likes</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Timestamp */}
                        <p className="mt-1 text-[10px] uppercase text-[#a8a8a8]">
                          {timeAgo(post.timestamp)}
                        </p>

                        {/* Comment Input */}
                        <div className="mt-2 flex items-center gap-3">
                          <Smile className="h-5 w-5 text-[#a8a8a8]" />
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            className="flex-1 bg-transparent text-sm text-[#f5f5f5] outline-none placeholder:text-[#a8a8a8]"
                          />
                          {commentInputs[post.id]?.trim() && (
                            <button className="text-sm font-semibold text-[#0095f6] hover:text-white transition-colors">
                              Post
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-[320px] border-l border-[#262626] bg-black p-6 overflow-y-auto">
              {/* Profile Card */}
              <div className="mb-6 flex items-center gap-3">
                <div className="story-ring flex h-14 w-14 shrink-0 items-center justify-center rounded-full p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                    MA
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#f5f5f5]">
                    marketing_ai_agency
                  </p>
                  <p className="text-sm text-[#a8a8a8]">Marketing AI Agency</p>
                </div>
                <button className="text-xs font-semibold text-[#0095f6] hover:text-white transition-colors">
                  Switch
                </button>
              </div>

              {/* Account Stats */}
              <div className="mb-6 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-[#121212] p-2.5">
                  <p className="text-sm font-bold text-[#f5f5f5]">
                    {posts.length}
                  </p>
                  <p className="text-[10px] text-[#a8a8a8]">Posts</p>
                </div>
                <div className="rounded-lg bg-[#121212] p-2.5">
                  <p className="text-sm font-bold text-[#f5f5f5]">2.4k</p>
                  <p className="text-[10px] text-[#a8a8a8]">Followers</p>
                </div>
                <div className="rounded-lg bg-[#121212] p-2.5">
                  <p className="text-sm font-bold text-[#f5f5f5]">186</p>
                  <p className="text-[10px] text-[#a8a8a8]">Following</p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="mb-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#a8a8a8]">
                    Suggested for you
                  </p>
                  <button className="text-xs font-semibold text-[#f5f5f5] hover:text-[#a8a8a8]">
                    See All
                  </button>
                </div>
                <div className="space-y-3">
                  {SUGGESTED_ACCOUNTS.map((account) => (
                    <div
                      key={account.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#262626] text-xs font-bold text-[#a8a8a8]">
                          {account.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#f5f5f5]">
                            {account.name}
                          </p>
                          <p className="text-xs text-[#a8a8a8]">
                            Followed by {account.mutual} others
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setFollowedAccounts((prev) => {
                            const next = new Set(prev);
                            if (next.has(account.name)) next.delete(account.name);
                            else next.add(account.name);
                            return next;
                          })
                        }
                        className={cn(
                          "text-xs font-semibold transition-colors",
                          followedAccounts.has(account.name)
                            ? "text-[#a8a8a8]"
                            : "text-[#0095f6] hover:text-white"
                        )}
                      >
                        {followedAccounts.has(account.name) ? "Following" : "Follow"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Hashtags */}
              <div className="mb-6 border-t border-[#262626] pt-4">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-[#a8a8a8]" />
                  <p className="text-sm font-semibold text-[#a8a8a8]">
                    Trending
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "#AIMarketing",
                    "#DigitalMarketing",
                    "#ContentCreator",
                    "#SocialMedia",
                    "#GrowthHacking",
                    "#BrandStrategy",
                    "#MarketingTips",
                    "#Entrepreneurship",
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="cursor-pointer rounded-full bg-[#121212] px-2.5 py-1 text-xs text-[#e0f1ff] hover:bg-[#262626] transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Links */}
              <div className="text-[11px] text-[#363636] leading-relaxed">
                About &middot; Help &middot; Press &middot; API &middot; Jobs
                &middot; Privacy &middot; Terms &middot; Locations
                <p className="mt-3">&copy; 2025 MARKETING AI AGENCY</p>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div className="flex-1 overflow-y-auto bg-black p-6">
            <div className="mx-auto max-w-3xl">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#f5f5f5]">
                  Insights
                </h2>
                <div className="flex items-center gap-2 rounded-lg bg-[#262626] px-3 py-1.5 text-xs text-[#a8a8a8]">
                  <Activity className="h-3.5 w-3.5" />
                  Last 30 days
                </div>
              </div>

              {/* Top Metrics */}
              <div className="mb-6 grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Accounts Reached",
                    value: formatNumber(totalReach),
                    change: "+12.3%",
                    positive: true,
                    icon: Users,
                  },
                  {
                    label: "Accounts Engaged",
                    value: formatNumber(totalLikes + totalComments),
                    change: "+8.7%",
                    positive: true,
                    icon: Heart,
                  },
                  {
                    label: "Engagement Rate",
                    value: `${engagementRate}%`,
                    change: "+2.1%",
                    positive: true,
                    icon: TrendingUp,
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-xl border border-[#262626] bg-[#121212] p-5"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <metric.icon className="h-5 w-5 text-[#a8a8a8]" />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          metric.positive ? "text-[#58c472]" : "text-[#ff3040]"
                        )}
                      >
                        {metric.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-[#f5f5f5]">
                      {metric.value}
                    </p>
                    <p className="mt-0.5 text-xs text-[#a8a8a8]">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Detailed Stats Grid */}
              <div className="mb-6 grid grid-cols-6 gap-3">
                {[
                  { label: "Likes", value: formatNumber(totalLikes), icon: Heart, color: "text-[#ff3040]" },
                  { label: "Comments", value: formatNumber(totalComments), icon: MessageCircle, color: "text-[#0095f6]" },
                  { label: "Saves", value: formatNumber(totalSaves), icon: Bookmark, color: "text-[#f5f5f5]" },
                  { label: "Shares", value: formatNumber(posts.reduce((a, p) => a + p.shares, 0)), icon: Share2, color: "text-[#58c472]" },
                  { label: "Reach", value: formatNumber(totalReach), icon: Eye, color: "text-[#a855f7]" },
                  { label: "Impressions", value: formatNumber(totalImpressions), icon: BarChart3, color: "text-[#f59e0b]" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-[#262626] bg-[#121212] p-4 text-center"
                  >
                    <stat.icon className={cn("mx-auto mb-2 h-5 w-5", stat.color)} />
                    <p className="text-lg font-bold text-[#f5f5f5]">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-[#a8a8a8]">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Post Performance Table */}
              <div className="rounded-xl border border-[#262626] bg-[#121212] p-5">
                <h3 className="mb-4 text-sm font-semibold text-[#f5f5f5]">
                  Post Performance
                </h3>
                <div className="space-y-3">
                  {posts.map((post, idx) => (
                    <div
                      key={post.id}
                      className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-[#1a1a1a]"
                    >
                      <span className="w-5 text-center text-xs font-bold text-[#a8a8a8]">
                        {idx + 1}
                      </span>
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-[#262626]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-[#f5f5f5]">
                          {post.caption.slice(0, 50)}...
                        </p>
                        <p className="text-xs text-[#a8a8a8]">
                          {timeAgo(post.timestamp)}
                        </p>
                      </div>
                      <div className="flex gap-6 text-center">
                        <div>
                          <p className="text-sm font-bold text-[#f5f5f5]">
                            {formatNumber(post.likes)}
                          </p>
                          <p className="text-[10px] text-[#a8a8a8]">Likes</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#f5f5f5]">
                            {post.comment_count}
                          </p>
                          <p className="text-[10px] text-[#a8a8a8]">
                            Comments
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#f5f5f5]">
                            {formatNumber(post.saves || 0)}
                          </p>
                          <p className="text-[10px] text-[#a8a8a8]">Saves</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#f5f5f5]">
                            {formatNumber(post.reach || 0)}
                          </p>
                          <p className="text-[10px] text-[#a8a8a8]">Reach</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Agent Tab */}
        {activeTab === "ai" && (
          <div className="flex flex-1 overflow-hidden">
            {/* Chat */}
            <div className="flex flex-1 flex-col bg-[#000000]">
              <Chat
                agentName="instagram"
                placeholder="Ask the Instagram AI agent..."
                className="flex-1 [&_*]:!border-[#262626]"
                quickPrompts={[
                  "Suggest hashtags for my next post",
                  "What time should I post for maximum engagement?",
                  "Analyze my competitor @techstartup",
                  "Write a caption for a product announcement",
                ]}
              />
            </div>

            {/* Agent Activity Feed */}
            <div className="w-[300px] border-l border-[#262626] bg-black p-4 overflow-y-auto">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-[#f5f5f5]">
                  Agent Activity
                </h3>
              </div>
              <div className="space-y-3">
                {AGENT_ACTIVITIES.map((activity, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#262626] bg-[#121212] p-3"
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <activity.icon
                        className={cn("h-3.5 w-3.5", activity.color)}
                      />
                      <span className="text-xs font-semibold text-[#f5f5f5]">
                        {activity.agent}
                      </span>
                      <span className="ml-auto text-[10px] text-[#a8a8a8]">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-xs text-[#a8a8a8] leading-relaxed">
                      {activity.action}
                    </p>
                  </div>
                ))}
              </div>

              {/* Agent Status */}
              <div className="mt-6 rounded-lg border border-[#262626] bg-[#121212] p-3">
                <h4 className="mb-3 text-xs font-semibold text-[#f5f5f5]">
                  Sub-Agent Status
                </h4>
                <div className="space-y-2">
                  {[
                    { name: "Research Agent", status: "Active", color: "bg-[#58c472]" },
                    { name: "Content Agent", status: "Active", color: "bg-[#58c472]" },
                    { name: "Engagement Agent", status: "Idle", color: "bg-[#f59e0b]" },
                  ].map((agent) => (
                    <div
                      key={agent.name}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-[#a8a8a8]">
                        {agent.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn("h-1.5 w-1.5 rounded-full", agent.color)}
                        />
                        <span className="text-[10px] text-[#a8a8a8]">
                          {agent.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedPost(null)}
        >
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute right-4 top-4 text-white hover:text-[#a8a8a8]"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="flex h-[80vh] max-h-[700px] w-full max-w-4xl overflow-hidden rounded-lg border border-[#262626] bg-[#000]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Side */}
            <div className="flex flex-1 items-center justify-center bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPost.image_url}
                alt="Post"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Comments Side */}
            <div className="flex w-[340px] flex-col border-l border-[#262626]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#262626] px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="story-ring flex h-8 w-8 items-center justify-center rounded-full p-[2px]">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                      MA
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#f5f5f5]">
                    marketing_ai_agency
                  </span>
                </div>
                <button className="text-[#f5f5f5]">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </div>

              {/* Comments List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Caption as first comment */}
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#262626] text-[9px] font-bold text-[#a8a8a8]">
                    MA
                  </div>
                  <div>
                    <p className="text-sm text-[#f5f5f5]">
                      <span className="mr-1.5 font-semibold">
                        marketing_ai_agency
                      </span>
                      {selectedPost.caption}
                    </p>
                    {selectedPost.hashtags.length > 0 && (
                      <p className="mt-1 text-sm text-[#e0f1ff]">
                        {selectedPost.hashtags.join(" ")}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[#a8a8a8]">
                      {timeAgo(selectedPost.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Comments */}
                {selectedPost.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#262626] text-[9px] font-bold text-[#a8a8a8]">
                      {comment.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#f5f5f5]">
                        <span className="mr-1.5 font-semibold">
                          {comment.username}
                        </span>
                        {comment.text}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-[#a8a8a8]">
                        <span>{timeAgo(comment.timestamp)}</span>
                        <span>{comment.likes} likes</span>
                        <button className="font-semibold">Reply</button>
                      </div>

                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#262626] text-[8px] font-bold text-[#a8a8a8]">
                                {reply.username[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm text-[#f5f5f5]">
                                  <span className="mr-1.5 font-semibold">
                                    {reply.username}
                                  </span>
                                  {reply.text}
                                </p>
                                <div className="mt-0.5 flex items-center gap-3 text-xs text-[#a8a8a8]">
                                  <span>{timeAgo(reply.timestamp)}</span>
                                  <span>{reply.likes} likes</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="shrink-0 self-start pt-1">
                      <Heart className="h-3 w-3 text-[#a8a8a8] hover:text-[#ff3040]" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="border-t border-[#262626]">
                <div className="flex items-center justify-between px-4 py-2">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleLike(selectedPost.id)}>
                      <Heart
                        className={cn(
                          "h-6 w-6",
                          likedPosts.has(selectedPost.id)
                            ? "fill-[#ff3040] text-[#ff3040]"
                            : "text-[#f5f5f5]"
                        )}
                      />
                    </button>
                    <MessageCircle className="h-6 w-6 text-[#f5f5f5]" />
                    <Send className="h-5 w-5 -rotate-12 text-[#f5f5f5]" />
                  </div>
                  <button onClick={() => toggleSave(selectedPost.id)}>
                    <Bookmark
                      className={cn(
                        "h-6 w-6",
                        savedPosts.has(selectedPost.id)
                          ? "fill-[#f5f5f5] text-[#f5f5f5]"
                          : "text-[#f5f5f5]"
                      )}
                    />
                  </button>
                </div>
                <p className="px-4 text-sm font-semibold text-[#f5f5f5]">
                  {formatNumber(selectedPost.likes)} likes
                </p>
                <p className="px-4 pb-2 text-[10px] uppercase text-[#a8a8a8]">
                  {timeAgo(selectedPost.timestamp)}
                </p>
              </div>

              {/* Comment Input */}
              <div className="flex items-center gap-3 border-t border-[#262626] px-4 py-3">
                <Smile className="h-6 w-6 text-[#a8a8a8]" />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-sm text-[#f5f5f5] outline-none placeholder:text-[#a8a8a8]"
                />
                <button className="text-sm font-semibold text-[#0095f6] opacity-50">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Dialog */}
      {showCreateDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setShowCreateDialog(false)}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-[#262626] bg-[#262626]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#363636] px-4 py-3">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="text-sm text-[#f5f5f5]"
              >
                Cancel
              </button>
              <h2 className="text-sm font-semibold text-[#f5f5f5]">
                Create new post
              </h2>
              <button
                onClick={handleCreatePost}
                disabled={!createCaption.trim() || isCreating}
                className="text-sm font-semibold text-[#0095f6] hover:text-white disabled:opacity-50 transition-colors"
              >
                {isCreating ? "Sharing..." : "Share"}
              </button>
            </div>
            <div className="p-4">
              {/* Image Upload Area */}
              <div className="mb-4 flex aspect-video items-center justify-center rounded-lg border border-dashed border-[#363636] bg-[#121212]">
                <div className="text-center text-[#a8a8a8]">
                  <ImageIcon className="mx-auto mb-2 h-12 w-12 opacity-50" />
                  <p className="text-sm">Drag photos here or click to upload</p>
                  <p className="mt-1 text-xs text-[#a8a8a8]/60">
                    AI will generate an image for your post
                  </p>
                </div>
              </div>

              {/* Caption */}
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#363636] text-[9px] font-bold text-[#a8a8a8]">
                  MA
                </div>
                <textarea
                  placeholder="Write a caption..."
                  value={createCaption}
                  onChange={(e) => setCreateCaption(e.target.value)}
                  className="flex-1 resize-none bg-transparent text-sm text-[#f5f5f5] outline-none placeholder:text-[#a8a8a8]"
                  rows={4}
                />
              </div>

              {/* Hashtags */}
              <input
                type="text"
                placeholder="Add hashtags (e.g. #AIMarketing #Growth)"
                value={createHashtags}
                onChange={(e) => setCreateHashtags(e.target.value)}
                className="w-full rounded-lg border border-[#363636] bg-[#121212] px-3 py-2.5 text-sm text-[#f5f5f5] outline-none placeholder:text-[#a8a8a8] focus:border-[#a8a8a8]"
              />

              {/* AI Generate Button */}
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-sm font-medium text-white transition-all hover:from-purple-500 hover:to-pink-500">
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
