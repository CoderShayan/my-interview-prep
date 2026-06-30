import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, RefreshCw } from "lucide-react";
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
    const { data } = await supabase.from("progress" as any).select("*").order("last_reviewed", { ascending: false });
    setItems((data as any) ?? []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!topic.trim()) return toast.error("Topic required");
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("progress" as any).insert({
      user_id: u.user.id, topic: topic.trim(), confidence, notes: notes.trim() || null,
    });
    if (error) return toast.error(error.message);
    setOpen(false); setTopic(""); setConfidence(3); setNotes("");
    toast.success("Topic added"); load();
  }

  async function updateConfidence(id: string, c: number) {
    await supabase.from("progress" as any).update({ confidence: c, last_reviewed: new Date().toISOString() }).eq("id", id);
    load();
  }

  async function markReviewed(id: string) {
    await supabase.from("progress" as any).update({ last_reviewed: new Date().toISOString() }).eq("id", id);
    toast.success("Marked as reviewed");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this topic?")) return;
    await supabase.from("progress" as any).delete().eq("id", id);
    load();
  }

  const avg = items.length ? (items.reduce((s, i) => s + i.confidence, 0) / items.length).toFixed(1) : "—";

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Progress Tracker</h1>
          <p className="text-muted-foreground mt-1">{items.length} topics • avg confidence {avg}/5</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-1" /> Add topic</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add a topic to track</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Topic</Label><Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. React Hooks" /></div>
              <div className="space-y-2">
                <Label>Confidence ({confidence}/5)</Label>
                <input type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full" />
              </div>
              <div className="space-y-2"><Label>Notes (optional)</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
            </div>
            <DialogFooter><Button onClick={add}>Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No topics yet. Add one to start tracking.</Card>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <Card key={p.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <h3 className="font-semibold text-lg">{p.topic}</h3>
                  {p.notes && <p className="text-sm text-muted-foreground mt-1">{p.notes}</p>}
                  <p className="text-xs text-muted-foreground mt-2">Last reviewed: {new Date(p.last_reviewed).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => updateConfidence(p.id, n)} className={`w-7 h-7 rounded-md text-xs font-bold transition-colors ${n <= p.confidence ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{n}</button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => markReviewed(p.id)}><RefreshCw className="w-3.5 h-3.5 mr-1" /> Reviewed</Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
