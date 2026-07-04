import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, RefreshCw, TrendingUp, Flame } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({ meta: [{ title: "Progress — PrepDesk" }] }),
  component: ProgressPage,
});

type P = { id: string; topic: string; confidence: number; last_reviewed: string; notes: string | null };

function ProgressPage() {
  const [items, setItems] = useState<P[]>([]);
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [notes, setNotes] = useState("");

  async function load() {
    const { data } = await (supabase as any).from("progress").select("*").order("last_reviewed", { ascending: false });
    setItems((data as any) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!topic.trim()) return toast.error("Topic required");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await (supabase as any).from("progress").insert({
      user_id: u.user.id, topic: topic.trim(), confidence, notes: notes.trim() || null,
    });
    if (error) return toast.error(error.message);
    setOpen(false); setTopic(""); setConfidence(3); setNotes("");
    toast.success("Topic added"); load();
  }

  async function updateConfidence(id: string, c: number) {
    await (supabase as any).from("progress").update({ confidence: c, last_reviewed: new Date().toISOString() }).eq("id", id);
    load();
  }

  async function markReviewed(id: string) {
    await (supabase as any).from("progress").update({ last_reviewed: new Date().toISOString() }).eq("id", id);
    toast.success("Marked as reviewed");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this topic?")) return;
    await (supabase as any).from("progress").delete().eq("id", id);
    load();
  }

  const stats = useMemo(() => {
    const total = items.length;
    const avg = total ? items.reduce((s, i) => s + i.confidence, 0) / total : 0;
    const mastered = items.filter((i) => i.confidence >= 4).length;
    const shaky = items.filter((i) => i.confidence <= 2).length;
    const today = new Date().toDateString();
    const reviewedToday = items.filter((i) => new Date(i.last_reviewed).toDateString() === today).length;
    // Buckets 1..5 count
    const buckets = [1, 2, 3, 4, 5].map((n) => ({ level: n, count: items.filter((i) => i.confidence === n).length }));
    return { total, avg, mastered, shaky, reviewedToday, buckets };
  }, [items]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header bento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="panel panel-accent-blue md:col-span-2 col-span-2 p-6">
          <div className="mono-label mb-2 inline-flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Progress</div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Confidence, tracked.</h1>
          <p className="text-sm text-muted-foreground mt-2">Rate each topic 1–5. Review often. Watch it climb.</p>
          <div className="mt-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" /> Add topic</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add a topic to track</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Topic</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. React Hooks" /></div>
                  <div className="space-y-2">
                    <Label>Confidence ({confidence}/5)</Label>
                    <input type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full accent-primary" />
                  </div>
                  <div className="space-y-2"><Label>Notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
                </div>
                <DialogFooter><Button onClick={add}>Add</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="panel panel-accent-blue p-5 flex flex-col justify-between">
          <span className="mono-label">Avg confidence</span>
          <div className="stat-num mt-3">{stats.total ? stats.avg.toFixed(1) : "—"}<span className="text-base text-muted-foreground font-sans font-normal">/5</span></div>
        </div>
        <div className="panel panel-accent-red p-5 flex flex-col justify-between">
          <span className="mono-label inline-flex items-center gap-1"><Flame className="w-3 h-3 text-brand-red" /> Reviewed today</span>
          <div className="stat-num mt-3">{stats.reviewedToday}</div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="panel p-5">
          <span className="mono-label">Topics</span>
          <div className="stat-num mt-2">{stats.total}</div>
        </div>
        <div className="panel p-5">
          <span className="mono-label text-brand-blue">Mastered (4-5)</span>
          <div className="stat-num mt-2">{stats.mastered}</div>
        </div>
        <div className="panel p-5 col-span-2 md:col-span-1">
          <span className="mono-label text-brand-red">Shaky (1-2)</span>
          <div className="stat-num mt-2">{stats.shaky}</div>
        </div>

        {/* Distribution */}
        <div className="panel p-5 md:col-span-3 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <span className="mono-label">Confidence distribution</span>
            <span className="mono-label">{stats.total} total</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {stats.buckets.map((b) => {
              const max = Math.max(1, ...stats.buckets.map((x) => x.count));
              const h = (b.count / max) * 100;
              const color = b.level <= 2 ? "bg-brand-red" : b.level === 3 ? "bg-muted-foreground" : "bg-brand-blue";
              return (
                <div key={b.level} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end h-full">
                    <div className={`w-full rounded-t ${color} transition-all`} style={{ height: `${h}%`, minHeight: b.count ? 6 : 2, opacity: b.count ? 1 : 0.15 }} />
                  </div>
                  <div className="mono-label">{b.level}</div>
                  <div className="text-xs font-semibold">{b.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Topic cards */}
      {items.length === 0 ? (
        <div className="panel p-12 text-center text-muted-foreground">No topics yet. Add one to start tracking.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((p) => {
            const pct = (p.confidence / 5) * 100;
            const barColor = p.confidence <= 2 ? "bg-brand-red" : p.confidence === 3 ? "bg-foreground/60" : "bg-brand-blue";
            return (
              <div key={p.id} className="panel panel-hover p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-lg truncate">{p.topic}</h3>
                    <div className="mono-label mt-1">Last reviewed {new Date(p.last_reviewed).toLocaleDateString()}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => remove(p.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {/* Confidence bar */}
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => updateConfidence(p.id, n)}
                        className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${n <= p.confidence ? "bg-foreground text-background scale-100" : "bg-muted text-muted-foreground hover:bg-accent scale-95"}`}
                        aria-label={`Set confidence ${n}`}
                      >{n}</button>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => markReviewed(p.id)}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reviewed
                  </Button>
                </div>

                {p.notes && (
                  <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/60 leading-relaxed">{p.notes}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
