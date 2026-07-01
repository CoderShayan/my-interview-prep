import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MarkdownView } from "@/components/markdown-view";

export const Route = createFileRoute("/_authenticated/notes")({
  head: () => ({ meta: [{ title: "Notes — PrepDesk" }] }),
  component: NotesPage,
});

type N = { id: string; title: string; content: string; topic: string | null; updated_at: string };

function NotesPage() {
  const [items, setItems] = useState<N[]>([]);
  const [active, setActive] = useState<N | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [reading, setReading] = useState(false);

  async function load() {
    const { data } = await (supabase as any).from("notes").select("*").order("updated_at", { ascending: false });
    setItems((data as any) ?? []);
  }
  useEffect(() => { load(); }, []);

  useEffect(() => {
    setTitle(active?.title ?? "");
    setContent(active?.content ?? "");
    setTopic(active?.topic ?? "");
  }, [active]);

  async function createNew() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await (supabase as any).from("notes").insert({ user_id: u.user.id, title: "Untitled note", content: "", topic: null }).select().single();
    if (error) return toast.error(error.message);
    await load();
    setActive(data as any);
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    const { error } = await (supabase as any).from("notes").update({ title: title || "Untitled", content, topic: topic || null }).eq("id", active.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this note?")) return;
    await (supabase as any).from("notes").delete().eq("id", id);
    if (active?.id === id) setActive(null);
    load();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-1">{items.length} notes</p>
        </div>
        <Button onClick={createNew}><Plus className="w-4 h-4 mr-1" /> New note</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <Card className="p-2 h-fit max-h-[70vh] overflow-y-auto">
          {items.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">No notes yet</p>}
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => setActive(n)}
              className={`w-full text-left p-3 rounded-md hover:bg-accent transition-colors ${active?.id === n.id ? "bg-accent" : ""}`}
            >
              <div className="font-medium text-sm truncate">{n.title}</div>
              {n.topic && <div className="text-xs text-muted-foreground mt-0.5">{n.topic}</div>}
              <div className="text-xs text-muted-foreground mt-0.5">{new Date(n.updated_at).toLocaleDateString()}</div>
            </button>
          ))}
        </Card>

        {active ? (
          <Card className="p-6">
            <div className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 shadow-none" />
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (optional)" className="text-sm border-0 px-0 focus-visible:ring-0 shadow-none text-muted-foreground" />
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes in markdown…" rows={18} className="font-mono text-sm" />
              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" onClick={() => remove(active.id)}>
                  <Trash2 className="w-4 h-4 mr-1 text-destructive" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setReading(true)} disabled={!content.trim()}>
                    <BookOpen className="w-4 h-4 mr-1" /> Read
                  </Button>
                  <Button onClick={save} disabled={saving}>
                    <Save className="w-4 h-4 mr-1" /> {saving ? "Saving…" : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center text-muted-foreground">
            Select a note or create a new one to start writing.
          </Card>
        )}
      </div>
    </div>

    <Dialog open={reading} onOpenChange={setReading}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title || "Untitled"}</DialogTitle>
          {topic && <p className="text-sm text-muted-foreground">{topic}</p>}
        </DialogHeader>
        <MarkdownView content={content} />
      </DialogContent>
    </Dialog>
    </>
  );
}
