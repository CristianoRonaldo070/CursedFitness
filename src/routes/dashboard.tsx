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
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Trophy,
  X,
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
import { shouldDailyQuestsReset, markDailyQuestsCycle } from "@/lib/warmup";
import { useIsCapacitor } from "@/hooks/use-capacitor";
import {
  type RankTier,
  RANK_ORDER,
  RANKS_DATA,
  getRankInfo,
} from "@/lib/ranks";
import { RankEmblem, RankPromotionModal } from "@/components/rank-emblem";
import bodyImage from "@/assets/body.png";

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

const QUEST_DEFS = [
  { id: "steps", title: "8,000 steps", xp: 40, icon: <Footprints /> },
  { id: "protein", title: "Hit protein goal", xp: 60, icon: <Salad /> },
  { id: "workout", title: "Main workout", xp: 240, icon: <Dumbbell /> },
];

function DashboardPage() {
  const [p, setP] = useState<FitnessProfile>(defaultProfile);
  const isNative = useIsCapacitor();

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const loaded = await fetchProfile();
      if (isMounted) {
        if (
          shouldDailyQuestsReset() &&
          ((loaded.completedQuests && loaded.completedQuests.length > 0) || loaded.isMissionActive)
        ) {
          const resetProfile = {
            ...loaded,
            completedQuests: [],
            isMissionActive: false,
          };
          setP(resetProfile);
          await saveProfile(resetProfile);
        } else {
          setP(loaded);
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize daily quests reset with warm-up reset and 6:00 AM cycle
  useEffect(() => {
    function checkQuestsReset() {
      if (shouldDailyQuestsReset()) {
        setP((prev) => {
          if ((prev.completedQuests && prev.completedQuests.length > 0) || prev.isMissionActive) {
            const updated = {
              ...prev,
              completedQuests: [],
              isMissionActive: false,
            };
            saveProfile(updated);
            return updated;
          }
          return prev;
        });
      }
    }

    const interval = setInterval(checkQuestsReset, 15000);
    window.addEventListener("cursed-warmup-change", checkQuestsReset);
    window.addEventListener("cursed-quests-reset", checkQuestsReset);

    return () => {
      clearInterval(interval);
      window.removeEventListener("cursed-warmup-change", checkQuestsReset);
      window.removeEventListener("cursed-quests-reset", checkQuestsReset);
    };
  }, []);

  const bmi = getBmi(p);
  const rec = getHunterRecommendations(p);

  const [inspectedRank, setInspectedRank] = useState<RankTier | null>(null);
  const [testAscensionTier, setTestAscensionTier] = useState<RankTier | null>(null);

  const currentXp = p.xp ?? 340;
  const completed = p.completedQuests ?? [];
  const rankInfo = getRankInfo(currentXp);
  const xpPercent = rankInfo.tierProgressPercent;

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
      markDailyQuestsCycle();
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
      markDailyQuestsCycle();
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
    markDailyQuestsCycle();
  }

  const remainingCount = QUEST_DEFS.length - completed.length;

  return (
    <main className={`min-h-screen ${isNative ? "pt-4 pb-24" : "pt-18"}`}>
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Equipped Hunter Rank Emblem with Glowing Aura */}
            <div className="relative shrink-0">
              <RankEmblem
                rank={rankInfo.tier}
                size="xl"
                withGlow={true}
                interactive={true}
                onClick={() => setInspectedRank(rankInfo.tier)}
                className="cursor-pointer transition-transform hover:scale-105"
              />
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded border shadow-lg bg-background whitespace-nowrap"
                style={{
                  color: rankInfo.color,
                  borderColor: rankInfo.color,
                }}
              >
                {rankInfo.tier}-Rank
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                  style={{
                    color: rankInfo.color,
                    borderColor: rankInfo.color,
                    backgroundColor: `${rankInfo.color}15`,
                  }}
                >
                  {rankInfo.tier}-Rank // {rankInfo.title}
                </span>
                <span className="border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                  {rec.protocolTag}
                </span>
              </div>
              <h1 className="mt-2 text-4xl font-black uppercase md:text-6xl tracking-tight">
                Welcome, <span className="text-primary">{p.name}</span>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Age {p.age} · {p.weight} kg · {p.height} cm — {rec.protocolTitle}
              </p>
            </div>
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
            sub={rankInfo.nextTier === "MAX" ? "Max Ascension Reached" : `${rankInfo.targetTierXp - rankInfo.currentTierXp} XP to ${rankInfo.nextTier}-Rank`}
          />
        </section>

        {/* Main Quest & Rank Progression */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
          <div className="system-panel overflow-hidden">
            <div className="relative min-h-[330px]">
              <img
                src={bodyImage}
                alt="Strength training mission"
                className="absolute inset-0 h-full w-full object-cover object-[75%_25%] opacity-85"
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
              <div>
                <p className="system-label">Rank progression</p>
                <p className="font-display text-xl font-bold uppercase text-foreground mt-0.5">
                  Hunter Ascension Path
                </p>
              </div>
              <Trophy className="size-5 text-primary" />
            </div>

            {/* Interactive Emblems Grid */}
            <div className="my-6 grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {RANK_ORDER.map((r) => {
                const isActive = r === rankInfo.tier;
                const meta = RANKS_DATA[r];
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setInspectedRank(r)}
                    className={`group relative flex flex-col items-center justify-between p-2.5 rounded-sm border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "border-primary bg-primary/10 shadow-[0_0_24px_var(--system-glow)] scale-105"
                        : "border-border/80 bg-card/60 hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded font-mono text-[7px] font-black uppercase tracking-widest bg-primary text-primary-foreground shadow">
                        EQUIPPED
                      </span>
                    )}
                    <RankEmblem
                      rank={r}
                      size="sm"
                      withGlow={isActive}
                      className="transition-transform group-hover:scale-110"
                    />
                    <div className="mt-1.5 text-center">
                      <span className={`block font-display text-xs font-black uppercase ${isActive ? "text-primary" : "text-foreground"}`}>
                        {r}
                      </span>
                      <span className="block font-mono text-[8px] uppercase tracking-wider text-muted-foreground truncate max-w-[50px]">
                        {meta.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress Bar & Stats */}
            <div className="flex justify-between text-xs font-mono">
              <span className="text-primary font-bold">{currentXp} XP</span>
              <span className="text-muted-foreground">
                {rankInfo.nextTier === "MAX"
                  ? "MAX ASCENSION ACHIEVED"
                  : `Next: ${rankInfo.nextTier}-Rank (${rankInfo.nextTitle})`}
              </span>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary shadow-[0_0_12px_var(--system-glow)] transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            {/* Next Rank Unlocks from Rank Metadata */}
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold uppercase">
                  {rankInfo.nextTier === "MAX" ? "Max Rank Unlocked" : `${rankInfo.nextTier}-Rank (${rankInfo.nextTitle}) Unlocks`}
                </p>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {rankInfo.nextTier === "MAX" ? "100%" : `${rankInfo.targetTierXp - rankInfo.currentTierXp} XP Needed`}
                </span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
                {(rankInfo.nextTier === "MAX" ? rankInfo.unlocks : RANKS_DATA[rankInfo.nextTier].unlocks).map((unlock) => (
                  <li key={unlock} className="flex items-center gap-2">
                    <ChevronRight className="size-3.5 text-primary shrink-0" />
                    <span>{unlock}</span>
                  </li>
                ))}
              </ul>

              {/* Fanfare Test & Inspector Action */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setTestAscensionTier(
                      rankInfo.tier === "S" ? "E" : (RANK_ORDER[RANK_ORDER.indexOf(rankInfo.tier) + 1] || "D")
                    )
                  }
                  className="font-mono text-[10px] uppercase tracking-wider text-primary border-primary/40 hover:bg-primary/10"
                >
                  <Sparkles className="mr-1.5 size-3.5" /> Preview Ascension Fanfare
                </Button>
                <span className="font-mono text-[9px] text-muted-foreground">
                  Click any emblem to inspect
                </span>
              </div>
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
                <div className="flex items-center gap-2">
                  <p className="system-label">Daily quests</p>
                  <span className="font-mono text-[9px] text-muted-foreground">// Resets 06:00 AM</span>
                </div>
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

      {/* Automatic Rank Promotion Ceremony (fires when hunter crosses rank threshold) */}
      <RankPromotionModal currentXp={currentXp} />

      {/* Emblem Inspection Modal */}
      {inspectedRank && (() => {
        const inspectedMeta = RANKS_DATA[inspectedRank];
        const isCurrentEquipped = inspectedRank === rankInfo.tier;
        return (
          <div className="fixed inset-0 z-[99998] flex items-center justify-center p-4 bg-background/85 backdrop-blur-md animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-md border border-border bg-card p-6 md:p-8 text-center shadow-2xl [clip-path:polygon(0_12px,12px_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)] animate-in zoom-in-95 duration-200"
              style={{
                boxShadow: `0 0 35px ${inspectedMeta.glowColor}`,
                borderColor: inspectedMeta.color,
              }}
            >
              <button
                type="button"
                onClick={() => setInspectedRank(null)}
                className="absolute right-4 top-4 p-1 rounded-sm text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Close emblem inspection"
              >
                <X className="size-5" />
              </button>

              <div
                className="flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                style={{ color: inspectedMeta.color }}
              >
                <ShieldCheck className="size-3.5" /> Official Hunter Emblem
              </div>

              <div className="my-5 flex justify-center">
                <RankEmblem rank={inspectedRank} size="hero" withGlow={true} />
              </div>

              <h3 className="font-display text-3xl font-black uppercase text-foreground">
                {inspectedMeta.tier}-Rank // {inspectedMeta.title}
              </h3>
              <p className="mt-1 font-mono text-xs font-semibold" style={{ color: inspectedMeta.color }}>
                Requirement: {inspectedMeta.minXp} XP {isCurrentEquipped && "• (Currently Equipped)"}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                {inspectedMeta.description}
              </p>

              <div className="mt-5 border-t border-border/80 pt-4 text-left">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                  Rank Protocols & Capabilities:
                </p>
                <ul className="mt-2 space-y-1.5">
                  {inspectedMeta.unlocks.map((u) => (
                    <li key={u} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ChevronRight className="size-3.5 shrink-0" style={{ color: inspectedMeta.color }} />
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTestAscensionTier(inspectedRank);
                    setInspectedRank(null);
                  }}
                  className="flex-1 font-mono text-[11px] uppercase tracking-wider"
                >
                  <Sparkles className="mr-1.5 size-3.5" /> Test Animation
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setInspectedRank(null)}
                  className="flex-1 font-mono text-[11px] uppercase tracking-wider"
                  style={{
                    backgroundColor: inspectedMeta.color,
                    color: "#0a0e1a",
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Ascension Fanfare Preview Modal */}
      {testAscensionTier && (() => {
        const testMeta = RANKS_DATA[testAscensionTier];
        const testPrevTier = RANK_ORDER[Math.max(0, RANK_ORDER.indexOf(testAscensionTier) - 1)];
        const testPrevMeta = RANKS_DATA[testPrevTier];
        return (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-background/90 backdrop-blur-2xl animate-in fade-in duration-300">
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
              <div
                className="size-[650px] rounded-full blur-[140px] opacity-40 animate-pulse"
                style={{ backgroundColor: testMeta.glowColor }}
              />
              <div className="absolute size-[550px] rounded-full border border-dashed border-primary/20 animate-core-spin" />
              <div className="absolute size-[700px] rounded-full border border-primary/10 animate-core-reverse" />
            </div>

            <div
              className="relative z-10 w-full max-w-lg border border-border bg-card p-6 md:p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.8)] [clip-path:polygon(0_16px,16px_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%)] animate-in zoom-in-90 duration-500"
              style={{
                boxShadow: `0 0 50px ${testMeta.glowColor}, inset 0 0 30px ${testMeta.glowColor}`,
                borderColor: testMeta.color,
              }}
            >
              <button
                type="button"
                onClick={() => setTestAscensionTier(null)}
                className="absolute right-4 top-4 rounded-sm p-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Close ascension preview"
              >
                <X className="size-5" />
              </button>

              <div className="flex items-center justify-center gap-2">
                <Sparkles className="size-4 animate-spin" style={{ color: testMeta.color }} />
                <p className="font-mono text-xs font-bold uppercase tracking-[0.25em]" style={{ color: testMeta.color }}>
                  System Notice // Rank Ascension
                </p>
                <Sparkles className="size-4 animate-spin" style={{ color: testMeta.color }} />
              </div>

              <h2 className="mt-3 font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
                Rank Ascension!
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Your physical power and quests have unlocked the {testMeta.title} rank.
              </p>

              <div className="mt-5 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 rounded border border-border bg-muted/40 px-3 py-1.5 opacity-60">
                  <img src={testPrevMeta.image} alt={testPrevMeta.title} className="size-6 object-contain" />
                  <span className="font-mono text-xs font-bold uppercase">{testPrevMeta.tier} Rank</span>
                </div>
                <ChevronRight className="size-4 text-muted-foreground animate-pulse" />
                <div
                  className="flex items-center gap-2 rounded border px-3.5 py-1.5 font-bold shadow-lg"
                  style={{
                    borderColor: testMeta.color,
                    backgroundColor: `${testMeta.color}20`,
                    color: testMeta.color,
                  }}
                >
                  <Zap className="size-4" />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {testMeta.tier}-Rank {testMeta.title}
                  </span>
                </div>
              </div>

              <div className="my-6 flex justify-center">
                <div className="relative group">
                  <div
                    className="absolute -inset-4 rounded-full blur-2xl opacity-75 animate-pulse"
                    style={{ backgroundColor: testMeta.glowColor }}
                  />
                  <img
                    src={testMeta.image}
                    alt={`${testMeta.tier} Rank Emblem`}
                    className="relative z-10 size-48 md:size-56 object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.7)] animate-in zoom-in-75 duration-700 hover:scale-110 transition-transform"
                  />
                </div>
              </div>

              <div className="rounded border border-border/80 bg-background/60 p-4 backdrop-blur-md">
                <p className="font-display text-2xl font-black uppercase" style={{ color: testMeta.color }}>
                  {testMeta.title} Emblem Equipped
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {testMeta.description}
                </p>
                <div className="mt-4 border-t border-border/60 pt-3 text-left">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
                    New Protocols Unlocked:
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {testMeta.unlocks.map((u) => (
                      <li key={u} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="size-3.5 shrink-0" style={{ color: testMeta.color }} />
                        <span>{u}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setTestAscensionTier(null)}
                size="system"
                className="mt-6 w-full font-mono text-xs uppercase tracking-widest cursor-pointer"
                style={{
                  backgroundColor: testMeta.color,
                  color: "#0a0e1a",
                }}
              >
                Equip {testMeta.tier}-Rank Emblem & Ascend
              </Button>
            </div>
          </div>
        );
      })()}
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