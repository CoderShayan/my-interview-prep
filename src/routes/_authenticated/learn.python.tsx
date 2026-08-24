import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PYTHON_COURSE, LEVELS, type Lesson } from "@/content/python-course";
import { MarkdownView } from "@/components/markdown-view";
import { PythonRunner } from "@/components/python-runner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Check } from "lucide-react";
import { useReaderNav } from "@/hooks/use-reader-nav";

export const Route = createFileRoute("/_authenticated/learn/python")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Python: Beginner to Advanced — PrepDesk" },
      { name: "description", content: "Python notes beginner se advanced tak — theory, ASCII diagrams, tables aur live Python interpreter browser me." },
      { property: "og:title", content: "Python: Beginner to Advanced — PrepDesk" },
      { property: "og:description", content: "14 structured Python lessons with diagrams and a built-in interpreter." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PythonCourse,
});

const DONE_KEY = "prepdesk.python.done";

function PythonCourse() {
  const [activeId, setActiveId] = useState(PYTHON_COURSE[0].id);
  const [level, setLevel] = useState<"all" | (typeof LEVELS)[number]>("all");
  const [done, setDone] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(DONE_KEY) ?? "[]"); } catch { return []; }
  });

  const list = useMemo(
    () => (level === "all" ? PYTHON_COURSE : PYTHON_COURSE.filter((l) => l.level === level)),
    [level],
  );
  const idx = list.findIndex((l) => l.id === activeId);
  const active: Lesson = idx >= 0 ? list[idx] : list[0] ?? PYTHON_COURSE[0];
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < list.length - 1;

  const { go, touchHandlers, slideClass } = useReaderNav({
    enabled: true,
    hasPrev,
    hasNext,
    onPrev: () => hasPrev && setActiveId(list[idx - 1].id),
    onNext: () => hasNext && setActiveId(list[idx + 1].id),
    deps: [idx, list.length],
  });

  function toggleDone(id: string) {
    setDone((d) => {
      const next = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
      try { localStorage.setItem(DONE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  const pct = Math.round((done.length / PYTHON_COURSE.length) * 100);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="panel panel-accent-blue col-span-2 p-5 sm:p-6">
          <div className="mono-label mb-2">Python track</div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Beginner → Advanced</h1>
          <p className="text-sm text-muted-foreground mt-2">Theory, diagrams aur har lesson me runnable code.</p>
        </div>
        <div className="panel p-5 flex flex-col justify-between">
          <span className="mono-label">Completed</span>
          <div className="stat-num mt-3">{done.length}/{PYTHON_COURSE.length}</div>
        </div>
        <div className="panel panel-accent-red p-5 flex flex-col justify-between">
          <span className="mono-label">Progress</span>
          <div className="stat-num mt-3">{pct}%</div>
          <div className="h-1.5 mt-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-brand-red transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Level filter */}
      <div className="panel p-3 mb-4">
        <div className="flex gap-2 items-center flex-nowrap overflow-x-auto no-scrollbar" role="group" aria-label="Filter by level">
          <span className="mono-label mr-1 shrink-0" aria-hidden="true">Level</span>
          <button onClick={() => setLevel("all")} aria-pressed={level === "all"} className={`chip shrink-0 ${level === "all" ? "!bg-foreground !text-background !border-foreground" : ""}`}>all</button>
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)} aria-pressed={level === l} className={`chip shrink-0 ${level === l ? "!bg-primary !text-primary-foreground !border-primary" : ""}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
        {/* Lesson list */}
        <nav aria-label="Lessons" className="panel p-2 lg:sticky lg:top-20 w-full min-w-0">
          <div className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar lg:overflow-visible lg:max-h-[70vh] lg:overflow-y-auto reader-scroll">
            {list.map((l, i) => {
              const isActive = l.id === active.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setActiveId(l.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`text-left rounded-lg px-3 py-2.5 shrink-0 lg:shrink w-[190px] lg:w-full transition-colors ${isActive ? "bg-foreground text-background" : "hover:bg-muted"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`mono-label ${isActive ? "!text-background/70" : ""}`}>{String(i + 1).padStart(2, "0")}</span>
                    {done.includes(l.id) && <Check className="w-3 h-3 text-brand-blue shrink-0" aria-label="Completed" />}
                  </div>
                  <div className="text-[13px] font-semibold leading-snug mt-0.5 line-clamp-2">{l.title}</div>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Lesson body */}
        <div className="min-w-0 grid gap-4">
          <article
            {...touchHandlers}
            className="panel overflow-hidden"
            aria-label={`Lesson ${idx + 1} of ${list.length}: ${active.title}`}
          >
            <div className="h-1 bg-muted relative" role="progressbar" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={idx + 1} aria-label="Lesson progress">
              <div className="absolute inset-y-0 left-0 bg-brand-blue transition-all duration-300" style={{ width: `${list.length ? ((idx + 1) / list.length) * 100 : 0}%` }} />
            </div>
            <div className="px-4 sm:px-8 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="chip !bg-muted">{active.level}</span>
                <span className="mono-label flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" /> {active.minutes} min</span>
                <span className="mono-label">{String(idx + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
              </div>
              <h2 className="font-display text-xl sm:text-3xl font-bold tracking-tight mt-3">{active.title}</h2>
              <p className="text-sm text-muted-foreground mt-1.5">{active.summary}</p>
            </div>
            <div className={`transition-all duration-150 ease-out ${slideClass}`} key={active.id}>
              <div className="reader-shell">
                <MarkdownView content={active.content} />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 border-t border-border bg-card flex items-center justify-between gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => go("prev")} disabled={!hasPrev} aria-keyshortcuts="ArrowLeft">
                <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Prev
              </Button>
              <Button
                variant={done.includes(active.id) ? "default" : "ghost"}
                size="sm"
                onClick={() => toggleDone(active.id)}
                aria-pressed={done.includes(active.id)}
              >
                <Check className="w-4 h-4 mr-1" aria-hidden="true" /> {done.includes(active.id) ? "Completed" : "Mark done"}
              </Button>
              <Button size="sm" onClick={() => go("next")} disabled={!hasNext} aria-keyshortcuts="ArrowRight">
                Next <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </article>

          <div>
            <div className="mono-label mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> Try it yourself
            </div>
            <PythonRunner initialCode={active.code} />
          </div>
        </div>
      </div>
    </div>
  );
}
