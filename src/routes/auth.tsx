import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, BookOpenCheck, ArrowRight, Sparkles, MessageSquare, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — PrepDesk" },
      { name: "description", content: "Sign in to your personal interview prep workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Account created! Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/dashboard", replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr] bg-background">
      {/* LEFT — brand / bento showcase */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-foreground text-background overflow-hidden">
        {/* decorative blocks */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-blue/40 blur-3xl" />
        <div className="absolute bottom-10 -left-20 w-72 h-72 rounded-full bg-brand-red/30 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-background text-foreground grid place-items-center">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">PrepDesk</span>
        </div>

        <div className="relative space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-1 text-xs uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" /> Private workspace
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold leading-[1.05] tracking-tight">
            Ace your next
            <br />
            <span className="text-brand-blue">interview</span>{" "}
            <span className="inline-block w-3 h-3 rounded-sm bg-brand-red align-middle" />{" "}
            with focus.
          </h1>
          <p className="text-background/70 max-w-md leading-relaxed">
            Your own bento of Q&amp;A bank, AI mock interviews, notes and progress — all in one calm surface.
          </p>

          {/* mini bento preview */}
          <div className="grid grid-cols-3 gap-3 max-w-md">
            <div className="col-span-2 rounded-xl border border-background/15 bg-background/5 p-4">
              <MessageSquare className="w-4 h-4 mb-3 text-brand-blue" />
              <p className="text-sm font-medium">AI Mock Interview</p>
              <p className="text-xs text-background/60 mt-1">Live grilling on any topic.</p>
            </div>
            <div className="rounded-xl border border-background/15 bg-brand-red text-background p-4 flex flex-col justify-between">
              <Sparkles className="w-4 h-4" />
              <p className="text-xs font-semibold uppercase tracking-wide">Focus mode</p>
            </div>
            <div className="rounded-xl border border-background/15 bg-background/5 p-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-blue" />
              <p className="text-xs font-medium">Progress</p>
            </div>
            <div className="col-span-2 rounded-xl border border-background/15 bg-brand-blue text-background p-4">
              <p className="text-xs uppercase tracking-widest opacity-80">Today</p>
              <p className="font-display text-lg font-bold mt-1">Keep the streak alive.</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-background/50">© PrepDesk — Built for one focused mind.</p>
      </div>

      {/* RIGHT — auth form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-foreground text-background grid place-items-center">
              <BookOpenCheck className="w-4 h-4" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">PrepDesk</span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
            {mode === "signin" ? "Sign in" : "Create account"}
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back." : "Let's get you set up."}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "signin"
              ? "Pick up right where you left off."
              : "One account. One quiet place to prepare."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
            </div>
            <Button type="submit" className="w-full h-11 group" disabled={loading}>
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Please wait</>
              ) : (
                <>
                  {mode === "signin" ? "Sign in" : "Create account"}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-sm text-muted-foreground">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-foreground font-semibold underline underline-offset-4 decoration-brand-red decoration-2 hover:decoration-brand-blue"
            >
              {mode === "signin" ? "Create account" : "Sign in"}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground mt-10 leading-relaxed">
            Tip: after your first sign-up, disable new signups from Cloud → Users → Auth Settings to keep this workspace private.
          </p>
        </div>
      </div>
    </div>
  );
}
