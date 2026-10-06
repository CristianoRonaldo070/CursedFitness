import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, ArrowRight, Calendar, Check, Cloud, HeartPulse, Loader2, Ruler, Scale, Stethoscope, Target, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultProfile, fetchProfile, saveProfile, type FitnessProfile } from "@/lib/profile";
import { isSupabaseConfigured } from "@/lib/supabase";
import { AuthGuard } from "@/components/auth-guard";
import { useIsCapacitor } from "@/hooks/use-capacitor";

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
  const isNative = useIsCapacitor();

  return (
    <main className={`min-h-screen ${isNative ? "pt-4 pb-24" : "pt-18"}`}>
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
              label="Gender"
              icon={<UserRound />}
              value={profile.gender ?? "male"}
              choices={[
                ["male", "Male", "Standard protocol"],
                ["female", "Female", "Includes cycle-aware training"],
              ]}
              onChange={(v) => {
                const gender = v as FitnessProfile["gender"];
                setProfile({
                  ...profile,
                  gender,
                  // Clear period data when switching to male
                  ...(gender === "male" ? {
                    periodCycleStartDate: undefined,
                    periodCycleDuration: undefined,
                    periodCycleLength: undefined,
                  } : {}),
                });
              }}
            />

            {/* Period Cycle Configuration — only for females */}
            {profile.gender === "female" && (
              <div className="mt-6 border border-pink-500/40 bg-pink-500/5 p-5 rounded-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 text-pink-400" />
                  <span className="system-label text-[9px] text-pink-400">Menstrual Cycle Calibration</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Set your cycle details so the system can adapt exercises and nutrition during your period days — replacing heavy lifts with restorative yoga and providing iron-rich, anti-inflammatory meals.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <label>
                    <span className="system-label flex items-center gap-2 text-[9px]">
                      <Calendar className="size-3.5" /> Last period start date
                    </span>
                    <input
                      type="date"
                      value={profile.periodCycleStartDate ?? ""}
                      onChange={(e) =>
                        setProfile({ ...profile, periodCycleStartDate: e.target.value })
                      }
                      className="mt-2 h-12 w-full rounded-sm border border-input bg-card px-3 text-sm outline-none focus:border-pink-400"
                    />
                  </label>
                  <label>
                    <span className="system-label flex items-center gap-2 text-[9px]">
                      Period duration
                    </span>
                    <select
                      value={profile.periodCycleDuration ?? 5}
                      onChange={(e) =>
                        setProfile({ ...profile, periodCycleDuration: Number(e.target.value) })
                      }
                      className="mt-2 h-12 w-full rounded-sm border border-input bg-card px-3 text-sm outline-none focus:border-pink-400"
                    >
                      {[3, 4, 5, 6, 7].map((d) => (
                        <option key={d} value={d}>
                          {d} days
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="system-label flex items-center gap-2 text-[9px]">
                      Full cycle length
                    </span>
                    <select
                      value={profile.periodCycleLength ?? 28}
                      onChange={(e) =>
                        setProfile({ ...profile, periodCycleLength: Number(e.target.value) })
                      }
                      className="mt-2 h-12 w-full rounded-sm border border-input bg-card px-3 text-sm outline-none focus:border-pink-400"
                    >
                      {Array.from({ length: 15 }, (_, i) => 21 + i).map((d) => (
                        <option key={d} value={d}>
                          {d} days {d === 28 ? "(avg)" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

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

            {/* Chronic Illness Question */}
            <div className="mt-8 border-t border-border/70 pt-6">
              <div className="flex items-center gap-2">
                <HeartPulse className="size-4 text-primary" />
                <span className="system-label text-[9px]">Medical Protocol Calibration</span>
              </div>
              <h3 className="mt-2 text-base font-bold uppercase tracking-wide">
                Do you have a chronic illness?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                If you have a diagnosed medical condition, the system will dynamically calibrate your workout volume, rest periods, and nutrition matrix.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label
                  className={`cursor-pointer border p-4 transition-colors ${
                    !profile.hasChronicIllness
                      ? "border-primary bg-primary/10 shadow-[inset_0_0_20px_var(--system-glow-soft)]"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="hasChronicIllness"
                    className="sr-only"
                    checked={!profile.hasChronicIllness}
                    onChange={() =>
                      setProfile({
                        ...profile,
                        hasChronicIllness: false,
                        chronicIllness: "none",
                      })
                    }
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">No</span>
                    {!profile.hasChronicIllness && <Check className="size-4 text-primary" />}
                  </div>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    No diagnosed chronic conditions · Standard protocol
                  </span>
                </label>

                <label
                  className={`cursor-pointer border p-4 transition-colors ${
                    profile.hasChronicIllness
                      ? "border-primary bg-primary/10 shadow-[inset_0_0_20px_var(--system-glow-soft)]"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="hasChronicIllness"
                    className="sr-only"
                    checked={Boolean(profile.hasChronicIllness)}
                    onChange={() =>
                      setProfile({
                        ...profile,
                        hasChronicIllness: true,
                        chronicIllness:
                          profile.chronicIllness && profile.chronicIllness !== "none"
                            ? profile.chronicIllness
                            : "diabetes_type_1",
                      })
                    }
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">Yes</span>
                    {profile.hasChronicIllness && <Check className="size-4 text-primary" />}
                  </div>
                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    Diagnosed condition · Requires specialized medical calibration
                  </span>
                </label>
              </div>

              {/* If Yes, show single-selection condition options */}
              {profile.hasChronicIllness && (
                <div className="mt-5 border border-primary/40 bg-card/60 p-5 rounded-sm">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="size-4 text-primary" />
                    <p className="system-label text-[9px] text-primary">
                      Select Your Condition (Single Selection)
                    </p>
                  </div>
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {[
                      {
                        id: "diabetes_type_1",
                        title: "Diabetes Type 1",
                        tag: "Insulin-Dependent",
                        desc: "GLUT-4 muscle glucose uptake, standardized rest intervals & hypoglycemia prevention",
                      },
                      {
                        id: "diabetes_type_2",
                        title: "Diabetes Type 2",
                        tag: "Insulin-Resistance",
                        desc: "Large-muscle glycogen clearance, post-session walks & glycemic-blunting nutrition",
                      },
                      {
                        id: "thyroid",
                        title: "Thyroid Disorder",
                        tag: "Hypo/Metabolic Support",
                        desc: "Controlled eccentric tempo, cortisol shield & selenium/zinc micronutrient support",
                      },
                      {
                        id: "amenorrhea",
                        title: "Amenorrhea",
                        tag: "Hormonal Recovery",
                        desc: "Low-volume mechanical bone loading, zero exhaustive cardio & lipid-dense hormonal fuel",
                      },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`cursor-pointer border p-3.5 transition-colors ${
                          profile.chronicIllness === item.id
                            ? "border-primary bg-primary/15 shadow-[inset_0_0_15px_var(--system-glow-soft)]"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="chronicIllness"
                          className="sr-only"
                          checked={profile.chronicIllness === item.id}
                          onChange={() =>
                            setProfile({
                              ...profile,
                              hasChronicIllness: true,
                              chronicIllness: item.id as FitnessProfile["chronicIllness"],
                            })
                          }
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wide">
                            {item.title}
                          </span>
                          {profile.chronicIllness === item.id && (
                            <Check className="size-3.5 text-primary" />
                          )}
                        </div>
                        <span className="mt-0.5 inline-block font-mono text-[9px] text-primary">
                          [{item.tag}]
                        </span>
                        <span className="mt-1 block text-[10px] leading-4 text-muted-foreground">
                          {item.desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="green"
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
              {profile.hasChronicIllness && profile.chronicIllness && profile.chronicIllness !== "none" && (
                <div className="mt-4 border-t border-border pt-3 text-center">
                  <span className="inline-flex items-center gap-1.5 border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase text-primary">
                    <HeartPulse className="size-3" />
                    Clinical Calibration Active
                  </span>
                </div>
              )}
              {profile.gender === "female" && profile.periodCycleStartDate && (
                <div className="mt-3 border-t border-border pt-3 text-center">
                  <span className="inline-flex items-center gap-1.5 border border-pink-500/40 bg-pink-500/10 px-2.5 py-1 font-mono text-[10px] uppercase text-pink-400">
                    <Calendar className="size-3" />
                    Cycle Tracking Configured ({profile.periodCycleDuration ?? 5}d / {profile.periodCycleLength ?? 28}d)
                  </span>
                </div>
              )}
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