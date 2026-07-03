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

        <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 no-scrollbar">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground bg-muted whitespace-nowrap flex items-center gap-1 shrink-0"
              activeProps={{ className: "px-3 py-1.5 rounded-full text-xs font-semibold bg-foreground text-background whitespace-nowrap flex items-center gap-1 shrink-0" }}
            >
              <l.icon className="w-3.5 h-3.5" />
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
