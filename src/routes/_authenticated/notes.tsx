import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, BookOpen, Search, X, ChevronLeft, ChevronRight, FileText, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarkdownView } from "@/components/markdown-view";
import { useReaderNav } from "@/hooks/use-reader-nav";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({ meta: [{ title: "Notes — PrepDesk" }] }),
  component: NotesPage,
});

type N = { id: string; title: string; content: string; topic: string | null; updated_at: string };

function NotesPage() {
  const [items, setItems] = useState<N[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterTopic, setFilterTopic] = useState<string>("all");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);

  async function load() {
    const { data } = await (supabase as any).from("notes").select("*").order("updated_at", { ascending: false });
    setItems((data as any) ?? []);
  }
  useEffect(() => { load(); }, []);

  const active = items.find((n) => n.id === activeId) ?? null;

  useEffect(() => {
    setTitle(active?.title ?? "");
    setContent(active?.content ?? "");
    setTopic(active?.topic ?? "");
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const topics = useMemo(() => Array.from(new Set(items.map((i) => i.topic).filter(Boolean) as string[])), [items]);
  const filtered = items.filter((n) => {
    if (filterTopic !== "all" && n.topic !== filterTopic) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const today = new Date().toDateString();
  const stats = {
    total: items.length,
    topics: topics.length,
    todayCount: items.filter((n) => new Date(n.updated_at).toDateString() === today).length,
  };

  async function createNew() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await (supabase as any).from("notes").insert({
      user_id: u.user.id, title: "Untitled note", content: "", topic: null,
    }).select().single();
    if (error) return toast.error(error.message);
    await load();
    setActiveId((data as any).id);
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    const { error } = await (supabase as any).from("notes")
      .update({ title: title || "Untitled", content, topic: topic || null })
      .eq("id", active.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    await (supabase as any).from("notes").delete().eq("id", id);
    if (activeId === id) setActiveId(null);
    if (readingId === id) setReadingId(null);
    load();
  }

  // Reader navigation
  const readIdx = filtered.findIndex((n) => n.id === readingId);
  const reading = readIdx >= 0 ? filtered[readIdx] : null;
  function readGo(dir: "next" | "prev") {
    if (dir === "next" && readIdx < filtered.length - 1) {
      setSwipeDir("left");
      setTimeout(() => { setReadingId(filtered[readIdx + 1].id); setSwipeDir(null); }, 160);
    } else if (dir === "prev" && readIdx > 0) {
      setSwipeDir("right");
      setTimeout(() => { setReadingId(filtered[readIdx - 1].id); setSwipeDir(null); }, 160);
    }
  }
  useEffect(() => {
    if (!reading) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") readGo("next");
      else if (e.key === "ArrowLeft") readGo("prev");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reading?.id, readIdx, filtered.length]);

  return (
    <>
      <div className="max-w-6xl mx-auto">
        {/* Header bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="panel panel-accent-blue md:col-span-2 p-6 col-span-2">
            <div className="mono-label mb-2">Notes</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Your study desk.</h1>
            <p className="text-sm text-muted-foreground mt-2">Write in markdown. Read like a book.</p>
            <div className="mt-4"><Button onClick={createNew}><Plus className="w-4 h-4 mr-1" /> New note</Button></div>
          </div>
          <StatTile label="Total" value={stats.total} />
          <StatTile label="Topics" value={stats.topics} accent="red" />
        </div>

        {/* Filter */}
        <div className="panel p-3 mb-5">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search notes…" className="pl-9 h-10 border-0 bg-muted" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="mono-label">{stats.todayCount} today</div>
          </div>
          {topics.length > 0 && (
            <div className="flex gap-2 items-center flex-nowrap mt-3 overflow-x-auto pb-1">
              <span className="mono-label mr-1 shrink-0">Topic</span>
              <button onClick={() => setFilterTopic("all")} className={`chip shrink-0 ${filterTopic === "all" ? "!bg-foreground !text-background !border-foreground" : ""}`}>all</button>
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterTopic(t)}
                  className={`chip shrink-0 ${filterTopic === t ? "!bg-primary !text-primary-foreground !border-primary" : ""}`}
                >{t}</button>
              ))}
            </div>
          )}
        </div>

        {/* Notes grid */}
        {filtered.length === 0 ? (
          <div className="panel p-12 text-center text-muted-foreground">
            {items.length === 0 ? "No notes yet. Create your first one!" : "No notes match your filter."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((n) => (
              <div
                key={n.id}
                className="panel panel-hover p-5 flex flex-col cursor-pointer group min-h-[180px]"
                onClick={() => setActiveId(n.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <FileText className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                  {n.topic && <span className="chip !bg-muted text-xs">{n.topic}</span>}
                </div>
                <h3 className="font-display font-semibold text-base leading-snug line-clamp-2">{n.title || "Untitled"}</h3>
                <p className="text-[13px] text-muted-foreground mt-2 line-clamp-4 leading-relaxed flex-1">
                  {(n.content || "No content yet…").replace(/[#*`>_-]+/g, " ").slice(0, 220)}
                </p>
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between opacity-70 group-hover:opacity-100">
                  <span className="mono-label">{new Date(n.updated_at).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setReadingId(n.id); }} aria-label="Read">
                      <BookOpen className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); remove(n.id); }} aria-label="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor dialog */}
      <Dialog open={!!active} onOpenChange={(v) => !v && setActiveId(null)}>
        <DialogContent className="max-w-3xl w-[96vw] max-h-[92vh] overflow-hidden p-0 gap-0">
          {active && (
            <div className="flex flex-col max-h-[92vh]">
              <div className="px-6 pt-5 pb-3 border-b bg-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="mono-label">Editing note</span>
                  <Button variant="ghost" size="icon" onClick={() => setActiveId(null)} className="h-8 w-8"><X className="w-4 h-4" /></Button>
                </div>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="text-xl font-display font-bold border-0 px-0 focus-visible:ring-0 shadow-none h-auto" />
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (optional)" className="text-sm border-0 px-0 focus-visible:ring-0 shadow-none text-muted-foreground h-auto mt-1" />
              </div>
              <Tabs defaultValue="write" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-6 pt-3 border-b bg-card">
                  <TabsList className="grid grid-cols-2 w-fit">
                    <TabsTrigger value="write"><Pencil className="w-3.5 h-3.5 mr-1" /> Write</TabsTrigger>
                    <TabsTrigger value="preview"><Eye className="w-3.5 h-3.5 mr-1" /> Preview</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value="write" className="flex-1 overflow-y-auto reader-scroll m-0 p-6">
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your notes in markdown…"
                    className="font-mono text-sm min-h-[45vh] resize-none border-0 focus-visible:ring-0 shadow-none px-0"
                  />
                </TabsContent>
                <TabsContent value="preview" className="flex-1 overflow-y-auto reader-scroll m-0">
                  <div className="reader-shell">
                    <MarkdownView content={content} />
                  </div>
                </TabsContent>
              </Tabs>
              <div className="px-4 md:px-6 py-3 border-t bg-card flex items-center justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={() => remove(active.id)}>
                  <Trash2 className="w-4 h-4 mr-1 text-destructive" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { save(); setReadingId(active.id); setActiveId(null); }} disabled={!content.trim()}>
                    <BookOpen className="w-4 h-4 mr-1" /> Read
                  </Button>
                  <Button size="sm" onClick={save} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reader dialog */}
      <Dialog open={!!reading} onOpenChange={(v) => !v && setReadingId(null)}>
        <DialogContent className="max-w-4xl w-[96vw] max-h-[92vh] overflow-hidden p-0 gap-0 border-2">
          {reading && (
            <div
              className="flex flex-col max-h-[92vh]"
              onTouchStart={(e) => {
                touchStartX.current = e.touches[0].clientX;
                touchStartY.current = e.touches[0].clientY;
              }}
              onTouchEnd={(e) => {
                if (touchStartX.current == null || touchStartY.current == null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                const dy = e.changedTouches[0].clientY - touchStartY.current;
                if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
                  if (dx < 0) readGo("next"); else readGo("prev");
                }
                touchStartX.current = null;
                touchStartY.current = null;
              }}
            >
              <div className="h-1 bg-muted relative">
                <div className="absolute inset-y-0 left-0 bg-brand-blue transition-all duration-300" style={{ width: `${filtered.length ? ((readIdx + 1) / filtered.length) * 100 : 0}%` }} />
              </div>
              <div className="px-6 md:px-10 pt-6 pb-5 border-b bg-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="mono-label">
                    Note <span className="text-foreground">{String(readIdx + 1).padStart(2, "0")}</span> / {String(filtered.length).padStart(2, "0")}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setActiveId(reading.id); setReadingId(null); }} className="h-8 w-8" aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setReadingId(null)} className="h-8 w-8" aria-label="Close"><X className="w-4 h-4" /></Button>
                  </div>
                </div>
                {reading.topic && <span className="chip !bg-muted mb-3 inline-flex">{reading.topic}</span>}
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl md:text-3xl leading-tight tracking-tight">
                    {reading.title || "Untitled"}
                  </DialogTitle>
                </DialogHeader>
                <p className="mono-label mt-2">Updated {new Date(reading.updated_at).toLocaleString()}</p>
              </div>
              <div
                key={reading.id}
                className={`flex-1 overflow-y-auto reader-scroll reader-bg transition-all duration-150 ease-out ${
                  swipeDir === "left" ? "-translate-x-6 opacity-0" :
                  swipeDir === "right" ? "translate-x-6 opacity-0" : "translate-x-0 opacity-100"
                }`}
              >
                <div className="reader-shell">
                  <MarkdownView content={reading.content} />
                </div>
              </div>
              <div className="px-4 md:px-6 py-3 border-t bg-card flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" onClick={() => readGo("prev")} disabled={readIdx <= 0}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <span className="hidden md:inline mono-label">← → or swipe</span>
                <Button size="sm" onClick={() => readGo("next")} disabled={readIdx >= filtered.length - 1}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number | string; accent?: "red" | "blue" }) {
  return (
    <div className={`panel p-5 flex flex-col justify-between ${accent === "red" ? "panel-accent-red" : "panel-accent-blue"}`}>
      <span className="mono-label">{label}</span>
      <div className="stat-num mt-3">{value}</div>
    </div>
  );
}
