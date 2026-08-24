import { createFileRoute, Link } from "@tanstack/react-router";
import { PYTHON_COURSE } from "@/content/python-course";
import { ArrowRight, Code2, Terminal } from "lucide-react";

export const Route = createFileRoute("/_authenticated/learn/")({
  head: () => ({
    meta: [
      { title: "Learn Programming — PrepDesk" },
      { name: "description", content: "Beginner se advanced tak programming notes, diagrams aur live interpreter — PrepDesk Learn." },
      { property: "og:title", content: "Learn Programming — PrepDesk" },
      { property: "og:description", content: "Structured Python notes with diagrams and an in-browser Python interpreter." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LearnIndex,
});

function LearnIndex() {
  const total = PYTHON_COURSE.length;
  const minutes = PYTHON_COURSE.reduce((s, l) => s + l.minutes, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="panel panel-accent-red col-span-2 md:col-span-2 p-5 sm:p-6">
          <div className="mono-label mb-2">Learn</div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Zero se advance tak.</h1>
          <p className="text-sm text-muted-foreground mt-2">Theory + diagrams, aur saath me live interpreter — padho aur wahi run karo.</p>
        </div>
        <div className="panel panel-accent-blue p-5 flex flex-col justify-between">
          <span className="mono-label">Lessons</span>
          <div className="stat-num mt-3">{total}</div>
        </div>
        <div className="panel p-5 flex flex-col justify-between">
          <span className="mono-label">Read time</span>
          <div className="stat-num mt-3">{minutes}m</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/learn/python" className="panel panel-hover p-6 group block">
          <div className="flex items-center justify-between gap-3">
            <div className="w-11 h-11 rounded-xl bg-foreground text-background grid place-items-center shrink-0">
              <Code2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="chip !bg-muted">{total} lessons</span>
          </div>
          <h2 className="font-display text-xl font-bold mt-4">Python</h2>
          <p className="text-sm text-muted-foreground mt-1">Basics, data structures, OOP, generators, decorators, async & GIL.</p>
          <div className="mono-label mt-4 flex items-center gap-1 text-primary">
            Start learning <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </div>
        </Link>

        <div className="panel p-6 opacity-60">
          <div className="w-11 h-11 rounded-xl bg-muted grid place-items-center">
            <Terminal className="w-5 h-5" aria-hidden="true" />
          </div>
          <h2 className="font-display text-xl font-bold mt-4">JavaScript, SQL, C++</h2>
          <p className="text-sm text-muted-foreground mt-1">Coming soon — bolna ho to bata dena, agla track bana denge.</p>
        </div>
      </div>
    </div>
  );
}
