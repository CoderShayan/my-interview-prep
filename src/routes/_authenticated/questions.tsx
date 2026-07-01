import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Star, Search, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { MarkdownView } from "@/components/markdown-view";

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

function QuestionsPage() {
  const [items, setItems] = useState<Q[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Q | null>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [viewing, setViewing] = useState<Q | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await (supabase as any).from("questions").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setItems((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const filtered = items.filter((i) => {
    if (filterCat !== "all" && i.category !== filterCat) return false;
    if (search && !i.question.toLowerCase().includes(search.toLowerCase()) && !(i.answer ?? "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Questions Bank</h1>
          <p className="text-muted-foreground mt-1">{items.length} saved questions</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing(null)}><Plus className="w-4 h-4 mr-1" /> Add question</Button>
          </DialogTrigger>
          <QuestionDialog editing={editing} onDone={() => { setOpen(false); setEditing(null); load(); }} />
        </Dialog>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search questions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-10">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No questions yet. Add your first one!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="secondary">{q.category}</Badge>
                    <Badge variant={q.difficulty === "hard" ? "destructive" : q.difficulty === "easy" ? "default" : "outline"}>{q.difficulty}</Badge>
                  </div>
                  <h3 className="font-semibold text-base">{q.question}</h3>
                  {q.answer && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 whitespace-pre-wrap">{q.answer}</p>
                  )}
                  <div className="mt-3">
                    <Button variant="outline" size="sm" onClick={() => setViewing(q)}>
                      <BookOpen className="w-4 h-4 mr-1" /> Read
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toggleFav(q)}>
                    <Star className={`w-4 h-4 ${q.is_favorite ? "fill-amber-400 text-amber-400" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(q); setOpen(true); }}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(q.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!viewing} onOpenChange={(v) => !v && setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {viewing && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="secondary">{viewing.category}</Badge>
                  <Badge variant={viewing.difficulty === "hard" ? "destructive" : viewing.difficulty === "easy" ? "default" : "outline"}>{viewing.difficulty}</Badge>
                  {viewing.is_favorite && <Badge className="bg-amber-400 text-amber-950 hover:bg-amber-400">★ Favorite</Badge>}
                </div>
                <DialogTitle className="text-2xl leading-snug">{viewing.question}</DialogTitle>
              </DialogHeader>
              <div className="mt-2">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Answer</h4>
                <MarkdownView content={viewing.answer ?? ""} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
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
          <Label>Answer / Notes</Label>
          <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={save} disabled={saving}>{editing ? "Save changes" : "Add question"}</Button>
      </DialogFooter>
    </DialogContent>
  );
}
