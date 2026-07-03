import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, MessageSquare, NotebookPen, TrendingUp, ArrowUpRight, Sparkles, Flame } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PrepDesk" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ questions: 0, notes: 0, topics: 0, sessions: 0, avgConfidence: 0 });
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUserEmail(u.user?.email ?? "");
      const [q, n, p, s, pRows] = await Promise.all([
        (supabase as any).from("questions").select("*", { count: "exact", head: true }),
        (supabase as any).from("notes").select("*", { count: "exact", head: true }),
        (supabase as any).from("progress").select("*", { count: "exact", head: true }),
        (supabase as any).from("interview_sessions").select("*", { count: "exact", head: true }),
        (supabase as any).from("progress").select("confidence"),
      ]);
      const rows = (pRows.data ?? []) as { confidence: number }[];
      const avg = rows.length ? rows.reduce((a, r) => a + r.confidence, 0) / rows.length : 0;
      setStats({
        questions: q.count ?? 0,
        notes: n.count ?? 0,
        topics: p.count ?? 0,
        sessions: s.count ?? 0,
        avgConfidence: Math.round(avg * 10) / 10,
      });
    })();
  }, []);

  const name = userEmail ? userEmail.split("@")[0] : "there";

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" /> Your prep desk
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
            Hey <span className="text-primary">{name}</span>,
            <br className="hidden sm:block" /> ready to level up?
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="w-4 h-4 text-brand-red" /> Consistency beats intensity.
        </div>
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
            <p className="text-sm text-muted-foreground mt-3 max-w-sm">
              Curate, revise and swipe through your interview Q&amp;A library.
            </p>
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
