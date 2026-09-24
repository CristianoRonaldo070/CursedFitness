import { Link, useMatches } from "@tanstack/react-router";
import {
  Dumbbell,
  Home,
  Salad,
  Smartphone,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { useIsCapacitor } from "@/hooks/use-capacitor";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/dashboard", label: "System", icon: Dumbbell },
  { to: "/diet", label: "Diet", icon: Salad },
  { to: "/assessment", label: "Profile", icon: User },
] as const;

/**
 * Wraps the app content with a native-style mobile bottom tab bar
 * when running inside the Capacitor Android shell.
 *
 * On web (browser), it simply renders children without modification.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  const isNative = useIsCapacitor();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/";
  const isAuthRoute = currentPath === "/login";

  if (!isNative) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-shell flex min-h-screen flex-col">
      {/* Main scrollable content area — extra bottom padding for the tab bar on regular screens */}
      <div className={`flex-1 overflow-y-auto ${isAuthRoute ? "" : "pb-20"}`}>{children}</div>

      {/* Bottom tab navigation — only on main app screens */}
      {!isAuthRoute && <BottomTabBar />}
    </div>
  );
}

function BottomTabBar() {
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.fullPath ?? "/";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-[9999] border-t border-border/70 bg-background/95 backdrop-blur-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Mobile navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.to === "/"
              ? currentPath === "/"
              : currentPath.startsWith(tab.to);
          const Icon = tab.icon;

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`group relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute -top-px left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-b-full bg-primary shadow-[0_0_12px_var(--system-glow)]" />
              )}

              <Icon
                className={`size-5 transition-transform ${
                  isActive ? "scale-110" : "group-active:scale-95"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.12em] ${
                  isActive ? "font-bold text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Standalone component for non-Capacitor use to showcase the mobile app
 * (e.g. in a marketing section on the website).
 */
export function MobileAppPreview() {
  return (
    <div className="relative mx-auto w-[260px]">
      {/* Phone frame */}
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-border bg-background shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        {/* Status bar */}
        <div className="flex h-8 items-center justify-between bg-card px-5">
          <span className="font-mono text-[8px] text-muted-foreground">
            9:41
          </span>
          <div className="flex gap-1">
            <span className="h-1.5 w-3 rounded-full bg-muted-foreground/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
          </div>
        </div>

        {/* Mock app screen */}
        <div className="space-y-3 p-4">
          {/* Mini header */}
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center border border-primary/70 bg-primary/10 text-[10px] font-black text-primary [clip-path:polygon(50%_0,100%_22%,86%_86%,50%_100%,14%_86%,0_22%)]">
              C
            </span>
            <span className="font-display text-xs font-black uppercase text-foreground">
              Cursed<span className="text-primary">Fitness</span>
            </span>
          </div>

          {/* Welcome */}
          <div>
            <p className="font-mono text-[7px] uppercase tracking-wider text-primary/80">
              System synchronized
            </p>
            <p className="mt-0.5 font-display text-lg font-black uppercase leading-tight text-foreground">
              Welcome, <span className="text-primary">Hunter</span>
            </p>
          </div>

          {/* Stats mini row */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="border border-border bg-card p-2">
              <p className="font-mono text-[6px] uppercase text-muted-foreground">
                BMI
              </p>
              <p className="font-display text-lg font-black text-foreground">
                22.4
              </p>
            </div>
            <div className="border border-border bg-card p-2">
              <p className="font-mono text-[6px] uppercase text-muted-foreground">
                XP
              </p>
              <p className="font-display text-lg font-black text-primary">
                1,240
              </p>
            </div>
          </div>

          {/* Mini quest card */}
          <div className="border border-primary/40 bg-primary/5 p-2.5">
            <p className="font-mono text-[6px] uppercase tracking-wider text-primary">
              Main Quest
            </p>
            <p className="mt-0.5 font-display text-xs font-bold uppercase text-foreground">
              Forge the Foundation
            </p>
            <div className="mt-1.5 h-1 bg-muted">
              <div className="h-full w-3/4 bg-primary shadow-[0_0_8px_var(--system-glow)]" />
            </div>
          </div>

          {/* Mini rank row */}
          <div className="flex items-center justify-between gap-0.5">
            {["E", "D", "C", "B", "A", "S"].map((r, i) => (
              <div
                key={r}
                className={`grid size-6 place-items-center border font-display text-[10px] font-bold ${
                  i === 2
                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_10px_var(--system-glow)]"
                    : "border-border text-muted-foreground"
                }`}
              >
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Mock bottom nav */}
        <div className="flex items-center justify-around border-t border-border bg-card/80 py-2">
          <div className="flex flex-col items-center gap-0.5">
            <Home className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-[6px] text-muted-foreground">
              HOME
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Dumbbell className="size-3.5 text-primary" />
            <span className="font-mono text-[6px] font-bold text-primary">
              SYSTEM
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Salad className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-[6px] text-muted-foreground">
              DIET
            </span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <User className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-[6px] text-muted-foreground">
              PROFILE
            </span>
          </div>
        </div>
      </div>

      {/* Glow behind phone */}
      <div className="absolute -inset-4 -z-10 rounded-[3rem] bg-primary/8 blur-2xl" />
    </div>
  );
}
