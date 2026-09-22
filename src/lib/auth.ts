import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "./supabase";

export interface AuthUser {
  id: string;
  name: string;
  email?: string | undefined;
  avatarUrl?: string | undefined;
  loggedInAt: number;
}

const STORAGE_KEY = "cursed_auth_user";
const NAME_KEY = "cursed-name";
const REMEMBERED_CREDENTIALS_KEY = "cursed_remembered_credentials";

/**
 * Pure getter: never writes to storage or dispatches events.
 */
export function getStoredAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  return null;
}

/**
 * Persists auth user and notifies other components.
 */
export function saveAuthUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.localStorage.setItem(NAME_KEY, user.name);
    window.sessionStorage.setItem(NAME_KEY, user.name);
    // Dispatch custom event to notify all components in real-time
    window.dispatchEvent(new Event("cursed-auth-change"));
  } catch (err) {
    console.warn("Failed to persist auth user:", err);
  }
}

export function saveRememberedCredentials(credentials: { email?: string; name?: string }): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REMEMBERED_CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch {
    // ignore
  }
}

export function getRememberedCredentials(): { email?: string; name?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REMEMBERED_CREDENTIALS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function clearAuthUser(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  } catch (err) {
    console.warn("Supabase sign out error:", err);
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(NAME_KEY);
    window.sessionStorage.removeItem(NAME_KEY);
    window.sessionStorage.removeItem("cursed-profile");
    window.dispatchEvent(new Event("cursed-auth-change"));
  } catch (err) {
    console.warn("Failed to clear local auth:", err);
  }
}

export function isUserAuthenticated(): boolean {
  return getStoredAuthUser() !== null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredAuthUser());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    function refresh() {
      if (!isMounted) return;
      const u = getStoredAuthUser();
      setUser(u);
    }

    // Listen for storage / custom auth changes
    window.addEventListener("cursed-auth-change", refresh);
    window.addEventListener("storage", refresh);

    // If Supabase is configured, also sync with session
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!isMounted) return;
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            name:
              (session.user.user_metadata?.["full_name"] as string | undefined) ||
              session.user.email?.split("@")[0] ||
              "Hunter",
            email: session.user.email,
            loggedInAt: Date.now(),
          };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          window.localStorage.setItem(NAME_KEY, authUser.name);
          setUser(authUser);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            name:
              (session.user.user_metadata?.["full_name"] as string | undefined) ||
              session.user.email?.split("@")[0] ||
              "Hunter",
            email: session.user.email,
            loggedInAt: Date.now(),
          };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
          window.localStorage.setItem(NAME_KEY, authUser.name);
          setUser(authUser);
        } else if (event === "SIGNED_OUT") {
          window.localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        }
      });

      return () => {
        isMounted = false;
        window.removeEventListener("cursed-auth-change", refresh);
        window.removeEventListener("storage", refresh);
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
      window.removeEventListener("cursed-auth-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    signOut: clearAuthUser,
  };
}
