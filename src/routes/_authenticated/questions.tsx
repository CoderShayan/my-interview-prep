import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Star, Search, BookOpen, ChevronLeft, ChevronRight, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { MarkdownView } from "@/components/markdown-view";
import { useReaderNav } from "@/hooks/use-reader-nav";

export const Route = createFileRoute("/_authenticated/questions")({
  head: () => ({ meta: [{ title: "Questions — PrepDesk" }] }),
  component: QuestionsPage,
});

type Q = {
  id: string;
  category: string;
  question: string;
  answer: string | null;
  difficulty: string;
  is_favorite: boolean;
  created_at: string;
};

const DIFFICULTIES = ["easy", "medium", "hard"];

function difficultyDot(d: string) {
  return d === "hard" ? "bg-brand-red" : d === "easy" ? "bg-brand-blue" : "bg-foreground/50";
}

function QuestionsPage() {
  const [items, setItems] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Q | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [filterDiff, setFilterDiff] = useState<string>("all");
  const [favOnly, setFavOnly] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await (supabase as any).from("questions").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);
  const filtered = items.filter((i) => {
    if (filterCat !== "all" && i.category !== filterCat) return false;
    if (filterDiff !== "all" && i.difficulty !== filterDiff) return false;
    if (favOnly && !i.is_favorite) return false;
    if (search && !i.question.toLowerCase().includes(search.toLowerCase()) && !(i.answer ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: items.length,
    favorites: items.filter((i) => i.is_favorite).length,
    hard: items.filter((i) => i.difficulty === "hard").length,
  };

  async function remove(id: string) {
    if (!confirm("Delete this question?")) return;
    const { error } = await (supabase as any).from("questions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  async function toggleFav(q: Q) {
    await (supabase as any).from("questions").update({ is_favorite: !q.is_favorite }).eq("id", q.id);
    load();
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3 mb-5 md:mb-6">
        <div className="panel panel-accent-red col-span-2 md:col-span-2 p-5 md:p-6">
          <div className="mono-label mb-2">Questions Bank</div>
          <h1 className="font-display text-2xl md:text-4xl font-bold tracking-tight leading-tight">Sharpen every answer.</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-2">{items.length} saved · practice, review, master.</p>
          <div className="mt-4">
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)} size="sm" className="md:h-10 md:px-4"><Plus className="w-4 h-4 mr-1" /> Add question</Button>
              </DialogTrigger>
              <QuestionDialog editing={editing} onDone={() => { setOpen(false); setEditing(null); load(); }} />
            </Dialog>
          </div>
        </div>
        <StatTile label="Total" value={stats.total} accent="blue" />
        <StatTile label="Favorites" value={stats.favorites} accent="red" icon={<Star className="w-4 h-4 fill-amber-400 text-amber-400" />} />
      </div>

      {/* Filter bar */}
      <div className="panel p-3 mb-5 md:sticky md:top-16 md:z-20 backdrop-blur bg-card/85">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search…" className="pl-9 h-10 border-0 bg-muted focus-visible:ring-1" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button
            size="icon"
            variant={favOnly ? "default" : "outline"}
            onClick={() => setFavOnly((v) => !v)}
            className="h-10 w-10 shrink-0"
            aria-label="Favorites only"
          >
            <Star className={`w-4 h-4 ${favOnly ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div className="flex gap-1.5 items-center flex-nowrap mt-3 overflow-x-auto no-scrollbar pb-1">
          <span className="mono-label mr-1 shrink-0">Diff</span>
          {["all", ...DIFFICULTIES].map((d) => (
            <button
              key={d}
              onClick={() => setFilterDiff(d)}
              className={`chip shrink-0 transition ${filterDiff === d ? "!bg-foreground !text-background !border-foreground" : "hover:!border-foreground/40"}`}
            >
              {d !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${difficultyDot(d)}`} />}
              {d}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-1.5 items-center flex-nowrap mt-2 overflow-x-auto no-scrollbar pb-1">
            <span className="mono-label mr-1 shrink-0">Cat</span>
            {["all", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className={`chip shrink-0 transition ${filterCat === c ? "!bg-primary !text-primary-foreground !border-primary" : "hover:!border-primary/50"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-10">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="text-muted-foreground">No questions match. Try clearing filters or add a new one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((q) => (
            <div
              key={q.id}
              onClick={() => setViewingId(q.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setViewingId(q.id); } }}
              role="button"
              tabIndex={0}
              aria-label={`Open question: ${q.question}`}
              className="panel panel-hover p-4 md:p-5 flex flex-col cursor-pointer group active:scale-[0.99] transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className="chip !bg-muted"><span className="sr-only">Category: </span>{q.category}</span>
                  <span className="chip">
                    <span className={`w-1.5 h-1.5 rounded-full ${difficultyDot(q.difficulty)}`} aria-hidden="true" />
                    <span className="sr-only">Difficulty: </span>{q.difficulty}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFav(q); }}
                  className="shrink-0 -mt-1 -mr-1 p-1.5 rounded-md hover:bg-muted transition"
                  aria-label={q.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  aria-pressed={q.is_favorite}
                >
                  <Star className={`w-4 h-4 ${q.is_favorite ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} aria-hidden="true" />
                </button>
              </div>

              <h3 className="font-display font-semibold text-[15px] leading-snug line-clamp-3 min-h-[3.4rem]">
                {q.question}
              </h3>

              {q.answer && (
                <p className="text-[13px] text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                  {q.answer.replace(/[#*`>_-]+/g, " ").slice(0, 180)}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between opacity-90 group-hover:opacity-100 transition">
                <span className="mono-label inline-flex items-center gap-1"><BookOpen className="w-3 h-3" aria-hidden="true" /> Read</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditing(q); setOpen(true); }} aria-label={`Edit question: ${q.question}`}>
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); remove(q.id); }} aria-label={`Delete question: ${q.question}`}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReaderDialog
        list={filtered}
        viewingId={viewingId}
        onClose={() => setViewingId(null)}
        onNavigate={setViewingId}
        onToggleFav={toggleFav}
      />
    </div>
  );
}

function StatTile({ label, value, accent, icon }: { label: string; value: number | string; accent: "red" | "blue"; icon?: React.ReactNode }) {
  return (
    <div className={`panel p-5 flex flex-col justify-between ${accent === "red" ? "panel-accent-red" : "panel-accent-blue"}`}>
      <div className="flex items-center justify-between">
        <span className="mono-label">{label}</span>
        {icon}
      </div>
      <div className="stat-num mt-3">{value}</div>
    </div>
  );
}

function ReaderDialog({
  list, viewingId, onClose, onNavigate, onToggleFav,
}: {
  list: Q[];
  viewingId: string | null;
  onClose: () => void;
  onNavigate: (id: string) => void;
  onToggleFav: (q: Q) => void;
}) {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const idx = list.findIndex((q) => q.id === viewingId);
  const viewing = idx >= 0 ? list[idx] : null;
  const hasPrev = idx > 0;
  const hasNext = idx >= 0 && idx < list.length - 1;
  const progress = list.length ? ((idx + 1) / list.length) * 100 : 0;

  const { go, touchHandlers, slideClass } = useReaderNav({
    enabled: !!viewing,
    hasPrev, hasNext,
    onPrev: () => hasPrev && onNavigate(list[idx - 1].id),
    onNext: () => hasNext && onNavigate(list[idx + 1].id),
    deps: [idx, list.length],
  });

  function toggleReviewed() {
    if (!viewing) return;
    setReviewed((s) => {
      const n = new Set(s);
      if (n.has(viewing.id)) n.delete(viewing.id); else n.add(viewing.id);
      return n;
    });
  }

  return (
    <Dialog open={!!viewing} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-4xl w-[100vw] sm:w-[96vw] h-[100dvh] sm:h-auto sm:max-h-[92vh] overflow-hidden p-0 gap-0 sm:border-2 rounded-none sm:rounded-lg"
        aria-label="Question reader"
      >
        {viewing && (
          <div
            className="flex flex-col h-[100dvh] sm:h-auto sm:max-h-[92vh]"
            {...touchHandlers}
            role="region"
            aria-roledescription="carousel"
            aria-label={`Question ${idx + 1} of ${list.length}`}
          >
            {/* Progress bar */}
            <div
              className="h-1 bg-muted relative"
              role="progressbar"
              aria-label="Reading progress"
              aria-valuemin={0}
              aria-valuemax={list.length}
              aria-valuenow={idx + 1}
              aria-valuetext={`Question ${idx + 1} of ${list.length}`}
            >
              <div className="absolute inset-y-0 left-0 bg-brand-red transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {/* Header */}
            <div className="px-4 md:px-10 pt-4 md:pt-6 pb-4 md:pb-5 border-b bg-card">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <div className="mono-label" aria-live="polite" aria-atomic="true">
                  <span className="sr-only">Question </span>
                  <span className="text-foreground">{String(idx + 1).padStart(2, "0")}</span>
                  <span aria-hidden="true"> / </span>
                  <span className="sr-only">of </span>
                  {String(list.length).padStart(2, "0")}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost" size="icon" onClick={toggleReviewed}
                    className="h-9 w-9 sm:hidden"
                    aria-label={reviewed.has(viewing.id) ? "Unmark as reviewed" : "Mark as reviewed"}
                    aria-pressed={reviewed.has(viewing.id)}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${reviewed.has(viewing.id) ? "text-brand-blue" : ""}`} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" onClick={() => onToggleFav(viewing)}
                    className="h-9 w-9"
                    aria-label={viewing.is_favorite ? "Remove from favorites" : "Add to favorites"}
                    aria-pressed={viewing.is_favorite}
                  >
                    <Star className={`w-4 h-4 ${viewing.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} aria-hidden="true" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9" aria-label="Close reader">
                    <X className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap mb-3">
                <span className="chip !bg-muted"><span className="sr-only">Category: </span>{viewing.category}</span>
                <span className="chip">
                  <span className={`w-1.5 h-1.5 rounded-full ${difficultyDot(viewing.difficulty)}`} aria-hidden="true" />
                  <span className="sr-only">Difficulty: </span>{viewing.difficulty}
                </span>
                {reviewed.has(viewing.id) && (
                  <span className="chip !border-brand-blue text-brand-blue">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Reviewed
                  </span>
                )}
              </div>
              <DialogHeader>
                <DialogTitle className="font-display text-xl md:text-3xl leading-tight tracking-tight">
                  {viewing.question}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  Question {idx + 1} of {list.length}. Category {viewing.category}, difficulty {viewing.difficulty}. Use left and right arrow keys or swipe to navigate.
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Body */}
            <article
              key={viewing.id}
              className={`flex-1 overflow-y-auto reader-scroll reader-bg transition-all duration-150 ease-out ${slideClass}`}
              aria-label={`Answer to: ${viewing.question}`}
              tabIndex={0}
            >
              <div className="reader-shell">
                <div className="flex items-center gap-3 mb-6" aria-hidden="true">
                  <span className="h-px flex-1 bg-border" />
                  <span className="mono-label !text-brand-red">Answer</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <h2 className="sr-only">Answer</h2>
                <MarkdownView content={viewing.answer ?? ""} />
              </div>
            </article>

            {/* Footer nav */}
            <div className="px-4 md:px-6 py-3 border-t bg-card flex items-center justify-between gap-2">
              <Button
                variant="outline" size="sm" onClick={() => go("prev")} disabled={!hasPrev}
                aria-label="Previous question" aria-keyshortcuts="ArrowLeft"
              >
                <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" /> Prev
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant={reviewed.has(viewing.id) ? "default" : "outline"}
                  onClick={toggleReviewed}
                  className="hidden sm:inline-flex"
                  aria-pressed={reviewed.has(viewing.id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" aria-hidden="true" />
                  {reviewed.has(viewing.id) ? "Reviewed" : "Mark reviewed"}
                </Button>
                <span className="hidden md:inline mono-label" aria-hidden="true">← → or swipe</span>
              </div>
              <Button
                size="sm" onClick={() => go("next")} disabled={!hasNext}
                aria-label="Next question" aria-keyshortcuts="ArrowRight"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function QuestionDialog({ editing, onDone }: { editing: Q | null; onDone: () => void }) {
  const [category, setCategory] = useState(editing?.category ?? "General");
  const [question, setQuestion] = useState(editing?.question ?? "");
  const [answer, setAnswer] = useState(editing?.answer ?? "");
  const [difficulty, setDifficulty] = useState(editing?.difficulty ?? "medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setCategory(editing?.category ?? "General");
    setQuestion(editing?.question ?? "");
    setAnswer(editing?.answer ?? "");
    setDifficulty(editing?.difficulty ?? "medium");
  }, [editing]);

  async function save() {
    if (!question.trim()) return toast.error("Question is required");
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const payload = { category: category.trim() || "General", question: question.trim(), answer: answer.trim() || null, difficulty };
    const { error } = editing
      ? await (supabase as any).from("questions").update(payload).eq("id", editing.id)
      : await (supabase as any).from("questions").insert({ ...payload, user_id: u.user.id });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Updated" : "Added");
    onDone();
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader><DialogTitle>{editing ? "Edit question" : "Add question"}</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. React, DSA" />
          </div>
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} />
        </div>
        <div className="space-y-2">
          <Label>Answer / Notes <span className="text-xs text-muted-foreground">(markdown supported)</span></Label>
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={8} className="font-mono text-sm" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={save} disabled={saving}>{editing ? "Save changes" : "Add question"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
