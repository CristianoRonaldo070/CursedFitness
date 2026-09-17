import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Info,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  WARMUP_ACTIVITIES,
  TOTAL_WARMUP_DURATION_SEC,
  isWarmupCompletedToday,
  setWarmupCompleted,
  resetWarmup,
  getTimeUntilReset,
  type WarmupExercise,
} from "@/lib/warmup";

interface WarmupGateProps {
  children: ReactNode;
  onWarmupComplete?: () => void;
}

function playTone(freq = 660, duration = 0.18) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // AudioContext might be restricted by user gesture policy
  }
}

export function WarmupGate({ children, onWarmupComplete }: WarmupGateProps) {
  const [completedToday, setCompletedToday] = useState(() => isWarmupCompletedToday());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(WARMUP_ACTIVITIES[0].durationSec);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinishedAll, setHasFinishedAll] = useState(false);
  const [resetTimerText, setResetTimerText] = useState(() => getTimeUntilReset().formatted);

  const activeExercise: WarmupExercise = WARMUP_ACTIVITIES[currentIdx];

  // Periodic check for 6:00 AM reset and countdown update
  useEffect(() => {
    function checkStatus() {
      const isDone = isWarmupCompletedToday();
      setCompletedToday(isDone);
      setResetTimerText(getTimeUntilReset().formatted);
    }

    checkStatus();

    const interval = setInterval(checkStatus, 15000); // Check every 15s
    window.addEventListener("cursed-warmup-change", checkStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("cursed-warmup-change", checkStatus);
    };
  }, []);

  // Countdown timer logic when modal is active
  useEffect(() => {
    if (!isModalOpen || !isRunning || hasFinishedAll) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playTone(880, 0.25);
          // Advance to next exercise or finish
          if (currentIdx < WARMUP_ACTIVITIES.length - 1) {
            const nextIdx = currentIdx + 1;
            setCurrentIdx(nextIdx);
            return WARMUP_ACTIVITIES[nextIdx].durationSec;
          } else {
            // All exercises complete!
            setIsRunning(false);
            setHasFinishedAll(true);
            playTone(1100, 0.4);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isModalOpen, isRunning, currentIdx, hasFinishedAll]);

  function startWarmupSession() {
    setCurrentIdx(0);
    setSecondsLeft(WARMUP_ACTIVITIES[0].durationSec);
    setIsRunning(true);
    setHasFinishedAll(false);
    setIsModalOpen(true);
  }

  function handleNextExercise() {
    if (currentIdx < WARMUP_ACTIVITIES.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setSecondsLeft(WARMUP_ACTIVITIES[nextIdx].durationSec);
    } else {
      setIsRunning(false);
      setHasFinishedAll(true);
      playTone(1100, 0.4);
    }
  }

  function handlePrevExercise() {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      setSecondsLeft(WARMUP_ACTIVITIES[prevIdx].durationSec);
    }
  }

  function handleResetCurrentExercise() {
    setSecondsLeft(activeExercise.durationSec);
  }

  function handleCompleteAndUnlock() {
    setWarmupCompleted();
    setCompletedToday(true);
    setIsModalOpen(false);
    setHasFinishedAll(false);
    toast.success("Warm-Up Protocol Conquered! +50 XP gained. Daily workouts unlocked!");
    if (onWarmupComplete) {
      onWarmupComplete();
    }
  }

  // Format seconds into MM:SS
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {/* If Warm-up is completed, display the unlocked status banner above children */}
      {completedToday ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 border border-success/40 bg-success/10 p-4 sm:flex-row sm:items-center sm:justify-between shadow-[0_0_20px_rgba(34,197,94,0.12)]">
            <div className="flex items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-sm bg-success/20 text-success">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-sm font-black uppercase tracking-wider text-success">
                    Daily Warm-Up Cleared // Protocol Unlocked
                  </span>
                  <span className="bg-success/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-success">
                    Active
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-foreground/80">
                  Your neuromuscular system is primed. Daily workout plan unlocked until 06:00 AM reset (in {resetTimerText}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={startWarmupSession}
                className="border-success/30 font-mono text-xs uppercase text-success hover:bg-success/20"
              >
                <RotateCcw className="mr-1.5 size-3.5" /> Redo Warm-Up
              </Button>
            </div>
          </div>

          {/* Unlocked Daily Workout Plan Content */}
          {children}
        </div>
      ) : (
        /* If Warm-up is NOT completed, display the Lock Gate & Warm-Up Start Launcher */
        <div className="system-panel relative overflow-hidden border border-primary/50 p-6 md:p-8 shadow-[0_0_35px_var(--system-glow-soft)]">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 size-48 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-xs bg-primary text-primary-foreground shadow-[0_0_12px_var(--system-glow)]">
                  <Flame className="size-4" />
                </span>
                <span className="system-label text-primary">
                  Protocol Gate // Mandatory Morning Warm-Up
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                <Clock className="size-3.5 text-primary" />
                <span>Resets daily at 06:00 AM (in {resetTimerText})</span>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
              <div>
                <h2 className="text-3xl font-black uppercase leading-tight md:text-4xl">
                  Prime Your Vessel
                  <br />
                  <span className="text-primary text-glow">Before The Daily Mission</span>
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Lifting without thermal joint activation severely increases tear risk and impairs force output. Complete today's 3.5-minute mobility calibration to unlock your daily workout protocol.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Timer className="size-4 text-primary" /> ~3m 30s Total
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Dumbbell className="size-4 text-primary" /> 5 Calibrated Activities
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 text-success">
                    <Trophy className="size-4 text-success" /> +50 XP Reward
                  </span>
                </div>

                <div className="mt-7">
                  <Button
                    onClick={startWarmupSession}
                    variant="orange"
                    size="system"
                    className="w-full sm:w-auto px-8 py-6 text-base font-bold shadow-[0_0_25px_rgba(249,115,22,0.3)]"
                  >
                    <Flame className="mr-2 size-5 animate-pulse" />
                    Start Warm-Up Protocol
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </div>
              </div>

              {/* Quick Exercise List Preview */}
              <div className="space-y-2 border border-border/80 bg-card/60 p-4">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Today's Activation Sequence (Average Man Standard):
                </p>
                <div className="divide-y divide-border/40">
                  {WARMUP_ACTIVITIES.map((ex, idx) => (
                    <div key={ex.id} className="flex items-center justify-between py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-primary">0{idx + 1}</span>
                        <span className="font-medium text-foreground">{ex.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {ex.durationSec}s
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Guided Warm-Up Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl border border-primary/50 bg-card p-6 shadow-[0_0_50px_var(--system-glow)] md:p-8">
            {/* Header / Close button */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center bg-primary text-primary-foreground font-display font-black text-sm">
                  CF
                </span>
                <div>
                  <p className="system-label text-[9px]">
                    Warm-Up Protocol // Activity {currentIdx + 1} of {WARMUP_ACTIVITIES.length}
                  </p>
                  <h3 className="font-display text-lg font-black uppercase tracking-wider">
                    {hasFinishedAll ? "Protocol Conquered" : activeExercise.name}
                  </h3>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close warm-up"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Overall Progress Bar */}
            <div className="mt-4 h-1.5 bg-muted">
              <div
                className="h-full bg-primary shadow-[0_0_12px_var(--system-glow)] transition-all duration-300"
                style={{
                  width: `${((currentIdx + (hasFinishedAll ? 1 : 0)) / WARMUP_ACTIVITIES.length) * 100}%`,
                }}
              />
            </div>

            {hasFinishedAll ? (
              /* Completion Screen */
              <div className="py-10 text-center">
                <div className="mx-auto grid size-20 place-items-center rounded-full border border-success/50 bg-success/15 shadow-[0_0_35px_rgba(34,197,94,0.3)]">
                  <Trophy className="size-10 text-success" />
                </div>

                <h4 className="mt-6 text-3xl font-black uppercase text-foreground">
                  Warm-Up Accomplished!
                </h4>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Your core body temperature is elevated and your joints are lubricated. You have cleared the morning protocol gate.
                </p>

                <div className="my-6 inline-flex items-center gap-2 border border-success/40 bg-success/10 px-4 py-2 font-mono text-xs uppercase text-success">
                  <Sparkles className="size-4" /> +50 Hunter XP Added
                </div>

                <div>
                  <Button
                    onClick={handleCompleteAndUnlock}
                    variant="green"
                    size="system"
                    className="w-full sm:w-auto px-10 text-base"
                  >
                    Unlock Daily Workout Plan <ArrowRight className="ml-2 size-5" />
                  </Button>
                </div>
              </div>
            ) : (
              /* Active Exercise Screen */
              <div className="mt-6 space-y-6">
                {/* Big Timer and Reps */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col items-center justify-center border border-border bg-background/50 p-6 text-center">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      Time Remaining
                    </span>
                    <div className="mt-2 font-mono text-6xl font-black tracking-tight text-primary text-glow">
                      {formatTime(secondsLeft)}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isRunning ? "outline" : "default"}
                        onClick={() => setIsRunning((r) => !r)}
                        className="font-mono text-xs uppercase"
                      >
                        {isRunning ? (
                          <>
                            <Pause className="mr-1.5 size-3.5" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-1.5 size-3.5" /> Start Timer
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleResetCurrentExercise}
                        className="font-mono text-xs uppercase text-muted-foreground"
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between border border-border bg-card p-5">
                    <div>
                      <span className="system-label text-[9px]">Prescribed Reps / Tempo</span>
                      <p className="mt-1 font-display text-lg font-bold uppercase text-primary">
                        {activeExercise.reps}
                      </p>
                    </div>

                    <div className="mt-3">
                      <span className="system-label text-[9px]">Target Area</span>
                      <p className="text-xs text-muted-foreground">{activeExercise.targetMuscles}</p>
                    </div>

                    <div className="mt-3 border-t border-border/60 pt-2">
                      <span className="system-label text-[9px] text-success">Why This Matters</span>
                      <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                        {activeExercise.benefit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions Box */}
                <div className="border border-border/80 bg-background/80 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    Execution Cues:
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground/90">
                    {activeExercise.instructions}
                  </p>
                </div>

                {/* Navigation and Next controls */}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevExercise}
                    disabled={currentIdx === 0}
                    className="font-mono text-xs uppercase"
                  >
                    <ChevronLeft className="mr-1 size-4" /> Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="green"
                      size="sm"
                      onClick={handleNextExercise}
                      className="font-mono text-xs uppercase"
                    >
                      {currentIdx === WARMUP_ACTIVITIES.length - 1 ? (
                        <>
                          Finish Warm-Up <Check className="ml-1.5 size-4" />
                        </>
                      ) : (
                        <>
                          Next Exercise <ChevronRight className="ml-1.5 size-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
