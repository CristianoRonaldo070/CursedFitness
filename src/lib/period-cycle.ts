import type { FitnessProfile } from "./profile";

export interface PeriodCycleInfo {
  /** Whether the user is currently in their menstrual (bleeding) phase */
  isOnPeriod: boolean;
  /** Current day of the period (1-based), or 0 if not on period */
  periodDay: number;
  /** Total duration of the period in days */
  periodDuration: number;
  /** Days until next predicted period starts */
  daysUntilNext: number;
  /** Current phase of the menstrual cycle */
  phase: "menstrual" | "follicular" | "ovulatory" | "luteal";
  /** Current day within the full cycle (1-based) */
  cycleDay: number;
  /** Human-readable phase label */
  phaseLabel: string;
  /** Exercise guidance for the current phase */
  exerciseAdvice: string;
  /** Nutrition guidance for the current phase */
  nutritionAdvice: string;
}

/**
 * Calculate the current menstrual cycle status from the profile.
 * Returns null if the user is male or hasn't configured their period.
 */
export function getPeriodCycleInfo(profile: FitnessProfile): PeriodCycleInfo | null {
  if (profile.gender !== "female") return null;
  if (!profile.periodCycleStartDate) return null;

  const periodDuration = profile.periodCycleDuration ?? 5;
  const cycleLength = profile.periodCycleLength ?? 28;

  const startDate = new Date(profile.periodCycleStartDate);
  startDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate how many days since the last recorded cycle start
  const diffMs = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Start date is in the future — approximate
    const daysUntil = Math.abs(diffDays);
    return {
      isOnPeriod: false,
      periodDay: 0,
      periodDuration,
      daysUntilNext: daysUntil,
      phase: "follicular",
      cycleDay: 0,
      phaseLabel: "Pre-Cycle",
      exerciseAdvice: "Standard training protocol — no cycle-based modifications needed yet.",
      nutritionAdvice: "Maintain standard nutrition protocol.",
    };
  }

  // Current day in the cycle (wraps every cycleLength days)
  const cycleDay = (diffDays % cycleLength) + 1; // 1-based

  const isOnPeriod = cycleDay <= periodDuration;
  const periodDay = isOnPeriod ? cycleDay : 0;
  const daysUntilNext = isOnPeriod ? 0 : cycleLength - cycleDay + 1;

  // Determine cycle phase
  let phase: PeriodCycleInfo["phase"];
  let phaseLabel: string;
  let exerciseAdvice: string;
  let nutritionAdvice: string;

  if (cycleDay <= periodDuration) {
    // MENSTRUAL PHASE (Day 1 – periodDuration)
    phase = "menstrual";
    phaseLabel = `Menstrual Phase (Day ${cycleDay}/${periodDuration})`;
    exerciseAdvice =
      "Light movement only — gentle yoga (child's pose, cat-cow, supine twist), walking, and light stretching. " +
      "Avoid heavy lifting, high-intensity intervals, and inversions. Focus on restorative flow and pain relief poses. " +
      "Keep sessions under 30 minutes with mindful breathing.";
    nutritionAdvice =
      "Increase iron-rich foods (spinach, lentils, beetroot, dates) to replenish blood loss. " +
      "Add anti-inflammatory foods — turmeric milk, ginger tea, omega-3 fatty acids. " +
      "Prioritize warm, easily digestible meals. Stay well-hydrated with herbal teas. Avoid excess caffeine and processed sugar.";
  } else if (cycleDay <= periodDuration + 7) {
    // FOLLICULAR PHASE (after period ends through ~day 13)
    phase = "follicular";
    phaseLabel = `Follicular Phase (Day ${cycleDay})`;
    exerciseAdvice =
      "Energy is rising — ideal time for progressive strength training and moderate cardio. " +
      "Your body recovers faster during this phase. Push for new personal records on compound lifts.";
    nutritionAdvice =
      "Lean proteins and complex carbs to fuel rising energy. Include fermented foods for gut health. " +
      "This is the best phase for a slight caloric surplus if your goal is muscle building.";
  } else if (cycleDay <= periodDuration + 10) {
    // OVULATORY PHASE (~day 14-16)
    phase = "ovulatory";
    phaseLabel = `Ovulatory Phase (Day ${cycleDay})`;
    exerciseAdvice =
      "Peak energy and strength — excellent for HIIT, heavy compound movements, and athletic performance. " +
      "Be mindful of joint laxity (ligament injury risk is slightly elevated due to estrogen peak).";
    nutritionAdvice =
      "Light, nutrient-dense meals — salads, lean protein, cruciferous vegetables to support estrogen metabolism. " +
      "Increase fiber intake and stay hydrated.";
  } else {
    // LUTEAL PHASE (~day 17-28)
    phase = "luteal";
    phaseLabel = `Luteal Phase (Day ${cycleDay})`;
    exerciseAdvice =
      "Moderate intensity — yoga, Pilates, steady-state cardio, and lighter resistance training. " +
      "Energy may decline as the phase progresses. Listen to your body and reduce volume if fatigued.";
    nutritionAdvice =
      "Combat PMS cravings with magnesium-rich foods (dark chocolate 85%+, pumpkin seeds, bananas). " +
      "Increase healthy fats and complex carbs. Reduce sodium to minimize bloating. B6-rich foods (chickpeas, potatoes) help with mood.";
  }

  return {
    isOnPeriod,
    periodDay,
    periodDuration,
    daysUntilNext,
    phase,
    cycleDay,
    phaseLabel,
    exerciseAdvice,
    nutritionAdvice,
  };
}

/**
 * Generate period-adapted light exercises (yoga + walking) for menstrual phase days.
 */
export function getPeriodExercises(cycleDay: number): Array<{
  day: string;
  focus: string;
  lifts: Array<{ name: string; setsReps: string; note: string }>;
}> {
  return [
    {
      day: `Period Day ${cycleDay}`,
      focus: "Restorative Yoga & Gentle Movement",
      lifts: [
        { name: "Cat-Cow Stretch", setsReps: "10 breaths", note: "Relieves lower back pain & menstrual cramps" },
        { name: "Child's Pose (Balasana)", setsReps: "Hold 60s × 3", note: "Calms nervous system & eases abdominal tension" },
        { name: "Supine Spinal Twist", setsReps: "Hold 30s each side", note: "Gentle detox & spinal decompression" },
        { name: "Legs-Up-The-Wall (Viparita Karani)", setsReps: "Hold 3–5 min", note: "Reduces bloating & improves circulation" },
        { name: "Gentle Walking", setsReps: "15–20 min", note: "Light cardio to boost endorphins naturally" },
        { name: "Deep Diaphragmatic Breathing", setsReps: "5 min", note: "Activates parasympathetic rest & recovery" },
      ],
    },
  ];
}

/**
 * Generate period-adapted meals for menstrual phase.
 */
export function getPeriodMeals(diet: string): {
  morning: { title: string; desc: string; calories: number; protein: number };
  midday: { title: string; desc: string; calories: number; protein: number };
  shake: { title: string; desc: string; calories: number; protein: number };
  evening: { title: string; desc: string; calories: number; protein: number };
} {
  const isVegan = diet === "vegan";
  const isVeg = diet === "vegetarian" || isVegan;

  return {
    morning: {
      title: "Iron-Replenishing Warm Breakfast",
      desc: isVegan
        ? "Warm oatmeal with dates, raisins, pumpkin seeds, and blackstrap molasses drizzle. Golden turmeric almond milk on the side."
        : isVeg
        ? "Warm dalia (broken wheat) porridge with jaggery, raisins, and a glass of warm turmeric milk with ghee."
        : "Scrambled eggs with spinach and sundried tomatoes, 2 dates, warm turmeric milk with honey.",
      calories: 480,
      protein: 22,
    },
    midday: {
      title: "Anti-Inflammatory Iron Bowl",
      desc: isVegan
        ? "Red lentil dal with beetroot, steamed broccoli, brown rice, and a side of vitamin C-rich amla (gooseberry) chutney."
        : isVeg
        ? "Palak paneer with brown rice, beetroot raita, and a side of lemon-dressed green salad."
        : "Grilled salmon or chicken with sautéed spinach, sweet potato mash, and lemon-herb dressing.",
      calories: 580,
      protein: 38,
    },
    shake: {
      title: "Soothing Anti-Cramp Smoothie",
      desc: "Banana, cocoa powder (magnesium), almond butter, 1 tbsp flaxseed, and warm oat milk with a pinch of cinnamon.",
      calories: 320,
      protein: 16,
    },
    evening: {
      title: "Warm Comfort Recovery Dinner",
      desc: isVegan
        ? "Hearty moong dal khichdi with roasted cumin, ginger, and a side of sautéed leafy greens with sesame oil."
        : isVeg
        ? "Vegetable khichdi with ghee, ginger-garlic tadka, and a bowl of warm beetroot soup."
        : "Bone broth soup with ginger, garlic, and turmeric. Light chicken or paneer stir-fry with steamed vegetables.",
      calories: 520,
      protein: 30,
    },
  };
}
