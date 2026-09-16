import { createClient, type User, type Session } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes("your-project-id") &&
      !supabaseAnonKey.includes("your-anon-key")
  );
};

// Resilient Supabase client that will not throw on initialization even if credentials are not yet set
export const supabase = createClient(
  isSupabaseConfigured() ? supabaseUrl : "https://placeholder.supabase.co",
  isSupabaseConfigured() ? supabaseAnonKey : "placeholder-key",
  {
    auth: {
      persistSession: typeof window !== "undefined",
      autoRefreshToken: typeof window !== "undefined",
    },
  }
);

export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) return null;
    return session;
  } catch {
    return null;
  }
}
