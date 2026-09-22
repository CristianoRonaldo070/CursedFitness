import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Shield, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { BrandMark, SystemCore } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { fetchProfile, saveLocalProfile, getProfile } from "@/lib/profile";
import {
  saveAuthUser,
  saveRememberedCredentials,
  getRememberedCredentials,
  useAuth,
} from "@/lib/auth";
import { useIsCapacitor } from "@/hooks/use-capacitor";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Enter the System — CursedFitness" },
      { name: "description", content: "Enter the CursedFitness system and begin your body assessment." },
      { property: "og:title", content: "Enter the System — CursedFitness" },
      { property: "og:description", content: "Begin your CursedFitness awakening assessment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, signOut } = useAuth();
  const isNative = useIsCapacitor();
  const [isSignUp, setIsSignUp] = useState(false);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    // Populate remembered credentials without auto-redirecting
    const remembered = getRememberedCredentials();
    if (remembered) {
      if (remembered.email) setEmail(remembered.email);
      if (remembered.name) setName(remembered.name);
    } else {
      const p = getProfile();
      if (p.name && p.name !== "Hunter") {
        setName(p.name);
      }
    }
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const cleanName = name.trim() || (email.split("@")[0]) || "Hunter";
    const cleanEmail = email.trim();

    // Remember credentials locally
    saveRememberedCredentials({ email: cleanEmail, name: cleanName });

    if (!supabaseReady) {
      const current = getProfile();
      saveLocalProfile({ ...current, name: cleanName });
      saveAuthUser({
        id: "hunter-" + Date.now(),
        name: cleanName,
        email: cleanEmail || undefined,
        loggedInAt: Date.now(),
      });
      toast.success(isSignUp ? "Hunter registered in local system" : "System access granted");
      navigate({ to: isSignUp ? "/assessment" : "/dashboard" });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: cleanName },
          },
        });

        if (error) {
          toast.error(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          saveAuthUser({
            id: data.user.id,
            name: cleanName,
            email: cleanEmail,
            loggedInAt: Date.now(),
          });
          toast.success("Awakening complete! Initializing assessment...");
          navigate({ to: "/assessment" });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          // If email confirmation is pending on Supabase, grant local access gracefully
          if (error.message.toLowerCase().includes("email not confirmed")) {
            saveAuthUser({
              id: "hunter-" + Date.now(),
              name: cleanName,
              email: cleanEmail,
              loggedInAt: Date.now(),
            });
            toast.success("Neural link established. Welcome back, Hunter.");
            await fetchProfile();
            navigate({ to: "/dashboard" });
            return;
          }
          toast.error(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          const resolvedName =
            data.user.user_metadata?.full_name || cleanName || "Hunter";
          saveAuthUser({
            id: data.user.id,
            name: resolvedName,
            email: cleanEmail,
            loggedInAt: Date.now(),
          });
          toast.success("Neural link established. Welcome back, Hunter.");
          await fetchProfile();
          navigate({ to: "/dashboard" });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`grid min-h-screen ${isNative ? "" : "lg:grid-cols-[1.05fr_.95fr]"}`}>
      <section className="relative hidden overflow-hidden border-r border-border bg-card lg:flex lg:flex-col lg:justify-between lg:p-10">
        <BrandMark />
        <div className="absolute inset-16">
          <SystemCore />
        </div>
        <div className="relative z-10">
          <p className="system-label">Neural link ready</p>
          <h1 className="mt-3 text-6xl font-black uppercase leading-none">
            Awaken your
            <br />
            <span className="text-primary text-glow">potential.</span>
          </h1>
        </div>
      </section>

      <section className="flex min-h-screen items-center px-5 py-16 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-14 flex items-center justify-between lg:hidden">
            <BrandMark />
            <Button asChild variant="ghost" size="icon">
              <Link to="/" aria-label="Back home">
                <ArrowLeft />
              </Link>
            </Button>
          </div>
          <div className="hidden lg:block">
            <Link
              to="/"
              className="mb-16 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="size-3" /> Return home
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <p className="system-label">Access gate // {isSignUp ? "Awaken" : "01"}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`font-mono text-xs uppercase tracking-wider transition-colors ${!isSignUp ? "text-primary border-b border-primary pb-0.5" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign In
              </button>
              <span className="text-muted-foreground">/</span>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`font-mono text-xs uppercase tracking-wider transition-colors ${isSignUp ? "text-primary border-b border-primary pb-0.5" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign Up
              </button>
            </div>
          </div>

          <h2 className="mt-4 text-5xl font-black uppercase">
            {isSignUp ? "Awaken Hunter" : "Enter the system"}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {supabaseReady
              ? isSignUp
                ? "Create your Hunter identity linked to the cloud database."
                : "Enter your credentials to sync your stats and progress."
              : "Demo access active. Add your Supabase keys to .env to connect."}
          </p>

          {isAuthenticated && (
            <div className="mt-6 flex items-center justify-between border border-primary/40 bg-primary/10 p-3.5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-primary">Active Session</p>
                <p className="font-display text-sm font-bold uppercase text-foreground">{user?.name || "Hunter"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="green"
                  size="sm"
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="font-mono text-xs"
                >
                  Dashboard →
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    toast.info("Session disconnected. You can now sign in.");
                  }}
                  className="font-mono text-xs text-muted-foreground hover:text-destructive"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={submit}>
            {isSignUp && (
              <label className="block">
                <span className="system-label text-[9px]">Hunter name / Call-sign</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your hunter name (e.g. Jin-Woo)"
                  className="mt-2 h-12 rounded-sm border-border bg-card px-4"
                />
              </label>
            )}

            {supabaseReady ? (
              <label className="block">
                <span className="system-label text-[9px]">Hunter Email</span>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="hunter@system.domain"
                  className="mt-2 h-12 rounded-sm border-border bg-card px-4"
                />
              </label>
            ) : !isSignUp ? (
              <label className="block">
                <span className="system-label text-[9px]">Hunter name</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                  className="mt-2 h-12 rounded-sm border-border bg-card px-4"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="system-label text-[9px]">Access key</span>
              <span className="relative mt-2 block">
                <Input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={4}
                  placeholder={supabaseReady ? "Enter password (6+ chars)" : "Any 4+ characters for demo"}
                  className="h-12 rounded-sm border-border bg-card px-4 pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-1.5 top-1.5"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff /> : <Eye />}
                </Button>
              </span>
            </label>

            <Button
              type="submit"
              variant={isSignUp ? "green" : "orange"}
              size="system"
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Connecting...
                </>
              ) : isSignUp ? (
                <>
                  Awaken Hunter <Sparkles className="ml-2 size-4" />
                </>
              ) : (
                <>
                  Initialize access <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 flex items-start gap-3 border-t border-border pt-6 text-xs leading-5 text-muted-foreground">
            <Shield className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>
              {supabaseReady
                ? "Secured by Supabase Auth with PostgreSQL backend."
                : "Supabase connection enabled. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to link your live database."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}