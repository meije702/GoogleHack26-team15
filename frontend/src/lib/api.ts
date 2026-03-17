const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ---- Types ----

export interface ChatResponse {
  response: string;
  session_id: string;
}

export interface InstagramComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  likes: number;
  avatar_url?: string;
  replies: {
    id: string;
    username: string;
    text: string;
    timestamp: string;
    likes: number;
  }[];
}

export interface InstagramPost {
  id: string;
  image_url: string;
  caption: string;
  hashtags: string[];
  likes: number;
  saves: number;
  shares: number;
  reach: number;
  impressions: number;
  comments: InstagramComment[];
  timestamp: string;
  comment_count: number;
}

export interface BusinessProfile {
  business_name?: string;
  industry?: string;
  location?: string;
  products?: string;
  target_audience?: string;
  monthly_budget?: string;
  marketing_goals?: string;
  unique_selling_points?: string;
}

export interface StrategyData {
  goals: string[];
  channels: string[];
  budget_allocation: Record<string, number>;
  kpis: string[];
  timeline: { phase: string; weeks: string; tasks: string[] }[];
}

// ---- API Functions ----

export async function sendChatMessage(
  agentName: string,
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat/${agentName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}

export async function getInstagramPosts(): Promise<InstagramPost[]> {
  const res = await fetch(`${API_BASE}/api/instagram/posts`);
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  return res.json();
}

export async function createInstagramPost(
  imageUrl: string,
  caption: string,
  hashtags: string[]
): Promise<InstagramPost> {
  const res = await fetch(`${API_BASE}/api/instagram/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption, hashtags }),
  });
  if (!res.ok) throw new Error(`Failed to create post: ${res.status}`);
  return res.json();
}

export async function healthCheck(): Promise<{
  status: string;
  version: string;
}> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export function createOnboardingWebSocket(): WebSocket {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const wsUrl = apiUrl
    ? apiUrl.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://")
    : `wss://${typeof window !== "undefined" ? window.location.host : ""}`;
  return new WebSocket(`${wsUrl}/api/voice/onboarding`);
}
