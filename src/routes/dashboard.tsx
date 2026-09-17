import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  Footprints,
  Info,
  RotateCcw,
  Salad,
  Sparkles,
  Target,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  defaultProfile,
  fetchProfile,
  getBmi,
  saveProfile,
  type FitnessProfile,
} from "@/lib/profile";
import { getHunterRecommendations } from "@/lib/recommendations";
import { AuthGuard } from "@/components/auth-guard";
import { WarmupGate } from "@/components/warmup-gate";
import trainingImage from "@/assets/cursed-training.jpg";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Hunter System — CursedFitness" },
      {
        name: "description",
        content: "Your personalized workout, nutrition, quests, BMI, XP, and rank dashboard.",
      },
      { property: "og:title", content: "Hunter System — CursedFitness" },
      {
        property: "og:description",
        content: "A personalized gamified fitness protocol built around your stats.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthGuard moduleName="Hunter System">
      <DashboardPage />
    </AuthGuard>
  ),
});

const rankList = ["E", "D", "C", "B", "A", "S"];

const QUEST_DEFS = [
  { id: "steps", title: "8,000 steps", xp: 40, icon: <Footprints /> },
  { id: "protein", title: "Hit protein goal", xp: 60, icon: <Salad /> },
  { id: "workout", title: "Main workout", xp: 240, icon: <Dumbbell /> },
];

function getRank(xp: number): { rank: string; nextRank: string; currentTierXp: number; targetXp: number } {
  if (xp >= 7500) return { rank: "S", nextRank: "MAX", currentTierXp: xp, targetXp: 10000 };
  if (xp >= 5000) return { rank: "A", nextRank: "S-Rank", currentTierXp: xp - 5000, targetXp: 2500 };
  if (xp >= 3500) return { rank: "B", nextRank: "A-Rank", currentTierXp: xp - 3500, targetXp: 1500 };
  if (xp >= 2000) return { rank: "C", nextRank: "B-Rank", currentTierXp: xp - 2000, targetXp: 1500 };
  if (xp >= 1000) return { rank: "D", nextRank: "C-Rank", currentTierXp: xp - 1000, targetXp: 1000 };
  return { rank: "E", nextRank: "D-Rank", currentTierXp: xp, targetXp: 1000 };
}

function DashboardPage() {
  const [p, setP] = useState<FitnessProfile>(defaultProfile);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const loaded = await fetchProfile();
      if (isMounted) {
        setP(loaded);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const bmi = getBmi(p);
  const rec = getHunterRecommendations(p);

  const currentXp = p.xp ?? 340;
  const completed = p.completedQuests ?? [];
  const rankInfo = getRank(currentXp);
  const xpPercent = Math.min(100, Math.round((rankInfo.currentTierXp / rankInfo.targetXp) * 100));

  async function handleToggleQuest(questId: string, questXp: number, questTitle: string) {
    const isCompleted = completed.includes(questId);
    let newCompleted: string[];
    let newXp: number;

    if (isCompleted) {
      newCompleted = completed.filter((id) => id !== questId);
      newXp = Math.max(0, currentXp - questXp);
      toast.info(`Quest "${questTitle}" reset (-${questXp} XP)`);
    } else {
      newCompleted = [...completed, questId];
      newXp = currentXp + questXp;
      toast.success(`Quest Cleared: "${questTitle}"! +${questXp} XP gained.`);
    }

    const updated = {
      ...p,
      xp: newXp,
      completedQuests: newCompleted,
      ...(questId === "workout" && !isCompleted ? { isMissionActive: false } : {}),
    };

    setP(updated);
    await saveProfile(updated);
  }

  async function handleMissionAction() {
    if (!p.isMissionActive) {
      const updated = { ...p, isMissionActive: true };
      setP(updated);
      await saveProfile(updated);
      toast.success("Main Mission Initialized: 'Forge the foundation'. Push through your limits!");
    } else {
      const alreadyHasWorkout = completed.includes("workout");
      const addedXp = alreadyHasWorkout ? 0 : 240;
      const newCompleted = alreadyHasWorkout ? completed : [...completed, "workout"];
      const updated = {
        ...p,
        isMissionActive: false,
        xp: currentXp + addedXp,
        completedQuests: newCompleted,
      };
      setP(updated);
      await saveProfile(updated);
      toast.success(
        alreadyHasWorkout
          ? "Mission marked complete!"
          : "Mission Conquered! +240 XP awarded to your Hunter profile!"
      );
    }
  }

  async function handleWarmupComplete() {
    const newXp = (p.xp ?? 340) + 50;
    const updated = { ...p, xp: newXp };
    setP(updated);
    await saveProfile(updated);
  }

  const remainingCount = QUEST_DEFS.length - completed.length;

  return (
    <main className="min-h-screen pt-18">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="system-label">
                System synchronized // {rankInfo.rank}-Rank Hunter
              </p>
              <span className="border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                {rec.protocolTag}
              </span>
            </div>
            <h1 className="mt-3 text-5xl font-black uppercase md:text-7xl">
              Welcome, <span className="text-primary">{p.name}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Age {p.age} · {p.weight} kg · {p.height} cm — {rec.protocolTitle}
            </p>
          </div>
          <Button asChild variant="orangeOutline" size="system">
            <Link to="/assessment">Recalibrate stats</Link>
          </Button>
        </div>

        {/* Adaptive Underweight / Mass Gain Intelligence Alert */}
        {rec.isUnderweight && (
          <div className="mt-6 border border-primary/40 bg-primary/10 p-5 backdrop-blur-md shadow-[0_0_25px_var(--system-glow-soft)]">
            <div className="flex items-start gap-4">
              <div className="grid size-9 shrink-0 place-items-center rounded-sm bg-primary/20 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-black uppercase tracking-wider text-primary">
                    Mass Calibration Activated // Underweight Protocol
                  </h3>
                  <span className="bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">
                    + {rec.calorieSurplusOrDeficit} kcal / day
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-foreground/90">
                  {rec.protocolSummary} Target weight:{" "}
                  <span className="font-semibold text-primary">
                    {rec.minIdealWeight} kg – {rec.maxIdealWeight} kg
                  </span>{" "}
                  (gain ~{rec.weightDifference} kg).
                </p>
                <div className="mt-2.5 flex items-center gap-2 font-mono text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                  <Info className="size-3.5 text-primary shrink-0" />
                  <span>{rec.ageInsight}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<Activity />}
            label="Body mass index"
            value={bmi.toFixed(1)}
            sub={rec.statusLabel}
          />
          <Metric
            icon={<Flame />}
            label="Daily energy"
            value={String(rec.caloricTarget)}
            sub={
              rec.calorieSurplusOrDeficit > 0
                ? `+${rec.calorieSurplusOrDeficit} kcal surplus`
                : rec.calorieSurplusOrDeficit < 0
                ? `${rec.calorieSurplusOrDeficit} kcal deficit`
                : "Maintenance kcal"
            }
          />
          <Metric
            icon={<Dumbbell />}
            label="Protein Target"
            value={`${rec.proteinGrams}g`}
            sub={`${(rec.proteinGrams / p.weight).toFixed(1)}g per kg bodyweight`}
          />
          <Metric
            icon={<Zap />}
            label="Current XP"
            value={String(currentXp)}
            sub={`${rankInfo.targetXp - rankInfo.currentTierXp} to ${rankInfo.nextRank}`}
          />
        </section>

        {/* Main Quest & Rank Progression */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
          <div className="system-panel overflow-hidden">
            <div className="relative min-h-[330px]">
              <img
                src={trainingImage}
                width={1536}
                height={1024}
                alt="Strength training mission"
                className="absolute inset-0 h-full w-full object-cover object-[62%_center] opacity-75"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
              <div className="relative max-w-lg p-7 md:p-10">
                <div className="flex items-center gap-2">
                  <span className="system-label">Main quest</span>
                  <span
                    className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-wider ${
                      p.isMissionActive
                        ? "border-primary/60 bg-primary/20 text-primary animate-pulse"
                        : completed.includes("workout")
                        ? "border-success/40 bg-success/20 text-success"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {p.isMissionActive ? "In Progress" : completed.includes("workout") ? "Completed" : "Ready"}
                  </span>
                </div>
                <h2 className="mt-7 text-5xl font-black uppercase leading-none">
                  Forge the
                  <br />
                  foundation
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {rec.isUnderweight
                    ? `Heavy compound hypertrophy session calibrated for Age ${p.age} to trigger mechanical tension and muscle synthesis.`
                    : "Complete your daily scheduled split session and hit your protein target."}
                </p>
                <div className="mt-7 flex gap-5 font-mono text-[10px] uppercase tracking-wider">
                  <span className="flex items-center gap-2">
                    <Timer className="size-4 text-primary" />
                    48 min
                  </span>
                  <span className="flex items-center gap-2">
                    <Trophy className="size-4 text-primary" />
                    +240 XP
                  </span>
                </div>
                <Button
                  onClick={handleMissionAction}
                  variant={p.isMissionActive ? "green" : completed.includes("workout") ? "orangeOutline" : "orange"}
                  size="system"
                  className="mt-7"
                >
                  {p.isMissionActive ? (
                    <>
                      Complete mission <CheckCircle2 className="ml-2 size-4" />
                    </>
                  ) : completed.includes("workout") ? (
                    <>
                      Restart mission <RotateCcw className="ml-2 size-4" />
                    </>
                  ) : (
                    <>
                      Begin mission <ArrowUpRight className="ml-2 size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="system-panel p-7">
            <div className="flex items-center justify-between">
              <p className="system-label">Rank progression</p>
              <Trophy className="size-5 text-primary" />
            </div>
            <div className="my-7 flex items-center justify-between">
              {rankList.map((r) => {
                const isActive = r === rankInfo.rank;
                return (
                  <div
                    key={r}
                    className={`grid size-9 place-items-center border font-display text-lg font-bold transition-all ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-[0_0_20px_var(--system-glow)]"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {r}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs">
              <span>{currentXp} XP</span>
              <span className="text-muted-foreground">
                Next: {rankInfo.nextRank}
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-muted">
              <div
                className="h-full bg-primary shadow-[0_0_12px_var(--system-glow)] transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="mt-7 border-t border-border pt-5">
              <p className="font-display text-2xl font-bold uppercase">{rankInfo.nextRank} unlocks</p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li className="flex gap-2">
                  <ChevronRight className="size-4 text-primary" />
                  Advanced hypertrophy missions
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="size-4 text-primary" />
                  Anabolic recovery multiplier
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Focused Exercises Section */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WarmupGate onWarmupComplete={handleWarmupComplete}>
              <div className="system-panel p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="system-label">
                      {rec.isUnderweight ? "Mass Gain Hypertrophy Split" : "Training Protocol"}
                    </p>
                    <h2 className="mt-2 text-3xl font-bold uppercase">
                      {rec.isUnderweight ? "Compound Mass Routine" : "Weekly Split"}
                    </h2>
                  </div>
                  <Dumbbell className="text-primary" />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {rec.exercises.map((day) => (
                    <div key={day.day} className="border border-border bg-card p-4">
                      <div className="flex items-center justify-between border-b border-border/50 pb-2">
                        <span className="font-mono text-xs font-bold text-primary">{day.day}</span>
                        <span className="font-display text-xs uppercase tracking-wider text-muted-foreground">
                          {day.focus}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        {day.lifts.map((lift) => (
                          <div key={lift.name} className="flex justify-between items-start text-xs">
                            <div>
                              <p className="font-semibold text-foreground">{lift.name}</p>
                              <p className="text-[10px] text-muted-foreground">{lift.note}</p>
                            </div>
                            <span className="font-mono text-[10px] text-primary whitespace-nowrap ml-2">
                              {lift.setsReps}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {rec.isUnderweight && (
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="font-mono text-[10px] text-muted-foreground">
                      // Note for low weight: Rest 90–120s between compound sets to lift heavier. Minimize high-intensity cardio to preserve surplus calories for muscle mass.
                    </p>
                  </div>
                )}
              </div>
            </WarmupGate>
          </div>

          {/* Daily Quests */}
          <div className="system-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="system-label">Daily quests</p>
                <h2 className="mt-2 text-3xl font-bold uppercase">
                  {remainingCount === 0 ? "All cleared!" : `${remainingCount} remaining`}
                </h2>
              </div>
              <Target className="text-primary" />
            </div>
            <div className="mt-6 space-y-3">
              {QUEST_DEFS.map((q) => {
                const isDone = completed.includes(q.id);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleToggleQuest(q.id, q.xp, q.title)}
                    className={`flex w-full items-center gap-3 border p-3 text-left transition-all cursor-pointer ${
                      isDone
                        ? "border-success/50 bg-success/10 text-foreground"
                        : "border-border bg-card hover:border-primary/60"
                    }`}
                  >
                    <span className={isDone ? "text-success" : "text-primary"}>{q.icon}</span>
                    <span
                      className={`flex-1 text-xs font-semibold ${
                        isDone ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {q.title}
                    </span>
                    <span className="font-mono text-[9px] text-success">+{q.xp} XP</span>
                    <div
                      className={`grid size-5 place-items-center border rounded-xs transition-colors ${
                        isDone
                          ? "border-success bg-success text-success-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {isDone ? <Check className="size-3.5 stroke-[3]" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>

            {rec.isUnderweight && (
              <div className="mt-6 rounded-sm border border-primary/30 bg-primary/5 p-3.5">
                <p className="system-label text-[9px] text-primary">Weight Gain Protocol Tip</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
                  {rec.weightGainTips[0]}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Specific Nutrition Protocol */}
        <section className="mt-6 system-panel p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="system-label">
                {rec.isUnderweight ? "Hypertrophic Mass Fuel" : "Nutrition Protocol"}
              </p>
              <h2 className="mt-2 text-4xl font-black uppercase">
                {rec.isUnderweight ? "Caloric Surplus" : "Fuel the vessel"}
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Calibrated for Age {p.age} ({p.weight} kg, {p.height} cm).{" "}
                {rec.isUnderweight
                  ? `Structured with a +${rec.calorieSurplusOrDeficit} kcal surplus to guarantee weight gain without digestive fatigue.`
                  : `Structured around your ${p.diet} preference and ${p.goal} goal.`}
              </p>

              <div className="mt-4">
                <Button asChild variant="green" size="sm" className="font-mono text-xs uppercase">
                  <Link to="/diet">
                    Open Diet Matrix & Alternatives <ArrowUpRight className="ml-1.5 size-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <div>
                  <p className="font-display text-3xl font-bold text-primary">{rec.caloricTarget}</p>
                  <p className="system-label text-[8px]">Calories</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-primary">{rec.proteinGrams}g</p>
                  <p className="system-label text-[8px]">Protein</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-primary">{rec.carbsGrams}g</p>
                  <p className="system-label text-[8px]">Carbs</p>
                </div>
                <div>
                  <p className="font-display text-3xl font-bold text-primary">{rec.fatsGrams}g</p>
                  <p className="system-label text-[8px]">Healthy Fats</p>
                </div>
              </div>

              {rec.isUnderweight && (
                <div className="mt-6 space-y-1.5 border-t border-border pt-4">
                  <p className="system-label text-[8px] text-primary">Rules for Weight Gain:</p>
                  {rec.weightGainTips.slice(1, 4).map((tip, idx) => (
                    <p key={idx} className="text-[11px] leading-4 text-muted-foreground flex gap-1.5">
                      <span className="text-primary">•</span>
                      {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Meals Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <MealCard
                time="Morning"
                title={rec.meals.morning.title}
                desc={rec.meals.morning.desc}
                calories={rec.meals.morning.calories}
                protein={rec.meals.morning.protein}
              />
              <MealCard
                time="Midday"
                title={rec.meals.midday.title}
                desc={rec.meals.midday.desc}
                calories={rec.meals.midday.calories}
                protein={rec.meals.midday.protein}
              />
              <MealCard
                time={rec.isUnderweight ? "Anabolic Mass Shake" : "Midday Snack"}
                title={rec.meals.shake.title}
                desc={rec.meals.shake.desc}
                calories={rec.meals.shake.calories}
                protein={rec.meals.shake.protein}
                highlight={rec.isUnderweight}
              />
              <MealCard
                time="Evening"
                title={rec.meals.evening.title}
                desc={rec.meals.evening.desc}
                calories={rec.meals.evening.calories}
                protein={rec.meals.evening.protein}
              />
            </div>
          </div>
        </section>

        <p className="mt-8 text-center text-[11px] leading-5 text-muted-foreground">
          General fitness guidance only. Consult a qualified professional before changing your training or
          diet, especially if you have a medical condition.
        </p>
      </div>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="system-panel p-5">
      <div className="flex items-start justify-between">
        <p className="system-label text-[9px]">{label}</p>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="mt-5 font-display text-4xl font-black">{value}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function MealCard({
  time,
  title,
  desc,
  calories,
  protein,
  highlight = false,
}: {
  time: string;
  title: string;
  desc: string;
  calories: number;
  protein: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-5 flex flex-col justify-between border ${
        highlight
          ? "border-primary/60 bg-primary/10 shadow-[0_0_20px_var(--system-glow-soft)]"
          : "border-border bg-card"
      }`}
    >
      <div>
        <div className="flex items-center justify-between">
          <p className="system-label text-[8px]">{time}</p>
          <span className="font-mono text-[9px] text-primary">
            {calories} kcal · {protein}g P
          </span>
        </div>
        <p className="mt-2 text-sm font-bold text-foreground">{title}</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}