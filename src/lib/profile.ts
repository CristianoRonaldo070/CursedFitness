import { isSupabaseConfigured, supabase, getCurrentUser } from "./supabase";

export type FitnessProfile = {
  name: string;
  age: number;
  height: number;
  weight: number;
  goal: "cut" | "build" | "recomp";
  activity: "low" | "moderate" | "high";
  diet: "balanced" | "vegetarian" | "vegan";
  xp?: number;
  completedQuests?: string[];
  isMissionActive?: boolean;
};

export const defaultProfile: FitnessProfile = {
  name: "Hunter",
  age: 24,
  height: 175,
  weight: 72,
  goal: "recomp",
  activity: "moderate",
  diet: "balanced",
  xp: 340,
  completedQuests: [],
  isMissionActive: false,
};

export function getProfile(): FitnessProfile {
  if (typeof window === "undefined") return defaultProfile;
  const raw = window.localStorage.getItem("cursed-profile") || window.sessionStorage.getItem("cursed-profile");
  const savedName = window.sessionStorage.getItem("cursed-name");
  if (!raw) {
    return savedName ? { ...defaultProfile, name: savedName } : defaultProfile;
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      ...defaultProfile,
      ...parsed,
      name: parsed.name || savedName || defaultProfile.name,
    };
  } catch {
    return defaultProfile;
  }
}

export function saveLocalProfile(profile: FitnessProfile) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(profile);
  window.localStorage.setItem("cursed-profile", serialized);
  window.sessionStorage.setItem("cursed-profile", serialized);
  if (profile.name) {
    window.sessionStorage.setItem("cursed-name", profile.name);
  }
}

export async function saveProfile(profile: FitnessProfile): Promise<{ success: boolean; error?: string }> {
  saveLocalProfile(profile);

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true };
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name: profile.name,
      age: profile.age,
      height: profile.height,
      weight: profile.weight,
      goal: profile.goal,
      activity: profile.activity,
      diet: profile.diet,
      xp: profile.xp ?? 340,
      completed_quests: profile.completedQuests ?? [],
      is_mission_active: profile.isMissionActive ?? false,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (error) {
      console.warn("Could not sync profile to Supabase:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("Supabase sync failed:", msg);
    return { success: false, error: msg };
  }
}

export async function fetchProfile(): Promise<FitnessProfile> {
  const local = getProfile();
  if (!isSupabaseConfigured()) return local;

  try {
    const user = await getCurrentUser();
    if (!user) return local;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !data) {
      return local;
    }

    const remoteProfile: FitnessProfile = {
      name: data.name || user.user_metadata?.full_name || local.name,
      age: data.age ?? local.age,
      height: data.height ?? local.height,
      weight: data.weight ?? local.weight,
      goal: data.goal ?? local.goal,
      activity: data.activity ?? local.activity,
      diet: data.diet ?? local.diet,
      xp: typeof data.xp === "number" ? data.xp : (local.xp ?? 340),
      completedQuests: Array.isArray(data.completed_quests) ? data.completed_quests : (local.completedQuests ?? []),
      isMissionActive: typeof data.is_mission_active === "boolean" ? data.is_mission_active : (local.isMissionActive ?? false),
    };

    saveLocalProfile(remoteProfile);
    return remoteProfile;
  } catch {
    return local;
  }
}

export function getBmi(profile: FitnessProfile) {
  return profile.weight / Math.pow(profile.height / 100, 2);
}

export function getBmiLabel(bmi: number) {
  if (bmi < 18.5) return "Below range";
  if (bmi < 25) return "Optimal range";
  if (bmi < 30) return "Above range";
  return "High range";
}