import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, MessageSquare, NotebookPen, TrendingUp, ArrowUpRight,
  Sparkles, Flame, Star, GraduationCap, Plus, Zap, Clock, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PrepDesk" }] }),
  component: Dashboard,
});

type RecentQ = { id: string; question: string; category: string | null; difficulty: string | null; is_favorite: boolean };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getStreak(): number {
  try {
    const raw = localStorage.getItem("prepdesk-activity-days");
    const days: string[] = raw ? JSON.parse(raw) : [];
    const today = new Date().toISOString().slice(0, 10);
    if (!days.includes(today)) {
      days.push(today);
      localStorage.setItem("prepdesk-activity-days", JSON.stringify(days.slice(-60)));
    }
    let streak = 0;
    const set = new Set(days);
    const d = new Date();
    // if today not counted yet it is now; walk backwards
    for (;;) {
      const key = d.toISOString().slice(0, 10);
      if (set.has(key)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    return streak;
  } catch {
    return 1;
  }
}

function Dashboard() {
  const [stats, setStats] = useState({ questions: 0, notes: 0, topics: 0, sessions: 0, favorites: 0, avgConfidence: 0 });
  const [recent, setRecent] = useState<RecentQ[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [lessonsDone, setLessonsDone] = useState(0);
  const streak = useMemo(getStreak, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("prepdesk-python-done");
      setLessonsDone(raw ? (JSON.parse(raw) as string[]).length : 0);
    } catch { /* ignore */ }

    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUserEmail(u.user?.email ?? "");
      const [q, n, p, s, f, pRows, rq] = await Promise.all([
        (supabase as any).from("questions").select("*", { count: "exact", head: true }),
        (supabase as any).from("notes").select("*", { count: "exact", head: true }),
        (supabase as any).from("progress").select("*", { count: "exact", head: true }),
        (supabase as any).from("interview_sessions").select("*", { count: "exact", head: true }),
        (supabase as any).from("questions").select("*", { count: "exact", head: true }).eq("is_favorite", true),
        (supabase as any).from("progress").select("confidence"),
        (supabase as any).from("questions").select("id, question, category, difficulty, is_favorite").order("created_at", { ascending: false }).limit(4),
      ]);
      const rows = (pRows.data ?? []) as { confidence: number }[];
      const avg = rows.length ? rows.reduce((a, r) => a + r.confidence, 0) / rows.length : 0;
      setStats({
        questions: q.count ?? 0,
        notes: n.count ?? 0,
        topics: p.count ?? 0,
        sessions: s.count ?? 0,
        favorites: f.count ?? 0,
        avgConfidence: Math.round(avg * 10) / 10,
      });
      setRecent((rq.data ?? []) as RecentQ[]);
    })();
  }, []);

  const name = userEmail ? userEmail.split("@")[0] : "there";
  const lessonPct = Math.round((lessonsDone / 14) * 100);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex items-end justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" /> {getGreeting()}
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Hey <span className="text-primary">{name}</span>,
            <br className="hidden sm:block" /> ready to level up?
          </h1>
        </div>
        {/* Streak chip */}
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-brand-red/10 text-brand-red grid place-items-center">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display text-xl font-bold leading-none tabular-nums">{streak}</p>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-0.5">day streak</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <Link to="/questions" className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 transition">
          <Plus className="w-4 h-4" /> Add Q&amp;A
        </Link>
        <Link to="/mock-interview" className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition">
          <Zap className="w-4 h-4" /> Start mock
        </Link>
        <Link to="/notes" className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition">
          <NotebookPen className="w-4 h-4" /> New note
        </Link>
        <Link to="/learn" className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted transition">
          <GraduationCap className="w-4 h-4" /> Learn Python
        </Link>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[minmax(140px,auto)] gap-3 md:gap-4">
        {/* Questions — big feature tile */}
        <Link
          to="/questions"
          className="bento-tile bento-tile-hover col-span-2 md:col-span-2 row-span-2 p-6 flex flex-col justify-between group"
        >
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Question Bank</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-5xl md:text-6xl font-bold tabular-nums tracking-tight">{stats.questions}</span>
              <span className="text-sm text-muted-foreground">saved</span>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-brand-red fill-brand-red" />
              {stats.favorites} favorites ready to revise
            </div>
          </div>
        </Link>

        {/* Mock interview — red accent */}
        <Link
          to="/mock-interview"
          className="bento-tile bento-tile-hover col-span-2 md:col-span-2 p-6 bg-foreground text-background border-transparent group relative overflow-hidden"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-brand-red/30 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl bg-background/10 text-background grid place-items-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-5 h-5 opacity-70 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="relative mt-6">
            <p className="text-xs uppercase tracking-widest text-background/60">AI Mock Interview</p>
            <p className="font-display text-2xl md:text-3xl font-bold mt-1 leading-tight">
              Get grilled by an AI.<br />
              <span className="text-brand-red">Sharpen every answer.</span>
            </p>
            <p className="text-sm text-background/70 mt-3">{stats.sessions} sessions so far.</p>
          </div>
        </Link>

        {/* Notes */}
        <Link to="/notes" className="bento-tile bento-tile-hover p-5 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-brand-red/10 text-brand-red grid place-items-center">
              <NotebookPen className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Notes</p>
            <p className="font-display text-3xl font-bold tabular-nums mt-1">{stats.notes}</p>
          </div>
        </Link>

        {/* Progress */}
        <Link to="/progress" className="bento-tile bento-tile-hover p-5 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Topics</p>
            <p className="font-display text-3xl font-bold tabular-nums mt-1">{stats.topics}</p>
          </div>
        </Link>

        {/* Learn progress tile */}
        <Link to="/learn" className="bento-tile bento-tile-hover col-span-2 p-5 md:p-6 flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Python course</p>
                <p className="font-display text-lg font-bold">{lessonsDone} / 14 lessons</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition" />
          </div>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuenow={lessonPct} aria-valuemin={0} aria-valuemax={100} aria-label="Python course progress">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${lessonPct}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{lessonPct}% complete — keep going!</p>
          </div>
        </Link>

        {/* Confidence tile */}
        <div className="bento-tile col-span-2 md:col-span-2 p-6 bg-primary text-primary-foreground border-transparent relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-background/10 blur-2xl" />
          <div className="relative flex items-start justify-between">
            <Sparkles className="w-5 h-5" />
            <p className="text-[11px] uppercase tracking-widest opacity-80">Avg confidence</p>
          </div>
          <div className="relative mt-4 flex items-baseline gap-2">
            <span className="font-display text-6xl font-bold tabular-nums tracking-tight">
              {stats.avgConfidence || "—"}
            </span>
            <span className="opacity-80">/ 5</span>
          </div>
          <p className="relative text-sm opacity-80 mt-2">Across all your tracked topics.</p>
        </div>

        {/* Recent questions tile */}
        <div className="bento-tile col-span-2 md:col-span-2 row-span-2 p-5 md:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Recently added</p>
            </div>
            <Link to="/questions" className="text-xs font-medium text-primary inline-flex items-center gap-0.5 hover:underline">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex-1 grid place-items-center text-center py-6">
              <div>
                <p className="text-sm text-muted-foreground">No questions yet.</p>
                <Link to="/questions" className="text-sm font-medium text-primary hover:underline">Add your first Q&amp;A →</Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-2 flex-1">
              {recent.map((q) => (
                <li key={q.id}>
                  <Link
                    to="/questions"
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5 hover:bg-muted transition group"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      q.difficulty === "hard" ? "bg-brand-red" : q.difficulty === "medium" ? "bg-primary" : "bg-muted-foreground/40"
                    }`} aria-hidden="true" />
                    <span className="text-sm font-medium truncate flex-1 min-w-0">{q.question}</span>
                    {q.is_favorite && <Star className="w-3.5 h-3.5 text-brand-red fill-brand-red shrink-0" />}
                    {q.category && (
                      <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded-full px-2 py-0.5 shrink-0">
                        {q.category}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick tip / motivation tile */}
        <div className="bento-tile col-span-2 md:col-span-2 p-6 relative overflow-hidden">
          <div className="corner-mark absolute inset-0 pointer-events-none" />
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Today's play</p>
          <p className="font-display text-xl md:text-2xl font-bold mt-2 leading-snug">
            One mock interview → three new Q&amp;As → mark one topic reviewed.
          </p>
          <p className="text-sm text-muted-foreground mt-3">
            Small loops. Compounding gains. That's the whole trick.
          </p>
        </div>
      </div>
    </div>
  );
}
