import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { BookOpen, MessageSquare, NotebookPen, TrendingUp, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — PrepDesk" }] }),
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ questions: 0, notes: 0, topics: 0, sessions: 0 });
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setUserEmail(u.user?.email ?? "");
      const [q, n, p, s] = await Promise.all([
        supabase.from("questions" as any).select("*", { count: "exact", head: true }),
        supabase.from("notes" as any).select("*", { count: "exact", head: true }),
        supabase.from("progress" as any).select("*", { count: "exact", head: true }),
        supabase.from("interview_sessions" as any).select("*", { count: "exact", head: true }),
      ]);
      setStats({
        questions: q.count ?? 0,
        notes: n.count ?? 0,
        topics: p.count ?? 0,
        sessions: s.count ?? 0,
      });
    })();
  }, []);

  const cards = [
    { to: "/questions", label: "Questions Bank", desc: "Save & revise interview Q&A", icon: BookOpen, count: stats.questions, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { to: "/mock-interview", label: "Mock Interview", desc: "Practice with an AI interviewer", icon: MessageSquare, count: stats.sessions, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { to: "/notes", label: "Study Notes", desc: "Markdown notes by topic", icon: NotebookPen, count: stats.notes, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    { to: "/progress", label: "Progress Tracker", desc: "Track confidence per topic", icon: TrendingUp, count: stats.topics, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="text-sm text-muted-foreground">Welcome back{userEmail ? `, ${userEmail}` : ""}</p>
        <h1 className="text-3xl font-bold tracking-tight mt-1">Your interview prep desk</h1>
        <p className="text-muted-foreground mt-2">Pick where to continue today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="group">
            <Card className="p-6 h-full hover:border-primary hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold tabular-nums">{c.count}</span>
              </div>
              <h3 className="font-semibold text-lg">{c.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              <div className="flex items-center text-sm text-primary mt-4 font-medium">
                Open <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
