import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PYTHON_COURSE, LEVELS, type Lesson } from "@/content/python-course";
import { PYTHON_COURSE_EN } from "@/content/python-course-en";
import { MarkdownView } from "@/components/markdown-view";
import { LessonDiagram } from "@/components/lesson-diagram";
import { LessonQuiz } from "@/components/lesson-quiz";
import { PythonRunner } from "@/components/python-runner";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Clock, Check, Maximize2, Minimize2, Languages, List } from "lucide-react";
import { useReaderNav } from "@/hooks/use-reader-nav";

export const Route = createFileRoute("/_authenticated/learn/python")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Python: Beginner to Advanced — PrepDesk" },
      { name: "description", content: "Python notes beginner se advanced tak — theory, real diagrams, tables, topic tests aur live Python interpreter browser me." },
      { property: "og:title", content: "Python: Beginner to Advanced — PrepDesk" },
      { property: "og:description", content: "14 structured Python lessons with diagrams, quizzes and a built-in interpreter." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PythonCourse,
});

const DONE_KEY = "prepdesk.python.done";
const LANG_KEY = "prepdesk.python.lang";
const FOCUS_KEY = "prepdesk.python.focus";

type Lang = "hi" | "en";

function PythonCourse() {
  const [activeId, setActiveId] = useState(PYTHON_COURSE[0].id);
  const [level, setLevel] = useState<"all" | (typeof LEVELS)[number]>("all");
  const [lang, setLang] = useState<Lang>("hi");
  const [focus, setFocus] = useState(false);
  const [done, setDone] = useState<string[]>([]);

  // hydration-safe local state
  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem(DONE_KEY) ?? "[]"));
      const l = localStorage.getItem(LANG_KEY);
      if (l === "hi" || l === "en") setLang(l);
      setFocus(localStorage.getItem(FOCUS_KEY) === "1");
    } catch { /* ignore */ }
  }, []);

  function changeLang(l: Lang) {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ }
  }
  function toggleFocus() {
    setFocus((f) => {
      try { localStorage.setItem(FOCUS_KEY, f ? "0" : "1"); } catch { /* ignore */ }
      return !f;
    });
  }

  const list = useMemo(
    () => (level === "all" ? PYTHON_COURSE : PYTHON_COURSE.filter((l) => l.level === level)),
    [level],
  );
  const idx = list.findIndex((l) => l.id === activeId);
  const active: Lesson = idx >= 0 ? list[idx] : list[0] ?? PYTHON_COURSE[0];
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < list.length - 1;

  const en = PYTHON_COURSE_EN[active.id];
  const title = lang === "en" && en ? en.title : active.title;
  const summary = lang === "en" && en ? en.summary : active.summary;
  const content = lang === "en" && en ? en.content : active.content;

  const { go, touchHandlers, slideClass } = useReaderNav({
    enabled: true,
    hasPrev,
    hasNext,
    onPrev: () => hasPrev && setActiveId(list[idx - 1].id),
    onNext: () => hasNext && setActiveId(list[idx + 1].id),
    deps: [idx, list.length],
  });

  function markDone(id: string, force?: boolean) {
    setDone((d) => {
      const next = d.includes(id) ? (force ? d : d.filter((x) => x !== id)) : [...d, id];
      try { localStorage.setItem(DONE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  const pct = Math.round((done.length / PYTHON_COURSE.length) * 100);

  return (
    <div className={focus ? "max-w-3xl mx-auto" : "max-w-7xl mx-auto"}>
      {/* Header — hidden in focus mode to reduce distraction */}
      {!focus && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 sm:mb-5">
          <div className="panel panel-accent-blue col-span-2 p-5 sm:p-6">
            <div className="mono-label mb-2">Python track</div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">Beginner → Advanced</h1>
            <p className="text-sm text-muted-foreground mt-2">
              {lang === "hi"
                ? "Theory, real diagrams, har lesson me runnable code aur topic test."
                : "Theory, real diagrams, runnable code and a test after every topic."}
            </p>
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
      )}

      {/* Control bar: language + focus + level filter */}
      <div className="panel p-2.5 sm:p-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-2.5">
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex rounded-full border border-border p-0.5" role="group" aria-label="Language">
            <button
              onClick={() => changeLang("hi")}
              aria-pressed={lang === "hi"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${lang === "hi" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              <Languages className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />Hinglish
            </button>
            <button
              onClick={() => changeLang("en")}
              aria-pressed={lang === "en"}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${lang === "en" ? "bg-foreground text-background" : "text-muted-foreground"}`}
            >
              English
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={toggleFocus} aria-pressed={focus} className="shrink-0">
            {focus ? <Minimize2 className="w-4 h-4 sm:mr-1" aria-hidden="true" /> : <Maximize2 className="w-4 h-4 sm:mr-1" aria-hidden="true" />}
            <span className="hidden sm:inline">{focus ? "Exit focus" : "Focus mode"}</span>
          </Button>
        </div>

        <div className="flex gap-2 items-center flex-nowrap overflow-x-auto no-scrollbar sm:ml-auto" role="group" aria-label="Filter by level">
          <span className="mono-label mr-1 shrink-0" aria-hidden="true">Level</span>
          <button onClick={() => setLevel("all")} aria-pressed={level === "all"} className={`chip shrink-0 ${level === "all" ? "!bg-foreground !text-background !border-foreground" : ""}`}>all</button>
          {LEVELS.map((l) => (
            <button key={l} onClick={() => setLevel(l)} aria-pressed={level === l} className={`chip shrink-0 ${level === l ? "!bg-primary !text-primary-foreground !border-primary" : ""}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className={focus ? "grid gap-4" : "grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start"}>
        {/* Lesson list */}
        {!focus && (
          <nav aria-label="Lessons" className="panel p-2 lg:sticky lg:top-20 w-full min-w-0">
            <div className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar lg:overflow-visible lg:max-h-[70vh] lg:overflow-y-auto reader-scroll">
              {list.map((l, i) => {
                const isActive = l.id === active.id;
                const t = lang === "en" && PYTHON_COURSE_EN[l.id] ? PYTHON_COURSE_EN[l.id].title : l.title;
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
                    <div className="text-[13px] font-semibold leading-snug mt-0.5 line-clamp-2">{t}</div>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* Lesson body */}
        <div className="min-w-0 grid gap-4">
          <article
            {...touchHandlers}
            className="panel overflow-hidden"
            aria-label={`Lesson ${idx + 1} of ${list.length}: ${title}`}
          >
            <div className="h-1 bg-muted relative" role="progressbar" aria-valuemin={0} aria-valuemax={list.length} aria-valuenow={idx + 1} aria-label="Lesson progress">
              <div className="absolute inset-y-0 left-0 bg-brand-blue transition-all duration-300" style={{ width: `${list.length ? ((idx + 1) / list.length) * 100 : 0}%` }} />
            </div>
            <div className="px-4 sm:px-8 pt-5 pb-4 border-b border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="chip !bg-muted">{active.level}</span>
                <span className="mono-label flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" /> {active.minutes} min</span>
                <span className="mono-label">{String(idx + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}</span>
                {done.includes(active.id) && <span className="chip !bg-brand-blue/10 !border-brand-blue/40"><Check className="w-3 h-3" aria-hidden="true" /> done</span>}
              </div>
              <h2 className="font-display text-xl sm:text-3xl font-bold tracking-tight mt-3">{title}</h2>
              <p className="text-sm text-muted-foreground mt-1.5">{summary}</p>
            </div>
            <div className={`transition-all duration-150 ease-out ${slideClass}`} key={`${active.id}-${lang}`}>
              <div className="reader-shell">
                <LessonDiagram lessonId={active.id} />
                <MarkdownView content={content} />
              </div>
            </div>
            <div className="px-4 sm:px-6 py-3 border-t border-border bg-card flex items-center justify-between gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => go("prev")} disabled={!hasPrev} aria-keyshortcuts="ArrowLeft">
                <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Prev
              </Button>
              <Button
                variant={done.includes(active.id) ? "default" : "ghost"}
                size="sm"
                onClick={() => markDone(active.id)}
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
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" /> {lang === "hi" ? "Khud try karo" : "Try it yourself"}
            </div>
            <PythonRunner initialCode={active.code} />
          </div>

          <LessonQuiz
            key={`${active.id}-quiz`}
            lessonId={active.id}
            lang={lang}
            onPass={() => markDone(active.id, true)}
          />

          {focus && (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={toggleFocus}>
                <List className="w-4 h-4 mr-1" aria-hidden="true" /> {lang === "hi" ? "Saare lessons dikhao" : "Show all lessons"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
