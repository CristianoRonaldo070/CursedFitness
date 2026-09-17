import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SystemCore } from "@/components/brand";
import { useAuth } from "@/lib/auth";

interface AuthGuardProps {
  children: ReactNode;
  moduleName?: string;
}

export function AuthGuard({ children, moduleName = "System Module" }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and not authenticated, we don't necessarily force a flash redirect immediately,
    // but we present the full locked gate experience so the user clearly sees they must sign up / sign in.
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="size-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="system-label animate-pulse">Synchronizing Hunter Identity...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen pt-18">
        <SiteHeader />
        <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-4xl flex-col items-center justify-center px-5 py-12 text-center">
          <div className="relative mb-6 grid size-20 place-items-center border border-primary/40 bg-primary/10 shadow-[0_0_40px_var(--system-glow)] [clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]">
            <Lock className="size-8 text-primary" />
          </div>

          <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-primary">
            <ShieldAlert className="size-3.5" /> Access Restricted // Awakening Required
          </div>

          <h1 className="mt-5 text-4xl font-black uppercase md:text-6xl">
            Sign In to Unlock
            <br />
            <span className="text-primary text-glow">{moduleName}</span>
          </h1>

          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            All tactical protocols—including full body assessments, personalized calorie & macro nutrition matrices, and daily workout missions—are reserved for registered Hunters.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="green" size="system" className="min-w-[200px]">
              <Link to="/login">
                Sign In / Awaken <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild variant="orangeOutline" size="system">
              <Link to="/">Return to Home</Link>
            </Button>
          </div>

          <div className="mt-12 grid max-w-md grid-cols-2 gap-4 border-t border-border pt-8 text-left font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary shrink-0" />
              <span>Saves your stats & credentials permanently</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary shrink-0" />
              <span>Adaptive workout plans with 6 AM warm-up cycles</span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
