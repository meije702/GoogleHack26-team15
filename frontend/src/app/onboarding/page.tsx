"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Building2,
  MapPin,
  Package,
  Users,
  DollarSign,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Bot,
  User,
  Volume2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface BusinessInfo {
  business_name?: string;
  location?: string;
  products?: string;
  target_audience?: string;
  monthly_budget?: string;
  marketing_goals?: string;
}

// PCM16 mono 16kHz audio processing
const SAMPLE_RATE = 16000;
const PLAYBACK_RATE = 24000;

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({});
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sourceStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const playbackContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      wsRef.current?.close();
      audioContextRef.current?.close();
      playbackContextRef.current?.close();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Audio Playback ---
  const playAudioChunk = useCallback((pcmBase64: string) => {
    try {
      const raw = atob(pcmBase64);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);

      // Convert PCM16 LE to Float32
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      audioQueueRef.current.push(float32);
      drainAudioQueue();
    } catch (e) {
      console.error("Audio decode error:", e);
    }
  }, []);

  const drainAudioQueue = useCallback(() => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    isPlayingRef.current = true;
    setIsSpeaking(true);

    const chunk = audioQueueRef.current.shift()!;

    if (!playbackContextRef.current || playbackContextRef.current.state === "closed") {
      playbackContextRef.current = new AudioContext({ sampleRate: PLAYBACK_RATE });
    }
    const ctx = playbackContextRef.current;
    const buffer = ctx.createBuffer(1, chunk.length, PLAYBACK_RATE);
    buffer.copyToChannel(new Float32Array(chunk), 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
      isPlayingRef.current = false;
      if (audioQueueRef.current.length > 0) {
        drainAudioQueue();
      } else {
        setIsSpeaking(false);
      }
    };
    source.start();
  }, []);

  // --- WebSocket ---
  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
    const ws = new WebSocket(`${wsUrl}/api/voice/onboarding`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "connected") {
          setSessionId(data.session_id);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: data.message || "Connected! I'm ready to help onboard your business. Start speaking or type below.",
              timestamp: new Date(),
            },
          ]);
        } else if (data.type === "audio") {
          // Play audio from the agent
          playAudioChunk(data.data);
        } else if (data.type === "text" || data.type === "response") {
          const text = data.text || data.content || "";
          if (text) {
            setMessages((prev) => {
              // Merge with last assistant message if it's a partial
              const last = prev[prev.length - 1];
              if (last && last.role === "assistant" && Date.now() - last.timestamp.getTime() < 2000) {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + text, timestamp: new Date() },
                ];
              }
              return [
                ...prev,
                { role: "assistant", content: text, timestamp: new Date() },
              ];
            });
            setIsLoading(false);
            extractBusinessInfo(text);
          }
        } else if (data.type === "turn_complete") {
          setIsLoading(false);
        } else if (data.type === "error") {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Error: ${data.message}`,
              timestamp: new Date(),
            },
          ]);
          setIsLoading(false);
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
    };
  }, [playAudioChunk]);

  // --- Recording ---
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      sourceStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);

      // Analyser for volume visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
        setAudioLevel(avg / 255);
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      // ScriptProcessor to capture raw PCM and send via WebSocket
      // (AudioWorklet would be better but ScriptProcessor is simpler for a demo)
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = (e) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

        const input = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const int16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
          const s = Math.max(-1, Math.min(1, input[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Base64 encode
        const bytes = new Uint8Array(int16.buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const b64 = btoa(binary);

        wsRef.current.send(JSON.stringify({ type: "audio", data: b64 }));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setAudioLevel(0);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    if (sourceStreamRef.current) {
      sourceStreamRef.current.getTracks().forEach((t) => t.stop());
      sourceStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  const handleMicToggle = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // --- Start onboarding ---
  const startOnboarding = useCallback(() => {
    setIsStarted(true);
    connect();
  }, [connect]);

  // --- Text input ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const text = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: new Date() },
    ]);
    setIsLoading(true);

    wsRef.current.send(JSON.stringify({ type: "text", text }));
  };

  // --- Business info extraction ---
  const extractBusinessInfo = (text: string) => {
    setBusinessInfo((prev) => {
      const next = { ...prev };
      const nameMatch = text.match(
        /(?:business|company|brand)\s+(?:name|called|named)\s+(?:is\s+)?["']?([^"'.!?]+)/i
      );
      if (nameMatch) next.business_name = nameMatch[1].trim();

      const locMatch = text.match(
        /(?:located|based|location)\s+(?:in|at)\s+([^.!?]+)/i
      );
      if (locMatch) next.location = locMatch[1].trim();

      const budgetMatch = text.match(/\$[\d,]+/);
      if (budgetMatch && !next.monthly_budget)
        next.monthly_budget = budgetMatch[0];

      return next;
    });
  };

  // --- UI Data ---
  const infoFields = [
    { key: "business_name", label: "Business Name", icon: Building2, color: "text-violet-400" },
    { key: "location", label: "Location", icon: MapPin, color: "text-blue-400" },
    { key: "products", label: "Products/Services", icon: Package, color: "text-emerald-400" },
    { key: "target_audience", label: "Target Audience", icon: Users, color: "text-amber-400" },
    { key: "monthly_budget", label: "Budget", icon: DollarSign, color: "text-green-400" },
    { key: "marketing_goals", label: "Goals", icon: Target, color: "text-pink-400" },
  ];

  const completedFields = infoFields.filter(
    (f) => businessInfo[f.key as keyof BusinessInfo]
  ).length;
  const progressPercent = Math.round((completedFields / infoFields.length) * 100);

  return (
    <div className="flex h-full">
      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Voice Onboarding</h1>
                <p className="text-sm text-muted-foreground">
                  Speak naturally — powered by Gemini Live Audio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isSpeaking && (
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  <Volume2 className="h-3.5 w-3.5 animate-pulse" />
                  Agent speaking...
                </div>
              )}
              {isRecording && (
                <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                  Listening...
                </div>
              )}
              {isStarted && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
                    isConnected
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  )}
                >
                  {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                  {isConnected ? "Live" : "Disconnected"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!isStarted && (
            <div className="flex h-full flex-col items-center justify-center gap-6 text-muted-foreground">
              <div className="relative">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/30">
                  <Mic className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="text-center max-w-lg">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Voice-Powered Onboarding
                </h2>
                <p className="text-sm leading-relaxed">
                  Have a natural conversation with our AI agent to set up your
                  business profile. Speak freely — the agent will listen, respond
                  with voice, and collect your business information automatically.
                </p>
                <p className="mt-2 text-xs text-muted-foreground/60">
                  Powered by Gemini Live Native Audio — real-time bidirectional voice AI
                </p>
              </div>
              <button
                onClick={startOnboarding}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-8 py-3.5 text-sm font-medium text-white transition-all hover:shadow-xl hover:shadow-violet-500/25 hover:scale-105"
              >
                <Mic className="h-4 w-4" />
                Start Voice Onboarding
              </button>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  msg.role === "user"
                    ? "bg-primary"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600"
                )}
              >
                {msg.role === "user" ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                <p className="whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {isStarted && (
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              {/* Mic Button */}
              <div className="relative">
                {isRecording && (
                  <>
                    <div
                      className="absolute inset-0 rounded-full bg-red-500/20"
                      style={{
                        transform: `scale(${1 + audioLevel * 1.2})`,
                        transition: "transform 0.1s ease-out",
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-full bg-red-500/10"
                      style={{
                        transform: `scale(${1 + audioLevel * 1.8})`,
                        transition: "transform 0.15s ease-out",
                      }}
                    />
                  </>
                )}
                <button
                  onClick={handleMicToggle}
                  disabled={!isConnected}
                  className={cn(
                    "relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300",
                    isRecording
                      ? "bg-red-500 text-white shadow-xl shadow-red-500/30 scale-110"
                      : isConnected
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:scale-105"
                      : "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                  )}
                >
                  {isRecording ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Text input */}
              <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isConnected
                      ? "Or type your message..."
                      : "Connecting..."
                  }
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-all ring-ring focus:ring-2 focus:border-primary/50"
                  disabled={isLoading || !isConnected}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !isConnected}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>

            {isRecording && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Speak naturally — the agent hears you in real time. Click the mic to stop.
              </p>
            )}
            {!isRecording && isConnected && (
              <p className="mt-2 text-center text-xs text-muted-foreground/50">
                Click the mic to start speaking, or type below.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Business Info Sidebar */}
      <div className="w-80 border-l border-border bg-card/50 p-6 overflow-y-auto">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-semibold">Business Profile</h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Information collected during onboarding
        </p>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Profile completion</span>
            <span className="font-medium text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {infoFields.map((field) => {
            const value = businessInfo[field.key as keyof BusinessInfo];
            return (
              <div
                key={field.key}
                className={cn(
                  "rounded-xl border p-3.5 transition-all duration-300",
                  value
                    ? "border-primary/30 bg-primary/5 shadow-sm"
                    : "border-border hover:border-border/80"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <field.icon
                      className={cn("h-3.5 w-3.5", value ? field.color : "")}
                    />
                    {field.label}
                  </div>
                  {value && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  )}
                </div>
                <p className="mt-1.5 text-sm font-medium">
                  {value || (
                    <span className="text-muted-foreground/40 font-normal">
                      Waiting for input...
                    </span>
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {progressPercent === 100 && (
          <Link
            href="/strategy"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
          >
            Continue to Strategy
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        {sessionId && (
          <p className="mt-6 text-center text-[10px] text-muted-foreground/50">
            Session: {sessionId.slice(0, 8)}...
          </p>
        )}
      </div>
    </div>
  );
}
