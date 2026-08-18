import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, MessageSquare, NotebookPen, TrendingUp, LogOut, LayoutDashboard, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/questions", label: "Questions", icon: BookOpen },
  { to: "/mock-interview", label: "Mock", icon: MessageSquare },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/progress", label: "Progress", icon: TrendingUp },
] as const;

function AuthedLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto px-4 h-16 grid grid-cols-[auto_1fr_auto] items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background grid place-items-center shrink-0">
              <BookOpenCheck className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight truncate">PrepDesk</span>
          </Link>

          <nav className="hidden md:flex items-center justify-center gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                activeProps={{ className: "px-3 py-1.5 rounded-full text-sm font-semibold text-primary-foreground bg-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <Button variant="ghost" size="sm" onClick={signOut} className="shrink-0">
            <LogOut className="w-4 h-4 md:mr-1" /> <span className="hidden md:inline">Sign out</span>
          </Button>
        </div>

      </header>

      <main className="container mx-auto px-3 sm:px-4 py-5 sm:py-8 md:py-10 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar — big tap targets */}
      <nav
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium text-muted-foreground min-w-0"
              activeProps={{ className: "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold text-primary min-w-0" }}
            >
              <l.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-full px-0.5">{l.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
