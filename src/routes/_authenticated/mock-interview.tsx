import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { aiInterviewReply } from "@/lib/ai-interview.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Send, Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/mock-interview")({
  head: () => ({ meta: [{ title: "Mock Interview — PrepDesk" }] }),
  component: MockInterviewPage,
});

type Session = { id: string; title: string; topic: string | null; created_at: string };
type Msg = { id: string; role: "user" | "assistant" | "system"; content: string; created_at: string };

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

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

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
    // Kick off first AI message
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mock Interview</h1>
          <p className="text-muted-foreground mt-1">Practice with an AI interviewer</p>
        </div>
        <Button onClick={() => setShowNew(true)}><Plus className="w-4 h-4 mr-1" /> New session</Button>
      </div>

      {showNew && (
        <Card className="p-4 mb-6 flex gap-2 items-center">
          <Input autoFocus placeholder="What topic? e.g. React, System Design, Python..." value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && startSession()} />
          <Button onClick={startSession} disabled={sending}>{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start"}</Button>
          <Button variant="ghost" onClick={() => setShowNew(false)}>Cancel</Button>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        <Card className="p-2 h-fit max-h-[70vh] overflow-y-auto">
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4 text-center">No sessions yet</p>
          ) : sessions.map((s) => (
            <div key={s.id} className={`flex items-center gap-1 rounded-md ${active?.id === s.id ? "bg-accent" : ""}`}>
              <button onClick={() => setActive(s)} className="flex-1 text-left p-3 min-w-0">
                <div className="font-medium text-sm truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{new Date(s.created_at).toLocaleDateString()}</div>
              </button>
              <Button variant="ghost" size="icon" onClick={() => deleteSession(s.id)}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          ))}
        </Card>

        {active ? (
          <Card className="flex flex-col h-[70vh]">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold">{active.title}</h3>
              {active.topic && <p className="text-xs text-muted-foreground">Topic: {active.topic}</p>}
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !sending && (
                <p className="text-center text-muted-foreground text-sm">Waiting for first question…</p>
              )}
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    <div className="text-xs opacity-70 mb-1">{m.role === "user" ? "You" : "Interviewer"}</div>
                    <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type your answer… (Enter to send, Shift+Enter for newline)"
                rows={2}
                className="resize-none"
              />
              <Button onClick={send} disabled={sending || !input.trim()}><Send className="w-4 h-4" /></Button>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <MessageSquare className="w-10 h-10 opacity-40" />
            <p>Start a new mock interview to practice with the AI.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
