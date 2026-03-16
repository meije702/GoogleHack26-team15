"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Bot, User, Sparkles, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { sendChatMessage } from "@/lib/api";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatProps {
  agentName: string;
  placeholder?: string;
  className?: string;
  systemGreeting?: string;
  quickPrompts?: string[];
  onSendMessage?: (message: string) => void;
}

export function Chat({
  agentName,
  placeholder = "Type a message...",
  className,
  systemGreeting,
  quickPrompts,
  onSendMessage,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(() =>
    systemGreeting
      ? [{ role: "assistant", content: systemGreeting, timestamp: new Date() }]
      : []
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const doSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      const userMessage = text.trim();

      setMessages((prev) => [
        ...prev,
        { role: "user", content: userMessage, timestamp: new Date() },
      ]);
      setIsLoading(true);
      onSendMessage?.(userMessage);

      try {
        const response = await sendChatMessage(agentName, userMessage, sessionId);
        setSessionId(response.session_id);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: response.response,
            timestamp: new Date(),
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm having trouble connecting to the backend. Please make sure the server is running at localhost:8000.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [agentName, isLoading, sessionId, onSendMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    doSend(input);
    setInput("");
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !quickPrompts && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-medium">
              Start a conversation with the {agentName} agent
            </p>
            <p className="text-xs">Ask anything about your marketing needs</p>
          </div>
        )}

        {messages.length === 0 && quickPrompts && quickPrompts.length > 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Try one of these prompts to get started
            </p>
            <div className="grid max-w-md grid-cols-2 gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput("");
                    doSend(prompt);
                  }}
                  className="rounded-xl border border-border bg-card p-3 text-left text-xs text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground hover:shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3 animate-fade-in",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                msg.role === "user"
                  ? "bg-primary"
                  : "bg-gradient-to-br from-violet-500 to-purple-600"
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
                "group relative max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-headings:mb-1 prose-headings:mt-2">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.role === "assistant" && (
                <button
                  onClick={() => copyToClipboard(msg.content, i)}
                  className="absolute -bottom-6 right-0 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                >
                  {copiedIdx === i ? (
                    <>
                      <Check className="h-3 w-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-2xl bg-secondary px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-1" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-2" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-typing-dot-3" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-all ring-ring focus:ring-2 focus:border-primary/50"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:hover:shadow-none"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
