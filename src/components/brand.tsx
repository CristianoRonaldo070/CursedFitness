import { Link } from "@tanstack/react-router";
import { Lock, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="CursedFitness home">
      <span className="relative grid size-9 place-items-center border border-primary/70 bg-primary/10 shadow-[0_0_24px_var(--system-glow)] [clip-path:polygon(50%_0,100%_22%,86%_86%,50%_100%,14%_86%,0_22%)]">
        <span className="font-display text-lg font-black text-primary">C</span>
      </span>
      {!compact && (
        <span className="font-display text-xl font-black uppercase tracking-[0.08em] text-foreground">
          Cursed<span className="text-primary">Fitness</span>
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.info("Hunter neural link disconnected.");
  }

  const links = [
    { to: "/", label: "Home", protected: false },
    { to: "/assessment", label: "Assessment", protected: true },
    { to: "/dashboard", label: "System", protected: true },
    { to: "/diet", label: "Diet", protected: true },
  ] as const;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <BrandMark />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => {
            const destination = link.protected && !isAuthenticated ? "/login" : link.to;
            return (
              <Link
                key={link.to}
                to={destination}
                activeProps={{ className: "text-primary" }}
                className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
                {link.protected && !isAuthenticated && (
                  <Lock className="size-3 text-muted-foreground/70" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="hidden md:flex md:items-center md:gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-primary">
                // {user?.name || "Hunter"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="font-mono text-xs uppercase text-muted-foreground hover:text-destructive"
              >
                <LogOut className="mr-1 size-3.5" /> Disconnect
              </Button>
            </div>
          ) : (
            <Button asChild variant="systemOutline" size="system">
              <Link to="/login">Enter system</Link>
            </Button>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav
          className="border-t border-border bg-background px-5 py-5 md:hidden"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-4">
            {links.map((link) => {
              const destination = link.protected && !isAuthenticated ? "/login" : link.to;
              return (
                <Link
                  key={link.to}
                  to={destination}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground"
                >
                  <span>{link.label}</span>
                  {link.protected && !isAuthenticated && (
                    <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/60">
                      <Lock className="size-3" /> Sign in
                    </span>
                  )}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="system"
                onClick={() => {
                  handleSignOut();
                  setOpen(false);
                }}
                className="justify-start font-mono text-xs uppercase text-destructive"
              >
                <LogOut className="mr-2 size-4" /> Disconnect ({user?.name || "Hunter"})
              </Button>
            ) : (
              <Button asChild variant="system" size="system">
                <Link to="/login" onClick={() => setOpen(false)}>
                  Enter system
                </Link>
              </Button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

export function SystemCore() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[470px]" aria-label="Animated CursedFitness system core">
      <div className="absolute inset-[8%] rounded-full border border-primary/20 shadow-[0_0_80px_var(--system-glow)]" />
      <div className="animate-core-spin absolute inset-[14%] rounded-full border border-dashed border-primary/45" />
      <div className="animate-core-reverse absolute inset-[22%] rotate-45 border-2 border-primary/60 shadow-[inset_0_0_30px_var(--system-glow)]" />
      <div className="animate-core-spin absolute inset-[29%] border border-system/55 [clip-path:polygon(50%_0,100%_50%,50%_100%,0_50%)]" />
      <div className="animate-core-pulse absolute inset-[38%] grid place-items-center rounded-full border border-primary bg-primary/15 shadow-[0_0_55px_var(--system-glow-strong)]">
        <span className="font-display text-6xl font-black text-primary text-glow">E</span>
      </div>
      {[0,1,2,3].map((i) => <span key={i} className="absolute left-1/2 top-1/2 h-[48%] w-px origin-top bg-gradient-to-b from-primary/80 to-transparent" style={{ transform: `rotate(${i * 90 + 45}deg)` }} />)}
    </div>
  );
}