import { useMemo, useState } from "react";
import { PYTHON_QUIZ } from "@/content/python-quiz";
import { Button } from "@/components/ui/button";
import { Check, X, RotateCcw, Trophy } from "lucide-react";

type Lang = "hi" | "en";

export function LessonQuiz({
  lessonId,
  lang,
  onPass,
}: {
  lessonId: string;
  lang: Lang;
  onPass?: () => void;
}) {
  const questions = useMemo(() => PYTHON_QUIZ[lessonId] ?? [], [lessonId]);
  const [started, setStarted] = useState(false);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  if (questions.length === 0) return null;

  const total = questions.length;
  const finished = started && answers.length === total;
  const score = answers.reduce((s, a, idx) => s + (a === questions[idx].answer ? 1 : 0), 0);
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;

  function reset() {
    setStarted(false);
    setI(0);
    setPicked(null);
    setAnswers([]);
  }

  function submit() {
    if (picked == null) return;
    const next = [...answers, picked];
    setAnswers(next);
    if (next.length === total) {
      const s = next.reduce((acc, a, idx) => acc + (a === questions[idx].answer ? 1 : 0), 0);
      if (Math.round((s / total) * 100) >= 70) onPass?.();
    } else {
      setI(i + 1);
    }
    setPicked(null);
  }

  if (!started) {
    return (
      <section className="panel panel-accent-blue p-5 sm:p-6" aria-label="Lesson test">
        <div className="mono-label mb-2">Topic test</div>
        <h3 className="font-display text-lg sm:text-xl font-bold">
          {lang === "hi" ? "Is topic ka test do" : "Take the test for this topic"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {lang === "hi"
            ? `${total} technical questions — 70% ya usse zyada par lesson auto complete ho jayega.`
            : `${total} technical questions — score 70% or more and the lesson is marked done.`}
        </p>
        <Button className="mt-4" onClick={() => setStarted(true)}>
          {lang === "hi" ? "Test shuru karo" : "Start test"}
        </Button>
      </section>
    );
  }

  if (finished) {
    return (
      <section className="panel p-5 sm:p-6" aria-label="Test result" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl grid place-items-center ${passed ? "bg-brand-blue text-background" : "bg-brand-red text-background"}`}>
            <Trophy className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="mono-label">{lang === "hi" ? "Result" : "Result"}</div>
            <div className="font-display text-2xl font-bold">{score}/{total} · {pct}%</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {passed
            ? lang === "hi" ? "Shandaar! Topic clear hai — agle lesson pe jao." : "Great work — this topic is clear. Move to the next lesson."
            : lang === "hi" ? "Thoda aur revise karo, phir dobara try karo." : "Revise the lesson once more, then try again."}
        </p>

        <ol className="mt-4 grid gap-3">
          {questions.map((q, idx) => {
            const ok = answers[idx] === q.answer;
            return (
              <li key={idx} className="rounded-lg border border-border p-3">
                <div className="flex items-start gap-2">
                  {ok ? <Check className="w-4 h-4 text-brand-blue mt-0.5 shrink-0" aria-label="Correct" />
                      : <X className="w-4 h-4 text-brand-red mt-0.5 shrink-0" aria-label="Wrong" />}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{lang === "hi" ? q.q : q.qEn}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {lang === "hi" ? "Sahi jawab: " : "Correct answer: "}
                      <span className="font-semibold text-foreground">{q.options[q.answer]}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{lang === "hi" ? q.explain : q.explainEn}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <Button variant="outline" className="mt-4" onClick={reset}>
          <RotateCcw className="w-4 h-4 mr-1" aria-hidden="true" /> {lang === "hi" ? "Dobara do" : "Retake"}
        </Button>
      </section>
    );
  }

  const q = questions[i];
  return (
    <section className="panel p-5 sm:p-6" aria-label="Lesson test">
      <div className="flex items-center justify-between gap-2">
        <span className="mono-label">{lang === "hi" ? "Question" : "Question"} {i + 1} / {total}</span>
        <button onClick={reset} className="mono-label text-muted-foreground hover:text-foreground">
          {lang === "hi" ? "Cancel" : "Cancel"}
        </button>
      </div>
      <div className="h-1.5 mt-2 rounded-full bg-muted overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={i + 1}>
        <div className="h-full bg-brand-blue transition-all" style={{ width: `${((i) / total) * 100}%` }} />
      </div>

      <h3 className="font-display text-lg font-bold mt-4">{lang === "hi" ? q.q : q.qEn}</h3>

      <div className="grid gap-2 mt-4" role="radiogroup" aria-label="Options">
        {q.options.map((opt, oi) => (
          <button
            key={oi}
            role="radio"
            aria-checked={picked === oi}
            onClick={() => setPicked(oi)}
            className={`text-left rounded-lg border px-3 py-3 text-sm transition-colors ${
              picked === oi ? "border-primary bg-primary/10 font-semibold" : "border-border hover:bg-muted"
            }`}
          >
            <span className="mono-label mr-2">{String.fromCharCode(65 + oi)}</span>
            {opt}
          </button>
        ))}
      </div>

      <Button className="mt-4 w-full sm:w-auto" onClick={submit} disabled={picked == null}>
        {i + 1 === total ? (lang === "hi" ? "Finish" : "Finish") : (lang === "hi" ? "Next" : "Next")}
      </Button>
    </section>
  );
}
