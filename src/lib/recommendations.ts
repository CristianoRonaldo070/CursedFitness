import type { FitnessProfile } from "./profile";

export type WeightStatus = "underweight" | "optimal" | "overweight" | "heavy";

export interface HunterRecommendation {
  status: WeightStatus;
  statusLabel: string;
  isUnderweight: boolean;
  minIdealWeight: number;
  maxIdealWeight: number;
  weightDifference: number;
  caloricTarget: number;
  calorieSurplusOrDeficit: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  protocolTitle: string;
  protocolTag: string;
  protocolSummary: string;
  ageInsight: string;
  exercises: Array<{
    day: string;
    focus: string;
    lifts: Array<{ name: string; setsReps: string; note: string }>;
  }>;
  meals: {
    morning: { title: string; desc: string; calories: number; protein: number };
    midday: { title: string; desc: string; calories: number; protein: number };
    shake: { title: string; desc: string; calories: number; protein: number };
    evening: { title: string; desc: string; calories: number; protein: number };
  };
  weightGainTips: string[];
}

export function getHunterRecommendations(profile: FitnessProfile): HunterRecommendation {
  const { age, height, weight, activity, diet, goal } = profile;

  // Calculate BMI
  const heightM = height / 100;
  const bmi = heightM > 0 ? weight / (heightM * heightM) : 22;

  // Ideal weight range for height (BMI 19.5 - 24.5)
  const minIdealWeight = Math.round(19.5 * (heightM * heightM));
  const maxIdealWeight = Math.round(24.5 * (heightM * heightM));

  // Determine weight status
  let status: WeightStatus = "optimal";
  if (bmi < 18.5 || weight < minIdealWeight) {
    status = "underweight";
  } else if (bmi >= 25 && bmi < 30) {
    status = "overweight";
  } else if (bmi >= 30) {
    status = "heavy";
  }

  const isUnderweight = status === "underweight";
  const weightDifference = isUnderweight ? minIdealWeight - weight : 0;

  // Baseline BMR using Mifflin-St Jeor formula
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const activityMult = activity === "high" ? 1.55 : activity === "moderate" ? 1.375 : 1.2;
  const maintenance = Math.round(bmr * activityMult);

  // If underweight: enforce a strong +550 kcal caloric surplus for mass gain!
  let surplusOrDeficit = 0;
  if (isUnderweight) {
    surplusOrDeficit = 550;
  } else if (goal === "build") {
    surplusOrDeficit = 350;
  } else if (goal === "cut") {
    surplusOrDeficit = -450;
  } else {
    surplusOrDeficit = 0;
  }

  const caloricTarget = Math.round((maintenance + surplusOrDeficit) / 10) * 10;

  // Target macros (if underweight: 2.1g/kg protein for high muscular anabolism)
  const proteinGrams = Math.round(weight * (isUnderweight ? 2.1 : goal === "build" ? 2.0 : 1.8));
  const fatCalories = caloricTarget * 0.28;
  const fatsGrams = Math.round(fatCalories / 9);
  const carbCalories = caloricTarget - (proteinGrams * 4 + fatCalories);
  const carbsGrams = Math.max(120, Math.round(carbCalories / 4));

  // Age-specific Hunter Insights
  let ageInsight = "";
  if (age < 20) {
    ageInsight = `Age ${age} Hunter Alert: Your natural metabolic rate is elevated and growth hormone levels are high. To gain mass, prioritize calorie-dense foods, liquid nutrition, and heavy multi-joint compound lifts with 8-10 hours of sleep.`;
  } else if (age <= 29) {
    ageInsight = `Age ${age} Prime Hunter Window: Maximum muscle protein synthesis and testosterone efficiency. Leverage heavy compound progressive overload (6-10 reps) and a continuous +${surplusOrDeficit} kcal surplus to rapidly forge lean tissue.`;
  } else if (age <= 44) {
    ageInsight = `Age ${age} Strategic Muscle Density: Maintain high mechanical tension with controlled 3-second eccentric reps. Fuel with clean complex carbohydrates and anti-inflammatory fats to maximize muscle growth with optimal joint recovery.`;
  } else {
    ageInsight = `Age ${age} Veteran Hunter Protocol: Focus on muscle preservation and lean hypertrophy. Distribute protein evenly across 4 meals (35g+ per meal) to trigger the mTOR pathway, paired with compound machine and barbell movements.`;
  }

  // Focused Workout Plan
  let exercises: HunterRecommendation["exercises"] = [];
  if (isUnderweight || goal === "build") {
    exercises = [
      {
        day: "Day 01",
        focus: "Heavy Push (Chest & Shoulders Mass)",
        lifts: [
          { name: "Barbell Bench Press", setsReps: "4 sets × 6–8 reps", note: "Heavy compound, 2 min rest" },
          { name: "Incline Dumbbell Press", setsReps: "3 sets × 8–10 reps", note: "Upper chest thickness" },
          { name: "Overhead Dumbbell Press", setsReps: "3 sets × 8–10 reps", note: "Shoulder mass builder" },
          { name: "Tricep Dips or Pushdowns", setsReps: "3 sets × 10–12 reps", note: "Arm density finisher" },
        ],
      },
      {
        day: "Day 02",
        focus: "Heavy Pull (Back Width & Lat Density)",
        lifts: [
          { name: "Barbell Deadlift / Rack Pull", setsReps: "4 sets × 5 reps", note: "Full-body mass primer" },
          { name: "Chest-Supported T-Bar Row", setsReps: "4 sets × 8 reps", note: "Mid-back thickness" },
          { name: "Weighted / Assisted Pull-Ups", setsReps: "3 sets × 6–8 reps", note: "V-taper width" },
          { name: "Incline Dumbbell Bicep Curls", setsReps: "3 sets × 10–12 reps", note: "Full bicep stretch" },
        ],
      },
      {
        day: "Day 03",
        focus: "Leg Foundation (Quad & Glute Power)",
        lifts: [
          { name: "Barbell Back Squats", setsReps: "4 sets × 6–8 reps", note: "Greatest anabolic hormone stimulus" },
          { name: "Romanian Deadlift (RDL)", setsReps: "3 sets × 8–10 reps", note: "Hamstrings & posterior chain" },
          { name: "Bulgarian Split Squats", setsReps: "3 sets × 10 reps/leg", note: "Single leg hypertrophy" },
          { name: "Standing Calf Raises", setsReps: "4 sets × 12–15 reps", note: "Controlled pause at top" },
        ],
      },
      {
        day: "Day 04",
        focus: "Upper Mass & Arm Growth Split",
        lifts: [
          { name: "Dumbbell Incline Fly-to-Press", setsReps: "3 sets × 8–10 reps", note: "Deep hypertrophy stretch" },
          { name: "Close-Grip Lat Pulldown", setsReps: "3 sets × 10 reps", note: "Squeeze for 1 sec" },
          { name: "Lateral Dumbbell Raises", setsReps: "4 sets × 12–15 reps", note: "Side delt cap growth" },
          { name: "EZ-Bar Skullcrushers & Curls", setsReps: "3 supersets × 12 reps", note: "Arm mass pump" },
        ],
      },
    ];
  } else if (goal === "cut") {
    exercises = [
      {
        day: "Day 01",
        focus: "Upper Body Strength & Density",
        lifts: [
          { name: "Barbell Bench Press", setsReps: "4 sets × 8 reps", note: "Retain chest strength" },
          { name: "Lat Pulldowns", setsReps: "4 sets × 10 reps", note: "Strict tempo" },
          { name: "Overhead Press", setsReps: "3 sets × 10 reps", note: "Core braced" },
        ],
      },
      {
        day: "Day 02",
        focus: "Lower Body & Posterior Engine",
        lifts: [
          { name: "Barbell Squats", setsReps: "4 sets × 8 reps", note: "Compound power" },
          { name: "Walking Dumbbell Lunges", setsReps: "3 sets × 12 steps", note: "Calorie burner" },
          { name: "Leg Curls", setsReps: "3 sets × 12 reps", note: "Controlled negative" },
        ],
      },
      {
        day: "Day 03",
        focus: "Cardio Conditioning & Core",
        lifts: [
          { name: "Incline Treadmill Walk", setsReps: "25 mins", note: "Zone 2 heart rate" },
          { name: "Hanging Leg Raises", setsReps: "4 sets × 15 reps", note: "Core stability" },
        ],
      },
      {
        day: "Day 04",
        focus: "Full Body Circuit",
        lifts: [
          { name: "Kettlebell Swings", setsReps: "4 sets × 15 reps", note: "Explosive hip drive" },
          { name: "Dumbbell Thrusters", setsReps: "3 sets × 10 reps", note: "Metabolic conditioning" },
        ],
      },
    ];
  } else {
    exercises = [
      {
        day: "Day 01",
        focus: "Upper Body Power Focus",
        lifts: [
          { name: "Barbell Bench Press", setsReps: "4 sets × 8 reps", note: "Progressive overload" },
          { name: "Bent Over Rows", setsReps: "4 sets × 8 reps", note: "Full back tension" },
          { name: "Dumbbell Shoulder Press", setsReps: "3 sets × 10 reps", note: "Shoulder strength" },
        ],
      },
      {
        day: "Day 02",
        focus: "Lower Body Hypertrophy",
        lifts: [
          { name: "Barbell Squats", setsReps: "4 sets × 8 reps", note: "Solid depth" },
          { name: "Romanian Deadlifts", setsReps: "3 sets × 10 reps", note: "Hamstring recruitment" },
          { name: "Calf Raises", setsReps: "4 sets × 15 reps", note: "Peak contraction" },
        ],
      },
      {
        day: "Day 03",
        focus: "Conditioning & Agility",
        lifts: [
          { name: "Zone 2 Aerobic Base", setsReps: "30 min steady", note: "Cardiovascular health" },
          { name: "Plank & Core Circuit", setsReps: "3 rounds × 60s", note: "Abdominal brace" },
        ],
      },
      {
        day: "Day 04",
        focus: "Full Body Hypertrophy",
        lifts: [
          { name: "Dumbbell Incline Press", setsReps: "3 sets × 10 reps", note: "Chest volume" },
          { name: "Pull-ups / Pulldown", setsReps: "3 sets × 10 reps", note: "Back volume" },
          { name: "Leg Press", setsReps: "3 sets × 12 reps", note: "Quad pump" },
        ],
      },
    ];
  }

  // Nutrition Plans based on Diet & Weight Status
  let meals: HunterRecommendation["meals"];
  if (isUnderweight) {
    if (diet === "vegan") {
      meals = {
        morning: {
          title: "Anabolic Plant Power Breakfast",
          desc: "Tofu scramble with nutritional yeast, 2 slices seeded sourdough with smashed avocado, plus 1 cup oats with chia seeds, walnuts & maple syrup.",
          calories: 820,
          protein: 38,
        },
        midday: {
          title: "High-Calorie Tempeh & Quinoa Power Bowl",
          desc: "200g roasted tempeh, 1.5 cups cooked quinoa, roasted sweet potatoes, edamame, drizzled with creamy tahini garlic dressing & hemp seeds.",
          calories: 910,
          protein: 48,
        },
        shake: {
          title: "Mass Awakener Smoothie (Snack)",
          desc: "Oat milk, 2 scoops vegan pea/rice protein, 2 tbsp natural peanut butter, 1 large banana, 1/2 cup rolled oats, 1 tbsp flaxseed.",
          calories: 760,
          protein: 44,
        },
        evening: {
          title: "Nutrient-Dense Lentil & Seitan Feast",
          desc: "Hearty brown lentil curry with grilled seitan strips, 2 cups jasmine rice, steamed broccoli with olive oil, and roasted pumpkin seeds.",
          calories: 880,
          protein: 52,
        },
      };
    } else if (diet === "vegetarian") {
      meals = {
        morning: {
          title: "High-Protein Vegetarian Breakfast Bowl",
          desc: "4 whole eggs (or paneer bhurji), 2 slices sprouted grain toast with grass-fed butter, and oatmeal topped with peanut butter, banana & raw honey.",
          calories: 840,
          protein: 45,
        },
        midday: {
          title: "Paneer & Chickpea Mass Bowl",
          desc: "200g spiced grilled paneer, 1.5 cups brown rice, spiced chickpeas, avocado slices, and Greek yogurt cucumber raita.",
          calories: 940,
          protein: 50,
        },
        shake: {
          title: "Hunter Titan Gainer Shake (Snack)",
          desc: "Whole milk, 2 scoops whey protein, 2 tbsp peanut butter, 1 banana, 1/2 cup oats, 1 tbsp honey blended smooth.",
          calories: 780,
          protein: 52,
        },
        evening: {
          title: "Rich Dal Makhani & Cottage Cheese Plate",
          desc: "Slow-cooked black lentil dal with butter, paneer cubes, 3 whole-wheat rotis or 2 cups rice, mixed green salad with olive oil.",
          calories: 890,
          protein: 46,
        },
      };
    } else {
      meals = {
        morning: {
          title: "4-Egg Hunter Power Breakfast",
          desc: "4 whole eggs scrambled in butter with cheddar cheese, 2 slices whole-wheat toast with avocado, and 1 large bowl of oatmeal with banana & peanut butter.",
          calories: 890,
          protein: 50,
        },
        midday: {
          title: "Double Chicken & Rice Power Bowl",
          desc: "250g grilled chicken thigh or breast, 2 cups steamed jasmine rice, roasted sweet potato wedges, and olive oil drizzle.",
          calories: 950,
          protein: 60,
        },
        shake: {
          title: "Anabolic Titan Mass Shake (Snack)",
          desc: "Whole milk, 2 scoops whey isolate, 2 tbsp peanut butter, 1 banana, 1/2 cup blended oats, 1 tbsp honey.",
          calories: 800,
          protein: 55,
        },
        evening: {
          title: "Steak or Salmon Muscle Builder Dinner",
          desc: "250g Atlantic salmon or sirloin steak, baked potato with butter & sour cream, roasted asparagus and mixed green salad.",
          calories: 910,
          protein: 58,
        },
      };
    }
  } else {
    meals = {
      morning: {
        title: "Energizing Morning Fuel",
        desc: diet === "vegan" ? "Tofu scramble with spinach + bowl of rolled oats with berries & chia seeds." : "3 whole eggs scrambled + 1 cup oatmeal with blueberries & walnuts.",
        calories: 520,
        protein: 34,
      },
      midday: {
        title: "Clean Recovery Bowl",
        desc: diet === "vegan" ? "Tempeh & black bean power bowl with quinoa, avocado & lime tahini." : "Grilled chicken or fish with 1 cup brown rice and steamed broccoli.",
        calories: 680,
        protein: 48,
      },
      shake: {
        title: "Midday Protein Refresh",
        desc: "1 scoop protein powder + almond milk + berries + ice.",
        calories: 220,
        protein: 26,
      },
      evening: {
        title: "Lean Repair Dinner",
        desc: diet === "vegan" ? "Lentil vegetable stew with sweet potato & hemp seed topping." : "Lean beef or salmon fillet with roasted vegetables and baked potato.",
        calories: 650,
        protein: 45,
      },
    };
  }

  const weightGainTips = isUnderweight
    ? [
        `Target +${weightDifference > 0 ? weightDifference : 5} kg to reach your ideal minimum body weight (${minIdealWeight} kg for ${height} cm).`,
        "Liquid Calories: Drink your Mass Shake between meals so you do not feel too full to finish breakfast and dinner.",
        "Rest Periods: Rest 90-120 seconds between heavy compound sets to lift heavier weights and maximize hypertrophy.",
        `Calorie Density: Add healthy fats (olive oil, peanut butter, avocado, nuts) to every meal to easily reach your ${caloricTarget} kcal target.`,
        "Sleep for Anabolism: 8 hours of sleep is required — growth hormone peaks during deep sleep to build muscle tissue.",
      ]
    : [
        "Maintain progressive overload by increasing weight or reps each week.",
        "Hydrate with at least 3 liters of water daily to support nutrient absorption.",
        "Keep post-workout protein intake within 2 hours of completing your session.",
      ];

  const protocolTitle = isUnderweight
    ? "Hypertrophic Mass Awakening"
    : goal === "build"
    ? "Hypertrophy & Strength Protocol"
    : goal === "cut"
    ? "Metabolic Shred Protocol"
    : "Recomposition & Power Split";

  const protocolTag = isUnderweight ? "Underweight // Mass Protocol Active" : "Calibrated Protocol";
  const protocolSummary = isUnderweight
    ? `Your current weight (${weight} kg) is below the optimal threshold for your height (${height} cm) and age (${age}). The system has activated a targeted +${surplusOrDeficit} kcal hyper-surplus and heavy compound resistance split to safely forge lean muscle mass.`
    : `A balanced protocol tailored to your ${age}-year-old frame and ${goal} goal.`;

  return {
    status,
    statusLabel: isUnderweight ? "Underweight (Mass Gain Required)" : status === "optimal" ? "Optimal Mass Range" : "Above Average Mass",
    isUnderweight,
    minIdealWeight,
    maxIdealWeight,
    weightDifference,
    caloricTarget,
    calorieSurplusOrDeficit: surplusOrDeficit,
    proteinGrams,
    carbsGrams,
    fatsGrams,
    protocolTitle,
    protocolTag,
    protocolSummary,
    ageInsight,
    exercises,
    meals,
    weightGainTips,
  };
}
