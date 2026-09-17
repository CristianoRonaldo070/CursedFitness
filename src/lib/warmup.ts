export interface WarmupExercise {
  id: string;
  name: string;
  durationSec: number;
  reps: string;
  targetMuscles: string;
  instructions: string;
  benefit: string;
}

export const WARMUP_ACTIVITIES: WarmupExercise[] = [
  {
    id: "arm-circles-taps",
    name: "Dynamic Arm Circles & Shoulder Taps",
    durationSec: 35,
    reps: "15 reps forward/back + 10 taps",
    targetMuscles: "Rotator cuffs, Deltoids, Upper Back & Chest",
    instructions:
      "Stand tall with arms extended outward. Perform 15 controlled circles forward, then 15 backward. Drop into a high plank position and tap opposite shoulders with steady core balance.",
    benefit:
      "Lubricates the shoulder joint and increases synovial fluid circulation to safeguard your rotator cuffs during heavy pressing.",
  },
  {
    id: "air-squats",
    name: "Bodyweight Tempo Air Squats",
    durationSec: 45,
    reps: "12–15 controlled reps (2s down, 1s up)",
    targetMuscles: "Quadriceps, Glutes, Knees & Hip Flexors",
    instructions:
      "Set your feet shoulder-width apart with toes turned slightly outward. Push hips back and sink into a full parallel squat while keeping your chest upright. Drive through midfoot to stand.",
    benefit:
      "Activates synovial lubrication in hips and knees, primes glute activation, and prepares the lower body for compound loading.",
  },
  {
    id: "inchworm-stretch",
    name: "Inchworm to World's Greatest Stretch",
    durationSec: 50,
    reps: "6 alternating reps (3 per side)",
    targetMuscles: "Thoracic Spine, Hip Flexors, Hamstrings & Calves",
    instructions:
      "Hinge at the hips touching the ground, walk your hands out to a plank. Step your right foot forward outside your right hand into a deep runner's lunge. Reach your right arm towards the ceiling, look up, breathe, reverse, and switch sides.",
    benefit:
      "Unlocks tight hips from sitting, opens thoracic mobility, and stretches the entire posterior chain.",
  },
  {
    id: "jumping-jacks",
    name: "Cadence Jumping Jacks",
    durationSec: 40,
    reps: "30–35 rhythmic reps",
    targetMuscles: "Full Body, Cardiovascular System & Calves",
    instructions:
      "Jump lightly on the balls of your feet, swinging arms overhead and opening legs shoulder-width apart. Maintain steady nasal-diaphragmatic breathing and land softly.",
    benefit:
      "Elevates core body temperature and blood flow, raises heart rate gently, and primes neuromuscular coordination.",
  },
  {
    id: "plank-down-dog",
    name: "Plank to Downward-Facing Dog",
    durationSec: 40,
    reps: "8–10 smooth flow transitions",
    targetMuscles: "Core Stabilizers, Shoulder Girdle & Posterior Chain",
    instructions:
      "From a solid high plank with engaged abs, push your hips up and back into a V-shape downward dog. Gently press your heels towards the floor and drive your chest towards your thighs. Hold 2 seconds and flow back.",
    benefit:
      "Fires up deep transverse abdominis core stability while releasing tight calves, Achilles tendons, and lower back tension.",
  },
];

export const TOTAL_WARMUP_DURATION_SEC = WARMUP_ACTIVITIES.reduce(
  (acc, ex) => acc + ex.durationSec,
  0
);

/**
 * Returns the timestamp for the start of the current daily cycle (6:00 AM).
 * If the current time is before 6:00 AM, the cycle started yesterday at 6:00 AM.
 * If current time is >= 6:00 AM, the cycle started today at 6:00 AM.
 */
export function getCurrentCycleStart(now = new Date()): number {
  const d = new Date(now);
  if (d.getHours() < 6) {
    d.setDate(d.getDate() - 1);
  }
  d.setHours(6, 0, 0, 0);
  return d.getTime();
}

/**
 * Returns the timestamp for the upcoming 6:00 AM reset.
 */
export function getNextCycleStart(now = new Date()): number {
  const d = new Date(now);
  if (d.getHours() >= 6) {
    d.setDate(d.getDate() + 1);
  }
  d.setHours(6, 0, 0, 0);
  return d.getTime();
}

const WARMUP_STORAGE_KEY = "cursed_warmup_completed_at";

/**
 * Checks whether the warm-up has been completed during the current 6:00 AM - 5:59 AM cycle.
 */
export function isWarmupCompletedToday(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(WARMUP_STORAGE_KEY);
    if (!raw) return false;
    const timestamp = parseInt(raw, 10);
    if (isNaN(timestamp)) return false;
    const cycleStart = getCurrentCycleStart();
    return timestamp >= cycleStart;
  } catch {
    return false;
  }
}

/**
 * Marks the daily warm-up as completed at the current timestamp.
 */
export function setWarmupCompleted(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WARMUP_STORAGE_KEY, String(Date.now()));
    window.dispatchEvent(new Event("cursed-warmup-change"));
  } catch (err) {
    console.warn("Failed to set warmup complete:", err);
  }
}

/**
 * Clears warm-up completion state (resets back to locked).
 */
export function resetWarmup(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(WARMUP_STORAGE_KEY);
    window.dispatchEvent(new Event("cursed-warmup-change"));
  } catch (err) {
    console.warn("Failed to reset warmup:", err);
  }
}

/**
 * Calculates remaining time until the next 6:00 AM reset.
 */
export function getTimeUntilReset(): { hours: number; minutes: number; formatted: string } {
  const diffMs = Math.max(0, getNextCycleStart() - Date.now());
  const totalMin = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  return {
    hours,
    minutes,
    formatted: `${hours}h ${minutes.toString().padStart(2, "0")}m`,
  };
}
