"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, User, Send, Paperclip, PlusSquare, Star } from "lucide-react";

/* ─── Types ─── */
interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  playerCard?: {
    name: string;
    playstyle: string;
    ovr: number;
    pace: number;
    dri: number;
    sho: number;
    imgSrc: string;
  };
}

/* ─── Initial Conversation ─── */
const INITIAL_MESSAGES: Message[] = [
  {
    id: "ai-1",
    sender: "ai",
    text: "Based on your requirement for a rapid winger suitable for Quick Counter tactics, I've analyzed the current database. The optimal profile requires high Acceleration, Offensive Awareness, and Dribbling stats.\n\nHere is my top recommendation for an immediate tactical upgrade:",
    playerCard: {
      name: "K. Mbappé",
      playstyle: "Prolific Winger",
      ovr: 94,
      pace: 97,
      dri: 92,
      sho: 89,
      imgSrc:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBWPqYgx1R_i33gWsUiIKwERzNGExu_ccVv4OTD93UIcv8XflTQIEWEYADWT5HqM65daPqhDmc9OVpyGc8BjuIT5nJssXGLBwHpFi-gSCaqPEVLM_onZYnbxkorkshsDCZfXbOPJRkgL_tMAkakeBSbePG7Refb7TovhBqqQMC43eWPzOQJ1XBGGDjUV_rmDDYOw-TtXg88ZhEo0tVfwz7Se7QNeU6oJUNMf7QYwgzu8xXIfhGsL7aEIXjEaIKFhp2RhZ7UZiOgQRw",
    },
  },
  {
    id: "user-1",
    sender: "user",
    text: "What about his stamina? In QC, my wingers get exhausted by the 70th minute.",
  },
  {
    id: "ai-2",
    sender: "ai",
    text: 'Valid concern. His base stamina is 84, which is decent but might require management in a high-pressing system.\n\nI recommend applying the **Counter Target** individual instruction to him. This keeps him higher up the pitch during defensive phases, conserving energy for counter-attacks.',
  },
];

/* ─── Removed Static CHAT_HISTORY ─── */

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: Mini Player Card (inside AI message)
   ═══════════════════════════════════════════════════════════════ */
function MiniPlayerCard({ card }: { card: NonNullable<Message["playerCard"]> }) {
  return (
    <div className="bg-[#141e3c] border border-white/10 rounded-lg p-3 flex gap-6 items-center mb-3 ai-pulse">
      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-efhub-amber shrink-0 relative bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Player Portrait"
          className="w-full h-full object-cover grayscale opacity-80 mix-blend-luminosity"
          src={card.imgSrc}
        />
        <div className="absolute bottom-0 right-0 bg-m3-secondary text-black font-[var(--font-label)] text-[10px] font-bold tracking-[0.08em] px-1 rounded-sm">
          {card.ovr}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-[var(--font-display)] text-xl text-m3-on-surface leading-tight">{card.name}</h4>
            <span className="text-xs text-m3-primary bg-m3-primary/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-m3-primary/20">
              {card.playstyle}
            </span>
          </div>
          <Star className="w-5 h-5 text-efhub-amber" />
        </div>
        <div className="grid grid-cols-3 gap-1 mt-3">
          {[
            { label: "PAC", value: card.pace, color: "text-efhub-cyan" },
            { label: "DRI", value: card.dri, color: "text-m3-primary" },
            { label: "SHO", value: card.sho, color: "text-m3-on-surface" },
          ].map((s) => (
            <div key={s.label} className="bg-black/40 rounded p-1 text-center">
              <div className="text-[10px] text-m3-outline uppercase">{s.label}</div>
              <div className={`font-[var(--font-label)] text-xl font-semibold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE: AI Assistant
   ═══════════════════════════════════════════════════════════════ */
export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<{ id: string, label: string, text: string, time: string, color: string, active: boolean, messages?: Message[] }[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(activeSessionId);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedM = sessionStorage.getItem("efhub_messages");
      if (savedM) setMessages(JSON.parse(savedM));
      const savedS = sessionStorage.getItem("efhub_sessions");
      if (savedS) setSessions(JSON.parse(savedS));
      const savedActive = sessionStorage.getItem("efhub_active_session");
      if (savedActive) setActiveSessionId(savedActive);
    } catch (e) {}
  }, []);

  useEffect(() => {
    sessionStorage.setItem("efhub_messages", JSON.stringify(messages));
    if (activeSessionId) {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages } : s));
    }
  }, [messages, activeSessionId]);

  useEffect(() => {
    sessionStorage.setItem("efhub_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
    if (activeSessionId) sessionStorage.setItem("efhub_active_session", activeSessionId);
    else sessionStorage.removeItem("efhub_active_session");
  }, [activeSessionId]);

  /* Auto-scroll to bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  /* New Chat handler */
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setActiveSessionId(null);
    setSessions(prev => prev.map(s => ({ ...s, active: false })));
  }, []);

  const loadSession = useCallback((id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setActiveSessionId(id);
      setMessages(session.messages || []);
      setSessions(prev => prev.map(s => ({ ...s, active: s.id === id })));
    }
  }, [sessions]);

  /* Send message handler — calls /api/chat (Next.js route → OpenRouter) */
  const handleSendMessage = useCallback(async (textOverride?: string | React.MouseEvent | React.KeyboardEvent) => {
    const textToSubmit = typeof textOverride === "string" ? textOverride : inputValue;
    const trimmed = textToSubmit.trim();
    if (!trimmed || isTyping) return;

    let currentSessionId = activeSessionIdRef.current;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    
    if (messages.length === 0 || !currentSessionId) {
      currentSessionId = `sess-${Date.now()}`;
      setActiveSessionId(currentSessionId);
      const titleWords = trimmed.split(" ").slice(0, 4).join(" ");
      const title = trimmed.split(" ").length > 4 ? `${titleWords}...` : titleWords;
      setSessions(prev => [
        { id: currentSessionId as string, label: "NEW SESSION", text: title, time: "Just now", color: "text-efhub-cyan", active: true, messages: updatedMessages },
        ...prev.map(s => ({ ...s, active: false }))
      ]);
    }

    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: updatedMessages.slice(-6).map((m) => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      let aiText: string;

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Unknown error", details: "" }));
        aiText = `⚠️ Error: ${errData.error || `Server returned ${res.status}`}.\n${errData.details ? `Details: ${errData.details}\n` : ''}Please try again.`;
      } else {
        const data = await res.json();
        aiText = data.reply || "I couldn't generate a response. Please try again.";
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiText,
      };
      
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...(s.messages || []), aiMsg] } : s));
      
      if (activeSessionIdRef.current === currentSessionId) {
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Network error";
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: `⚠️ Connection failed: ${errMsg}. Make sure the dev server is running.`,
      };
      
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...(s.messages || []), aiMsg] } : s));
      
      if (activeSessionIdRef.current === currentSessionId) {
        setMessages((prev) => [...prev, aiMsg]);
      }
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, messages]);

  return (
    <div className="flex h-[calc(100vh-5rem)] -mx-5 -mb-5 overflow-hidden">
      {/* ═══════ LEFT SIDEBAR: Chat History ═══════ */}
      <aside className="hidden lg:flex flex-col w-80 glass-panel border-r-0 border-y-0 h-full p-6 overflow-y-auto shrink-0">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold text-m3-on-surface">Recent Scenarios</h2>
          <button onClick={handleNewChat} className="text-efhub-cyan hover:text-white transition-colors">
            <PlusSquare className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {sessions.length === 0 ? (
            <p className="text-sm text-m3-on-surface-variant italic">No recent scenarios.</p>
          ) : (
            sessions.map((item) => (
              <button
                key={item.id}
                onClick={() => loadSession(item.id)}
                className={`flex flex-col text-left p-3 rounded-lg border transition-colors ${
                  item.active
                    ? "border-white/10 bg-white/5 hover:bg-white/10"
                    : "border-transparent hover:bg-white/5"
                }`}
              >
                <span className={`font-[var(--font-label)] text-xs font-bold tracking-[0.08em] ${item.color} mb-1`}>
                  {item.label}
                </span>
                <span className={`font-[var(--font-body)] text-base ${item.active ? "text-m3-on-surface" : "text-m3-on-surface-variant"} truncate w-full`}>
                  {item.text}
                </span>
                <span className={`text-xs mt-1 ${item.active ? "text-m3-on-surface-variant" : "text-m3-outline"}`}>
                  {item.time}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ═══════ MAIN CHAT AREA ═══════ */}
      <section className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col gap-10 scroll-smooth">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center gap-6 mt-16">
              <div className="w-20 h-20 rounded-full bg-m3-primary-container border-2 border-efhub-cyan flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(0,219,234,0.3)]">
                <Bot className="w-10 h-10 text-efhub-cyan" />
              </div>
              <div>
                <h1 className="font-[var(--font-display)] text-3xl font-bold text-m3-on-surface mb-3">
                  I am STRATEGIST AI
                </h1>
                <p className="font-[var(--font-body)] text-lg text-m3-on-surface-variant">
                  Ask me about tactical setups, player synergies, or counter-strategies.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center mt-4">
                {[
                  "Who is the best CF Meta Striker for the Long Ball Counter Tactic?",
                  "How to counter the 4-2-4 Quick Counter formation?",
                  "Recommendations for CMF midfielder builds for Possession Game."
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(q);
                      handleSendMessage(q);
                    }}
                    className="bg-white/5 border border-white/10 hover:border-efhub-cyan/50 hover:bg-white/10 transition-colors px-4 py-2 rounded-full font-[var(--font-label)] text-sm text-m3-on-surface-variant hover:text-efhub-cyan text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg) =>
            msg.sender === "ai" ? (
              <div key={msg.id} className="flex gap-3 max-w-4xl self-start">
                <div className="w-10 h-10 rounded-full bg-m3-primary-container border border-efhub-cyan flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-efhub-cyan" />
                </div>
                <div className="glass-panel p-6 rounded-xl rounded-tl-none border-efhub-amber/50 max-w-3xl">
                  {msg.text.split("\n").map((line, i) => (
                    <p key={i} className="font-[var(--font-body)] text-lg leading-relaxed text-m3-on-surface mb-4 last:mb-0">
                      {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                        part.startsWith("**") && part.endsWith("**") ? (
                          <span key={j} className="text-efhub-amber font-bold">
                            {part.slice(2, -2)}
                          </span>
                        ) : (
                          <span key={j}>{part}</span>
                        )
                      )}
                    </p>
                  ))}
                  {msg.playerCard && <MiniPlayerCard card={msg.playerCard} />}
                  {msg.playerCard && (
                    <p className="text-sm text-m3-on-surface-variant">
                      His &apos;Roaming Flank&apos; playstyle will create overloads on the left side during transitions.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="flex gap-3 max-w-4xl self-end flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-m3-surface-container-highest flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-m3-on-surface" />
                </div>
                <div className="bg-m3-surface-container-high p-6 rounded-xl rounded-tr-none border border-white/5 max-w-2xl text-right">
                  <p className="font-[var(--font-body)] text-lg leading-relaxed text-m3-on-surface">{msg.text}</p>
                </div>
              </div>
            )
          )}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-4xl self-start">
              <div className="w-10 h-10 rounded-full bg-m3-primary-container border border-efhub-cyan flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-efhub-cyan" />
              </div>
              <div className="glass-panel px-6 py-4 rounded-xl rounded-tl-none border-efhub-amber/50">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2 h-2 bg-efhub-cyan rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-efhub-cyan rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-efhub-cyan rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-8" />
        </div>

        {/* ═══════ INPUT AREA ═══════ */}
        <div className="flex-none w-full p-6 shrink-0 bg-efhub-midnight border-t border-white/5">
          <div className="max-w-4xl mx-auto relative">
            <div className="glass-panel rounded-full flex items-center p-2 focus-within:ai-pulse transition-all duration-300 bg-efhub-navy">
              <button className="p-2 text-m3-outline hover:text-efhub-cyan transition-colors rounded-full">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                className="flex-1 bg-transparent border-none text-m3-on-surface focus:ring-0 placeholder:text-m3-outline/50 font-[var(--font-body)] px-4 py-3 outline-none"
                placeholder="Ask about tactics, players, or squad building..."
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={isTyping || !inputValue.trim()}
                className="bg-m3-secondary/20 p-3 rounded-full text-m3-secondary hover:bg-m3-secondary/30 transition-colors border border-m3-secondary/30 flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-m3-outline font-[var(--font-label)] font-bold tracking-[0.08em] uppercase">
                AI CAN MAKE MISTAKES. VERIFY TACTICAL ADVICE.
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
