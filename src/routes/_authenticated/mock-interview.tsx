import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { aiInterviewReply } from "@/lib/ai-interview.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Trash2, Loader2, MessageSquare, Sparkles, Zap, Lightbulb, User, Bot } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mock-interview")({
  head: () => ({ meta: [{ title: "Mock Interview — PrepDesk" }] }),
  component: MockInterviewPage,
});

type Session = { id: string; title: string; topic: string | null; created_at: string };
type Msg = { id: string; role: "user" | "assistant" | "system"; content: string; created_at: string };

const TIPS = [
  "Think aloud — the interviewer wants to see your reasoning.",
  "Restate the question in your own words first.",
  "Small, correct steps beat one giant leap.",
  "Ask clarifying questions when the prompt is vague.",
];

function MockInterviewPage() {
  const aiReply = useServerFn(aiInterviewReply);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadSessions() {
    const { data } = await (supabase as any).from("interview_sessions").select("*").order("created_at", { ascending: false });
    setSessions((data as any) ?? []);
    if (!active && data && data.length) setActive((data as any)[0]);
  }
  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    if (!active) { setMessages([]); return; }
    (async () => {
      const { data } = await (supabase as any).from("interview_messages").select("*").eq("session_id", active.id).order("created_at");
      setMessages((data as any) ?? []);
    })();
  }, [active]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, sending]);

  async function startSession() {
    if (!newTopic.trim()) return toast.error("Topic required");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await (supabase as any).from("interview_sessions").insert({
      user_id: u.user.id, topic: newTopic.trim(), title: newTopic.trim(),
    }).select().single();
    if (error) return toast.error(error.message);
    setShowNew(false); setNewTopic("");
    await loadSessions();
    setActive(data as any);
    setSending(true);
    try {
      const { reply } = await aiReply({ data: { topic: (data as any).topic, messages: [] } });
      await (supabase as any).from("interview_messages").insert({
        session_id: (data as any).id, user_id: u.user.id, role: "assistant", content: reply,
      });
      const { data: msgs } = await (supabase as any).from("interview_messages").select("*").eq("session_id", (data as any).id).order("created_at");
      setMessages((msgs as any) ?? []);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSending(false); }
  }

  async function send() {
    if (!input.trim() || !active || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data: userMsg } = await (supabase as any).from("interview_messages").insert({
      session_id: active.id, user_id: u.user.id, role: "user", content: text,
    }).select().single();
    setMessages((m) => [...m, userMsg as any]);
    try {
      const history = [...messages, userMsg as any].map((m: any) => ({ role: m.role, content: m.content }));
      const { reply } = await aiReply({ data: { topic: active.topic ?? "", messages: history } });
      const { data: aiMsg } = await (supabase as any).from("interview_messages").insert({
        session_id: active.id, user_id: u.user.id, role: "assistant", content: reply,
      }).select().single();
      setMessages((m) => [...m, aiMsg as any]);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSending(false); }
  }

  async function deleteSession(id: string) {
    if (!confirm("Delete this interview session?")) return;
    await (supabase as any).from("interview_sessions").delete().eq("id", id);
    if (active?.id === id) setActive(null);
    loadSessions();
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 mb-5 md:mb-6">
        <div className="panel panel-accent-red col-span-2 md:col-span-2 p-5 md:p-6">
          <div className="mono-label mb-2 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Interviewer</div>
          <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight leading-tight">Mock Interview.</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">Live grilling on any topic. No judgment — just reps.</p>
          <div className="mt-4"><Button size="sm" className="md:h-10 md:px-4" onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-1" /> New session</Button></div>
        </div>
        <div className="panel panel-accent-blue p-4 md:p-5 flex flex-col justify-between">
          <span className="mono-label">Sessions</span>
          <div className="stat-num mt-3">{sessions.length}</div>
        </div>
        <div className="panel p-4 md:p-5 flex flex-col justify-between">
          <span className="mono-label">Messages</span>
          <div className="stat-num mt-3">{messages.length}</div>
        </div>
      </div>

      {showNew && (
        <div className="panel p-3 md:p-4 mb-5 md:mb-6 flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input autoFocus placeholder="What topic? e.g. React, System Design…" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && startSession()} />
          <div className="flex gap-2">
            <Button className="flex-1 sm:flex-none" onClick={startSession} disabled={sending}>{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start"}</Button>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Sessions strip — mobile only */}
      {sessions.length > 0 && (
        <div className="lg:hidden mb-4 -mx-1 px-1 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              className={`chip shrink-0 !py-2 !px-3 transition ${active?.id === s.id ? "!bg-foreground !text-background !border-foreground" : ""}`}
            >
              <MessageSquare className="w-3 h-3" />
              <span className="truncate max-w-[140px]">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Chat panel */}
        {active ? (
          <div className="panel flex flex-col h-[calc(100dvh-14rem)] min-h-[500px] lg:h-[72vh] overflow-hidden">
            <div className="px-4 md:px-5 py-3 md:py-4 border-b bg-card flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mono-label">Session</div>
                <h3 className="font-display font-bold text-base md:text-lg truncate">{active.title}</h3>
              </div>
              {active.topic && <span className="chip !bg-muted shrink-0">{active.topic}</span>}
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 lg:hidden" onClick={() => deleteSession(active.id)} aria-label="Delete session">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto reader-scroll p-4 md:p-5 space-y-3 md:space-y-4 bg-muted/30">
              {messages.length === 0 && !sending && (
                <p className="text-center text-muted-foreground text-sm py-10">Waiting for first question…</p>
              )}
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className={`flex gap-2 md:gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full grid place-items-center ${isUser ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}>
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`max-w-[82%] md:max-w-[78%] rounded-2xl px-3.5 md:px-4 py-2.5 shadow-sm ${isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>
                      <div className={`text-[10px] uppercase tracking-widest mb-1 opacity-70 ${isUser ? "" : "text-brand-red"}`}>
                        {isUser ? "You" : "Interviewer"}
                      </div>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div className="flex gap-2.5">
                  <div className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-foreground text-background">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-2.5 md:p-3 border-t bg-card flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type your answer… (Enter to send)"
                rows={2}
                className="resize-none min-h-[52px]"
              />
              <Button onClick={send} disabled={sending || !input.trim()} size="lg" className="h-auto shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="panel panel-accent-red p-8 md:p-10 text-center flex flex-col items-center gap-4 min-h-[50vh] md:min-h-[60vh] justify-center">
            <div className="w-14 h-14 rounded-2xl bg-foreground text-background grid place-items-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-xl md:text-2xl font-bold">Start a mock interview</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">Pick any topic and get grilled with realistic follow-ups.</p>
            </div>
            <Button onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-1" /> New session</Button>
          </div>
        )}

        {/* Side rail — desktop only */}
        <div className="hidden lg:flex flex-col gap-3">
          <div className="panel p-4">
            <div className="mono-label mb-3 flex items-center gap-1"><Zap className="w-3 h-3 text-brand-red" /> Sessions</div>
            <div className="space-y-1 max-h-[36vh] overflow-y-auto reader-scroll">
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No sessions yet</p>
              ) : sessions.map((s) => (
                <div key={s.id} className={`flex items-center gap-1 rounded-lg transition ${active?.id === s.id ? "bg-accent" : "hover:bg-muted"}`}>
                  <button onClick={() => setActive(s)} className="flex-1 text-left px-3 py-2 min-w-0">
                    <div className={`text-sm truncate ${active?.id === s.id ? "font-semibold" : "font-medium"}`}>{s.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(s.created_at).toLocaleDateString()}</div>
                  </button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 mr-1" onClick={() => deleteSession(s.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel panel-accent-blue p-4">
            <div className="mono-label mb-3 flex items-center gap-1"><Lightbulb className="w-3 h-3 text-brand-blue" /> Tips</div>
            <ul className="space-y-2 text-sm">
              {TIPS.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-sm bg-brand-red mt-2 shrink-0" />
                  <span className="leading-snug">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
