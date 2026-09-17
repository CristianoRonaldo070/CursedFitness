import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, Check, Cloud, Loader2, Ruler, Scale, Target, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultProfile, fetchProfile, saveProfile, type FitnessProfile } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AuthGuard } from "@/components/auth-guard";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Body Assessment — CursedFitness" },
      { name: "description", content: "Set your starting stats, goal, activity, and diet preferences." },
      { property: "og:title", content: "Body Assessment — CursedFitness" },
      { property: "og:description", content: "Create your personalized training and nutrition protocol." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthGuard moduleName="Body Assessment">
      <AssessmentPage />
    </AuthGuard>
  ),
});

function AssessmentPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FitnessProfile>(defaultProfile);
  const [loading, setLoading] = useState(false);
  const isCloud = isSupabaseConfigured();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const p = await fetchProfile();
      if (isMounted) {
        setProfile(p);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveProfile(profile);
      toast.success("Awakening protocol generated and saved!");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Failed to save protocol");
    } finally {
      setLoading(false);
    }
  }

  const bmi = profile.height > 0 ? profile.weight / Math.pow(profile.height / 100, 2) : 22;

  return (
    <main className="min-h-screen pt-18">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-end">
          <div>
            <p className="system-label">Candidate calibration // step 02</p>
            <h1 className="mt-3 text-5xl font-black uppercase md:text-7xl">Body assessment</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Set your current attributes so the system can generate your starting protocol.
            </p>
          </div>
          <div className="font-mono text-xs text-muted-foreground">
            <span className="text-primary">02</span> / 03
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
          <form onSubmit={submit} className="system-panel p-6 md:p-9">
            <div className="grid gap-6 sm:grid-cols-2">
              <NumberField
                icon={<UserRound />}
                label="Age"
                value={profile.age}
                min={16}
                max={80}
                unit="years"
                onChange={(v) => setProfile({ ...profile, age: v })}
              />
              <NumberField
                icon={<Ruler />}
                label="Height"
                value={profile.height}
                min={120}
                max={230}
                unit="cm"
                onChange={(v) => setProfile({ ...profile, height: v })}
              />
              <NumberField
                icon={<Scale />}
                label="Weight"
                value={profile.weight}
                min={35}
                max={250}
                unit="kg"
                onChange={(v) => setProfile({ ...profile, weight: v })}
              />
              <label>
                <span className="system-label flex items-center gap-2 text-[9px]">
                  <Target className="size-4" /> Primary goal
                </span>
                <select
                  value={profile.goal}
                  onChange={(e) =>
                    setProfile({ ...profile, goal: e.target.value as FitnessProfile["goal"] })
                  }
                  className="mt-2 h-12 w-full rounded-sm border border-input bg-card px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="cut">Lose fat</option>
                  <option value="build">Build muscle</option>
                  <option value="recomp">Body recomposition</option>
                </select>
              </label>
            </div>

            <ChoiceGroup
              label="Activity level"
              icon={<Activity />}
              value={profile.activity}
              choices={[
                ["low", "Light", "1–2 days / week"],
                ["moderate", "Active", "3–4 days / week"],
                ["high", "Athlete", "5–6 days / week"],
              ]}
              onChange={(v) => setProfile({ ...profile, activity: v as FitnessProfile["activity"] })}
            />

            <ChoiceGroup
              label="Nutrition preference"
              value={profile.diet}
              choices={[
                ["balanced", "Balanced", "All food groups"],
                ["vegetarian", "Vegetarian", "No meat or fish"],
                ["vegan", "Plant based", "No animal products"],
              ]}
              onChange={(v) => setProfile({ ...profile, diet: v as FitnessProfile["diet"] })}
            />

            <Button
              type="submit"
              variant="system"
              size="system"
              disabled={loading}
              className="mt-9 w-full sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Calibrating...
                </>
              ) : (
                <>
                  Generate my protocol <ArrowRight />
                </>
              )}
            </Button>
          </form>

          <aside className="space-y-5">
            <div className="system-panel p-7">
              <p className="system-label">Live body scan</p>
              <div className="my-8 grid place-items-center">
                <div className="grid size-40 place-items-center rounded-full border border-primary/40 shadow-[inset_0_0_35px_var(--system-glow),0_0_35px_var(--system-glow-soft)]">
                  <div className="text-center">
                    <p className="font-display text-5xl font-black text-primary text-glow">
                      {bmi.toFixed(1)}
                    </p>
                    <p className="system-label mt-1 text-[9px]">Estimated BMI</p>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs leading-5 text-muted-foreground">
                This is a general wellness estimate, not a medical diagnosis.
              </p>
            </div>

            <div className="border border-border bg-card p-5">
              <div className="flex gap-3">
                {isCloud ? (
                  <Cloud className="size-5 text-primary" />
                ) : (
                  <Check className="size-5 text-success" />
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {isCloud ? "Cloud Synchronized" : "Local Hunter Profile"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {isCloud
                      ? "Your attributes sync with your connected Supabase database."
                      : "Your assessment is saved locally in browser storage."}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function NumberField({
  icon,
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label>
      <span className="system-label flex items-center gap-2 text-[9px]">
        {icon}
        {label}
      </span>
      <span className="relative mt-2 block">
        <Input
          type="number"
          required
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-12 rounded-sm border-border bg-card pr-16"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-muted-foreground">
          {unit}
        </span>
      </span>
    </label>
  );
}

function ChoiceGroup({
  label,
  icon,
  value,
  choices,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  choices: Array<[string, string, string]>;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="mt-8">
      <legend className="system-label flex items-center gap-2 text-[9px]">
        {icon}
        {label}
      </legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {choices.map(([key, title, sub]) => (
          <label
            key={key}
            className={`cursor-pointer border p-4 transition-colors ${
              value === key
                ? "border-primary bg-primary/10 shadow-[inset_0_0_20px_var(--system-glow-soft)]"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              checked={value === key}
              onChange={() => onChange(key)}
            />
            <span className="block text-sm font-semibold">{title}</span>
            <span className="mt-1 block text-[11px] text-muted-foreground">{sub}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}