import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { aiInterviewReply, type InterviewReply } from "@/lib/ai-interview.functions";
import { useSpeechInput, useSpeech } from "@/hooks/use-voice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Send, Trash2, Loader2, MessageSquare, Sparkles, Zap, Lightbulb, User, Bot,
  Mic, MicOff, Volume2, VolumeX, ThumbsUp, Target,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mock-interview")({
  head: () => ({
    meta: [
      { title: "Voice Mock Interview — PrepDesk" },
      { name: "description", content: "Practice interviews by voice and get an AI score out of 10 with improvement tips." },
      { property: "og:title", content: "Voice Mock Interview — PrepDesk" },
      { property: "og:description", content: "Speak your answers, get rated out of 10, and see exactly what to improve." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
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

type Parsed = { reply: string; rating: number | null; strengths: string[]; improvements: string[] };

function parseContent(content: string): Parsed {
  if (content.trim().startsWith("{")) {
    try {
      const o = JSON.parse(content);
      if (o && typeof o.reply === "string") {
        return {
          reply: o.reply,
          rating: typeof o.rating === "number" ? o.rating : null,
          strengths: Array.isArray(o.strengths) ? o.strengths : [],
          improvements: Array.isArray(o.improvements) ? o.improvements : [],
        };
      }
    } catch {
      /* plain text */
    }
  }
  return { reply: content, rating: null, strengths: [], improvements: [] };
}

function ScoreRing({ value }: { value: number }) {
  const tone = value >= 8 ? "text-brand-blue" : value >= 5 ? "text-foreground" : "text-brand-red";
  return (
    <div className="flex items-center gap-2" aria-label={`Score ${value} out of 10`}>
      <div className={`font-display font-bold text-lg leading-none tabular-nums ${tone}`}>{value}<span className="text-xs text-muted-foreground font-sans">/10</span></div>
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={10} aria-valuenow={value}>
        <div className={`h-full rounded-full ${value >= 8 ? "bg-brand-blue" : value >= 5 ? "bg-foreground" : "bg-brand-red"}`} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}

function MockInterviewPage() {
  const aiReply = useServerFn(aiInterviewReply);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const [voiceOut, setVoiceOut] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const speech = useSpeech();
  const mic = useSpeechInput((text) => setInput((p) => (p ? `${p} ${text}` : text)));

  const scores = messages
    .map((m) => (m.role === "assistant" ? parseContent(m.content).rating : null))
    .filter((n): n is number => typeof n === "number");
  const avgScore = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;

  async function loadSessions() {
    const { data } = await (supabase as any).from("interview_sessions").select("*").order("created_at", { ascending: false });
    setSessions((data as any) ?? []);
    if (!active && data && data.length) setActive((data as any)[0]);
  }
  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    speech.cancel();
    mic.stop();
    if (!active) { setMessages([]); return; }
    (async () => {
      const { data } = await (supabase as any).from("interview_messages").select("*").eq("session_id", active.id).order("created_at");
      setMessages((data as any) ?? []);
    })();
  }, [active]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, sending]);

  function speakReply(r: InterviewReply | Parsed) {
    if (voiceOut) speech.speak(r.reply);
  }

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
      const res = await aiReply({ data: { topic: (data as any).topic, messages: [] } });
      await (supabase as any).from("interview_messages").insert({
        session_id: (data as any).id, user_id: u.user.id, role: "assistant", content: JSON.stringify(res),
      });
      const { data: msgs } = await (supabase as any).from("interview_messages").select("*").eq("session_id", (data as any).id).order("created_at");
      setMessages((msgs as any) ?? []);
      speakReply(res);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setSending(false); }
  }

  async function send() {
    if (!input.trim() || !active || sending) return;
    const text = input.trim();
    setInput("");
    mic.stop();
    speech.cancel();
    setSending(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setSending(false); return; }
    const { data: userMsg } = await (supabase as any).from("interview_messages").insert({
      session_id: active.id, user_id: u.user.id, role: "user", content: text,
    }).select().single();
    setMessages((m) => [...m, userMsg as any]);
    try {
      const history = [...messages, userMsg as any].map((m: any) => ({
        role: m.role,
        content: m.role === "assistant" ? parseContent(m.content).reply : m.content,
      }));
      const res = await aiReply({ data: { topic: active.topic ?? "", messages: history } });
      const { data: aiMsg } = await (supabase as any).from("interview_messages").insert({
        session_id: active.id, user_id: u.user.id, role: "assistant", content: JSON.stringify(res),
      }).select().single();
      setMessages((m) => [...m, aiMsg as any]);
      speakReply(res);
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 mb-4 md:mb-6">
        <div className="panel panel-accent-red col-span-2 p-4 sm:p-5 md:p-6">
          <div className="mono-label mb-2 inline-flex items-center gap-1"><Sparkles className="w-3 h-3" aria-hidden="true" /> AI Interviewer</div>
          <h1 className="font-display text-xl sm:text-2xl md:text-4xl font-bold tracking-tight leading-tight">Voice Mock Interview.</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">Speak your answers. Get scored out of 10 with fixes.</p>
          <div className="mt-3 md:mt-4"><Button size="sm" className="w-full sm:w-auto md:h-10 md:px-4" onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-1" aria-hidden="true" /> New session</Button></div>
        </div>
        <div className="panel panel-accent-blue p-3 sm:p-4 md:p-5 flex flex-col justify-between">
          <span className="mono-label">Sessions</span>
          <div className="stat-num mt-2 md:mt-3">{sessions.length}</div>
        </div>
        <div className="panel p-3 sm:p-4 md:p-5 flex flex-col justify-between">
          <span className="mono-label">Avg score</span>
          <div className="stat-num mt-2 md:mt-3">{avgScore ?? "—"}<span className="text-sm text-muted-foreground font-sans">/10</span></div>
        </div>
      </div>

      {showNew && (
        <div className="panel p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input autoFocus aria-label="Interview topic" placeholder="What topic? e.g. React, System Design…" value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && startSession()} />
          <div className="flex gap-2">
            <Button className="flex-1 sm:flex-none" onClick={startSession} disabled={sending}>{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start"}</Button>
            <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Sessions strip — mobile only */}
      {sessions.length > 0 && (
        <div className="lg:hidden mb-3 -mx-1 px-1 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s)}
              aria-pressed={active?.id === s.id}
              className={`chip shrink-0 !py-2 !px-3 transition ${active?.id === s.id ? "!bg-foreground !text-background !border-foreground" : ""}`}
            >
              <MessageSquare className="w-3 h-3" aria-hidden="true" />
              <span className="truncate max-w-[140px]">{s.title}</span>
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Chat panel */}
        {active ? (
          <div className="panel flex flex-col h-[calc(100dvh-16rem)] min-h-[440px] lg:h-[72vh] overflow-hidden">
            <div className="px-3 sm:px-4 md:px-5 py-2.5 md:py-4 border-b bg-card grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
              <div className="min-w-0">
                <div className="mono-label">Session</div>
                <h2 className="font-display font-bold text-sm sm:text-base md:text-lg truncate">{active.title}</h2>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="icon" className="h-9 w-9"
                  aria-label={voiceOut ? "Turn interviewer voice off" : "Turn interviewer voice on"}
                  aria-pressed={voiceOut}
                  onClick={() => { const n = !voiceOut; setVoiceOut(n); if (!n) speech.cancel(); }}
                >
                  {voiceOut ? <Volume2 className="w-4 h-4 text-brand-blue" /> : <VolumeX className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" onClick={() => deleteSession(active.id)} aria-label="Delete session">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto reader-scroll p-3 sm:p-4 md:p-5 space-y-3 md:space-y-4 bg-muted/30">
              {messages.length === 0 && !sending && (
                <p className="text-center text-muted-foreground text-sm py-10">Waiting for first question…</p>
              )}
              {messages.map((m) => {
                const isUser = m.role === "user";
                const p = isUser ? null : parseContent(m.content);
                return (
                  <div key={m.id} className={`flex gap-2 md:gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full grid place-items-center ${isUser ? "bg-primary text-primary-foreground" : "bg-foreground text-background"}`}>
                      {isUser ? <User className="w-3.5 h-3.5" aria-hidden="true" /> : <Bot className="w-3.5 h-3.5" aria-hidden="true" />}
                    </div>
                    <div className={`max-w-[86%] md:max-w-[78%] min-w-0 rounded-2xl px-3 md:px-4 py-2.5 shadow-sm ${isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>
                      <div className={`text-[10px] uppercase tracking-widest mb-1 opacity-70 ${isUser ? "" : "text-brand-red"}`}>
                        {isUser ? "You" : "Interviewer"}
                      </div>

                      {!isUser && p?.rating !== null && p && (
                        <div className="mb-2 pb-2 border-b border-border flex items-center justify-between gap-2">
                          <span className="mono-label">Your answer</span>
                          <ScoreRing value={p.rating as number} />
                        </div>
                      )}

                      <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">{isUser ? m.content : p!.reply}</div>

                      {!isUser && p && (p.strengths.length > 0 || p.improvements.length > 0) && (
                        <div className="mt-3 space-y-2">
                          {p.strengths.length > 0 && (
                            <div>
                              <div className="mono-label flex items-center gap-1 mb-1"><ThumbsUp className="w-3 h-3 text-brand-blue" aria-hidden="true" /> Strengths</div>
                              <ul className="space-y-1">
                                {p.strengths.map((s, i) => (
                                  <li key={i} className="flex gap-2 text-xs leading-snug"><span className="w-1 h-1 rounded-full bg-brand-blue mt-1.5 shrink-0" />{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {p.improvements.length > 0 && (
                            <div>
                              <div className="mono-label flex items-center gap-1 mb-1"><Target className="w-3 h-3 text-brand-red" aria-hidden="true" /> Improve</div>
                              <ul className="space-y-1">
                                {p.improvements.map((s, i) => (
                                  <li key={i} className="flex gap-2 text-xs leading-snug"><span className="w-1 h-1 rounded-full bg-brand-red mt-1.5 shrink-0" />{s}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {!isUser && (
                        <button
                          onClick={() => speech.speak(p!.reply)}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
                          aria-label="Play this question aloud"
                        >
                          <Volume2 className="w-3 h-3" aria-hidden="true" /> Listen
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div className="flex gap-2.5" role="status" aria-live="polite">
                  <div className="shrink-0 w-8 h-8 rounded-full grid place-items-center bg-foreground text-background">
                    <Bot className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
            </div>

            {/* Composer */}
            <div className="border-t bg-card p-2 sm:p-3 space-y-2">
              {mic.listening && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-1.5" role="status" aria-live="polite">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">{mic.interim || "Listening… speak your answer"}</span>
                </div>
              )}
              <div className="flex items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder={mic.supported ? "Type or tap the mic to speak…" : "Type your answer…"}
                  rows={2}
                  className="resize-none min-h-[52px] text-base sm:text-sm"
                />
                {mic.supported && (
                  <Button
                    type="button"
                    variant={mic.listening ? "destructive" : "outline"}
                    size="icon"
                    className="h-[52px] w-12 shrink-0"
                    onClick={mic.toggle}
                    aria-label={mic.listening ? "Stop recording" : "Answer by voice"}
                    aria-pressed={mic.listening}
                  >
                    {mic.listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                )}
                <Button onClick={send} disabled={sending || !input.trim()} className="h-[52px] w-12 shrink-0 p-0" aria-label="Send answer">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {!mic.supported && (
                <p className="text-[11px] text-muted-foreground">Voice input isn't supported in this browser — try Chrome.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="panel panel-accent-red p-6 sm:p-8 md:p-10 text-center flex flex-col items-center gap-4 min-h-[44vh] md:min-h-[60vh] justify-center">
            <div className="w-14 h-14 rounded-2xl bg-foreground text-background grid place-items-center">
              <Mic className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold">Start a voice mock interview</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">Speak your answers and get a score out of 10 plus exactly what to improve.</p>
            </div>
            <Button className="w-full sm:w-auto" onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-1" aria-hidden="true" /> New session</Button>
          </div>
        )}

        {/* Side rail — desktop only */}
        <div className="hidden lg:flex flex-col gap-3">
          <div className="panel p-4">
            <div className="mono-label mb-3 flex items-center gap-1"><Zap className="w-3 h-3 text-brand-red" aria-hidden="true" /> Sessions</div>
            <div className="space-y-1 max-h-[36vh] overflow-y-auto reader-scroll">
              {sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No sessions yet</p>
              ) : sessions.map((s) => (
                <div key={s.id} className={`flex items-center gap-1 rounded-lg transition ${active?.id === s.id ? "bg-accent" : "hover:bg-muted"}`}>
                  <button onClick={() => setActive(s)} className="flex-1 text-left px-3 py-2 min-w-0">
                    <div className={`text-sm truncate ${active?.id === s.id ? "font-semibold" : "font-medium"}`}>{s.title}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{new Date(s.created_at).toLocaleDateString()}</div>
                  </button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 mr-1" onClick={() => deleteSession(s.id)} aria-label={`Delete ${s.title}`}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="panel panel-accent-blue p-4">
            <div className="mono-label mb-3 flex items-center gap-1"><Lightbulb className="w-3 h-3 text-brand-blue" aria-hidden="true" /> Tips</div>
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
