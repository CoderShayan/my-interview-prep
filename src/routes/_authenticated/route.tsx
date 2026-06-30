import { createFileRoute, Outlet, redirect, Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, MessageSquare, NotebookPen, TrendingUp, LogOut, LayoutDashboard } from "lucide-react";
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

function AuthedLayout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/questions", label: "Questions", icon: BookOpen },
    { to: "/mock-interview", label: "Mock Interview", icon: MessageSquare },
    { to: "/notes", label: "Notes", icon: NotebookPen },
    { to: "/progress", label: "Progress", icon: TrendingUp },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/dashboard" className="font-bold text-lg tracking-tight">
            <span className="text-primary">Prep</span>Desk
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                activeProps={{ className: "px-3 py-2 rounded-md text-sm font-medium text-foreground bg-accent" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-1" /> Sign out
          </Button>
        </div>
        <nav className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2 border-t border-border">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground whitespace-nowrap"
              activeProps={{ className: "px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground whitespace-nowrap" }}
            >
              <l.icon className="w-3.5 h-3.5 inline mr-1" />
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
