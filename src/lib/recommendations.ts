import type { FitnessProfile } from "./profile";
import { type PeriodCycleInfo, getPeriodCycleInfo, getPeriodExercises, getPeriodMeals } from "./period-cycle";

export type WeightStatus = "underweight" | "optimal" | "overweight" | "heavy";

export interface IllnessProtocolInfo {
  id: "diabetes_type_1" | "diabetes_type_2" | "thyroid" | "amenorrhea";
  name: string;
  badge: string;
  summary: string;
  exerciseRationale: string;
  dietRationale: string;
  clinicalGuidelines: string[];
}

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
  illnessProtocol?: IllnessProtocolInfo | null;
  periodCycleInfo?: PeriodCycleInfo | null;
}

export function getIllnessProtocol(profile: FitnessProfile): IllnessProtocolInfo | null {
  if (!profile.hasChronicIllness || !profile.chronicIllness || profile.chronicIllness === "none") {
    return null;
  }

  switch (profile.chronicIllness) {
    case "diabetes_type_1":
      return {
        id: "diabetes_type_1",
        name: "Type 1 Diabetes Mellitus",
        badge: "Clinical Protocol // Type 1 Diabetes",
        summary: "Calibrated for insulin dependency. Focuses on steady GLUT-4 muscle glucose uptake, preventing exercise-induced hypoglycemia, and keeping carbohydrate digestion predictable.",
        exerciseRationale: "Resistance training stimulates GLUT-4 glucose transporter translocation directly to the skeletal muscle cell surface via mechanical contractions, completely independent of insulin. Standardized 90–120s rest intervals prevent erratic adrenaline spikes that cause unpredictable blood glucose volatility. Exhaustive anaerobic burnout is avoided to protect against severe nocturnal hypoglycemia.",
        dietRationale: "Macronutrients are calibrated around low-glycemic-index (GI) complex carbohydrates and high soluble fiber to slow gastric emptying and prevent postprandial glucose spikes. Consistent carbohydrate-to-protein distributions across meals allow predictable basal-bolus insulin dosing. Pre-workout complex carbs and mandatory intra-workout rapid glucose readiness prevent dangerous hypoglycemic drops.",
        clinicalGuidelines: [
          "Mandatory pre-workout blood glucose check (target: 100–180 mg/dL before lifting)",
          "Keep 15–20g fast-acting carbohydrates (glucose tablets/fruit juice) accessible during workouts",
          "Avoid training at the peak action window of rapid-acting bolus insulin",
          "Standardized 90–120 second rests between sets to prevent erratic stress-hormone glucose spikes",
          "Pair every carbohydrate serving with fiber and protein to slow gastric absorption",
        ],
      };
    case "diabetes_type_2":
      return {
        id: "diabetes_type_2",
        name: "Type 2 Diabetes Mellitus",
        badge: "Clinical Protocol // Type 2 Diabetes",
        summary: "Engineered to reverse peripheral insulin resistance. Maximizes glycogen clearance in large muscle groups, enhances mitochondrial sensitivity, and blunts glycemic spikes.",
        exerciseRationale: "High-volume compound movements in major muscle groups (quads, glutes, lats) deplete intramyocellular glycogen reservoirs. As muscles rebuild these stores, insulin receptor sensitivity remains elevated for up to 48 hours post-workout. Combining resistance training with a 10–15 minute post-workout or post-meal brisk walk rapidly clears circulating glucose without demanding excess pancreatic insulin.",
        dietRationale: "High-viscous-fiber and moderate-carbohydrate matrix eliminating simple sugars and high-glycemic starches. Incorporates anti-hyperglycemic nutrients (fenugreek/methi, cinnamon, bitter gourd, and chromium-dense greens) that stimulate GLP-1 secretion and slow alpha-glucosidase activity, eliminating sharp postprandial glucose and insulin surges.",
        clinicalGuidelines: [
          "Perform 10–15 minutes of light brisk walking immediately following heavy meals or workouts",
          "Focus on high-volume compound lifts (quads & back) to deplete muscular glycogen reservoirs",
          "Eliminate refined flours, high-fructose syrups, and processed sugars entirely",
          "Consume 35g+ dietary fiber daily with soluble beta-glucans, flaxseed, and sprouted legumes",
          "Incorporate anti-glycemic spices: 1/2 tsp Ceylon cinnamon and soaked fenugreek seeds daily",
        ],
      };
    case "thyroid":
      return {
        id: "thyroid",
        name: "Thyroid Disorder (Hypo/Metabolic Support)",
        badge: "Clinical Protocol // Thyroid Support",
        summary: "Designed for metabolic sluggishness and adrenal preservation. Avoids cortisol-elevating exhaustion while stimulating basal metabolic rate and cellular T4-to-T3 conversion.",
        exerciseRationale: "Excessive high-intensity cardio and exhaustive training spike circulating cortisol, which directly inhibits the peripheral 5'-deiodinase enzyme required to convert inactive thyroxine (T4) into active triiodothyronine (T3). This protocol utilizes low-impact, joint-friendly compound resistance training with controlled 3-second eccentrics to stimulate muscle protein synthesis and boost resting metabolic rate (BMR) without inducing adrenal exhaustion or joint inflammation.",
        dietRationale: "Supplies critical trace minerals and micronutrients essential for thyroid hormone production: Selenium (antioxidant defense for thyroid peroxidase), Iodine (backbone of T3/T4 molecules), Zinc, and L-Tyrosine. Eliminates harsh caloric starvation deficits (which can depress thyroid output by 25%) and ensures cruciferous vegetables are cooked to deactivate goitrogens.",
        clinicalGuidelines: [
          "Avoid chronic exhaustive HIIT: limit intense work to keep cortisol from suppressing T3 conversion",
          "Ensure all cruciferous vegetables (broccoli, cabbage, cauliflower) are steamed or cooked, not raw",
          "Incorporate selenium-rich foods (Brazil nuts, eggs, sunflower seeds) and zinc (pumpkin seeds, lentils)",
          "Avoid extreme low-calorie crash diets; maintain caloric adequacy to prevent metabolic adaptation",
          "Take thyroid medication (if prescribed) on an empty stomach at least 45 minutes before meals",
        ],
      };
    case "amenorrhea":
      return {
        id: "amenorrhea",
        name: "Hypothalamic Amenorrhea (Hormonal Restoration)",
        badge: "Clinical Protocol // Hormonal Recovery",
        summary: "Calibrated for Low Energy Availability (LEA) recovery and neuroendocrine restoration. Replaces exhaustive cardio with restorative strength loading to rebuild bone density and restart menstrual pulsatility.",
        exerciseRationale: "Hypothalamic amenorrhea is driven by an energy deficit where energy expenditure outpaces dietary intake, causing the brain to halt GnRH pulsatility (suppressing LH, FSH, estrogen, and progesterone). Prolonged cardio and intense HIIT are strictly eliminated to lower systemic cortisol and sympathetic stress. Low-volume, moderate-load resistance training is prioritized solely to stimulate osteoblasts and protect bone mineral density (preventing osteopenia) while keeping sessions under 40 minutes to conserve metabolic energy for hormonal recovery.",
        dietRationale: "Enforces a mandatory caloric surplus (+300–450 kcal) to signal energetic abundance to the hypothalamus and kisspeptin neurons. Dietary fat is elevated to 30–35%+ of total daily energy because all steroid hormones (estrogen, progesterone) are chemically synthesized from cholesterol and dietary lipids. Carbohydrates are kept abundant to replenish liver glycogen stores, which is the primary metabolic signal triggering resumption of ovulation.",
        clinicalGuidelines: [
          "Strictly eliminate endurance running, prolonged cardio, and exhaustive HIIT sessions",
          "Cap resistance workouts at 35–45 minutes with generous rest between sets",
          "Consume a minimum of 30–35% of daily calories from healthy fats (ghee, avocado, nuts, whole eggs)",
          "Maintain consistent carbohydrate intake (minimum 3–4g/kg) to signal energy abundance to the brain",
          "Prioritize 8–9 hours of sleep nightly to lower sympathetic nervous system tone and cortisol",
        ],
      };
    default:
      return null;
  }
}

export function getHunterRecommendations(profile: FitnessProfile): HunterRecommendation {
  const { age, height, weight, activity, diet, goal } = profile;
  const illnessProtocol = getIllnessProtocol(profile);

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
  } else if (illnessProtocol?.id === "amenorrhea") {
    // Amenorrhea requires guaranteed energy availability (+380 kcal) to restart hypothalamic GnRH pulsatility
    surplusOrDeficit = Math.max(380, goal === "cut" ? 250 : 380);
  } else if (illnessProtocol?.id === "thyroid" && goal === "cut") {
    // Avoid deep deficits in thyroid condition to prevent T3 down-regulation
    surplusOrDeficit = -250;
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
  const fatMultiplier = illnessProtocol?.id === "amenorrhea" ? 0.35 : 0.28;
  const fatCalories = caloricTarget * fatMultiplier;
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

  // Focused Workout Plan dynamically adapted to Activity Level (low: 1-2 days, moderate: 3-4 days, high: 5-6 days)
  let exercises: HunterRecommendation["exercises"] = [];

  if (isUnderweight || goal === "build") {
    if (activity === "low") {
      // 1-2 Days: High-Efficiency Full Body Mass Compounds
      exercises = [
        {
          day: "Day 01",
          focus: "Full Body Heavy Mass (Compound A)",
          lifts: [
            { name: "Barbell Back Squats", setsReps: "4 sets × 6–8 reps", note: "Greatest anabolic hormone stimulus & quad power" },
            { name: "Barbell Bench Press", setsReps: "4 sets × 6–8 reps", note: "Heavy horizontal push for chest mass" },
            { name: "Chest-Supported T-Bar Row", setsReps: "4 sets × 8 reps", note: "Mid-back & lat thickness" },
            { name: "Overhead Dumbbell Press", setsReps: "3 sets × 8–10 reps", note: "Shoulder mass builder" },
            { name: "Incline Dumbbell Bicep Curls", setsReps: "3 sets × 10–12 reps", note: "Full bicep stretch & arm thickness" },
            { name: "Standing Calf Raises", setsReps: "4 sets × 12–15 reps", note: "Controlled pause at top" },
          ],
        },
        {
          day: "Day 02",
          focus: "Full Body Heavy Mass (Compound B)",
          lifts: [
            { name: "Barbell Deadlift / Rack Pull", setsReps: "4 sets × 5 reps", note: "Full-body mass primer & posterior chain" },
            { name: "Incline Dumbbell Press", setsReps: "4 sets × 8–10 reps", note: "Upper chest thickness & clavicular head" },
            { name: "Weighted / Assisted Pull-Ups", setsReps: "4 sets × 6–8 reps", note: "V-taper lat width & vertical pull" },
            { name: "Bulgarian Split Squats", setsReps: "3 sets × 10 reps/leg", note: "Unilateral quad & glute hypertrophy" },
            { name: "Tricep Dips or Pushdowns", setsReps: "3 sets × 10–12 reps", note: "Arm density finisher" },
            { name: "Hanging Knee / Leg Raises", setsReps: "3 sets × 12–15 reps", note: "Core brace & abdominal stability" },
          ],
        },
      ];
    } else if (activity === "high") {
      // 5-6 Days: High-Frequency Athlete Mass Specialization
      exercises = [
        {
          day: "Day 01",
          focus: "Push Power (Chest & Anterior Delts Mass)",
          lifts: [
            { name: "Barbell Bench Press", setsReps: "4 sets × 6–8 reps", note: "Heavy power compound, 2 min rest" },
            { name: "Incline Dumbbell Press", setsReps: "4 sets × 8–10 reps", note: "Upper chest thickness" },
            { name: "Standing Overhead Barbell Press", setsReps: "3 sets × 8–10 reps", note: "Compound shoulder mass builder" },
            { name: "Cable Chest Flyes", setsReps: "3 sets × 12 reps", note: "Full pec stretch & pump finisher" },
            { name: "Overhead Tricep Extensions", setsReps: "3 sets × 10–12 reps", note: "Tricep long-head mass" },
          ],
        },
        {
          day: "Day 02",
          focus: "Pull Power (Back Density & Biceps)",
          lifts: [
            { name: "Barbell Deadlift / Rack Pull", setsReps: "4 sets × 5 reps", note: "Full-body mass primer & back density" },
            { name: "Weighted / Assisted Pull-Ups", setsReps: "4 sets × 6–8 reps", note: "V-taper width & lat flare" },
            { name: "Chest-Supported T-Bar Row", setsReps: "4 sets × 8 reps", note: "Mid-back thickness & rhomboids" },
            { name: "Face Pulls", setsReps: "3 sets × 12–15 reps", note: "Rear delt health & posture" },
            { name: "Barbell Bicep Curls", setsReps: "3 sets × 8–10 reps", note: "Strict tempo mass builder" },
          ],
        },
        {
          day: "Day 03",
          focus: "Leg Foundation (Quad & Glute Power)",
          lifts: [
            { name: "Barbell Back Squats", setsReps: "4 sets × 6–8 reps", note: "Greatest anabolic hormone stimulus" },
            { name: "Leg Press", setsReps: "3 sets × 10–12 reps", note: "High mechanical tension quad volume" },
            { name: "Walking Dumbbell Lunges", setsReps: "3 sets × 10 steps/leg", note: "Unilateral quad & glute drive" },
            { name: "Standing Calf Raises", setsReps: "4 sets × 12–15 reps", note: "Controlled stretch at bottom" },
            { name: "Hanging Leg Raises", setsReps: "3 sets × 15 reps", note: "Core stability & abdominal thickness" },
          ],
        },
        {
          day: "Day 04",
          focus: "Hypertrophy Push (Shoulders & Upper Chest)",
          lifts: [
            { name: "Incline Barbell Bench Press", setsReps: "4 sets × 8–10 reps", note: "Clavicular head fiber activation" },
            { name: "Dumbbell Incline Fly-to-Press", setsReps: "3 sets × 8–10 reps", note: "Deep hypertrophy stretch" },
            { name: "Lateral Dumbbell Raises", setsReps: "4 sets × 12–15 reps", note: "Side delt cap growth & width" },
            { name: "Tricep Dips or Pushdowns", setsReps: "4 sets × 10–12 reps", note: "Arm density finisher" },
          ],
        },
        {
          day: "Day 05",
          focus: "Hypertrophy Pull (Lats & Posterior Chain)",
          lifts: [
            { name: "Romanian Deadlift (RDL)", setsReps: "4 sets × 8–10 reps", note: "Hamstrings & posterior chain" },
            { name: "Close-Grip Lat Pulldown", setsReps: "4 sets × 10 reps", note: "Squeeze for 1 sec at contraction" },
            { name: "Seated Cable Row", setsReps: "3 sets × 10–12 reps", note: "Mid-back thickness" },
            { name: "Incline Dumbbell Bicep Curls", setsReps: "3 sets × 10–12 reps", note: "Full bicep stretch" },
          ],
        },
        {
          day: "Day 06",
          focus: "Legs & Arm Specialization (Athlete Hypertrophy)",
          lifts: [
            { name: "Bulgarian Split Squats", setsReps: "3 sets × 10 reps/leg", note: "Single leg hypertrophy & balance" },
            { name: "Lying or Seated Leg Curls", setsReps: "3 sets × 12 reps", note: "Hamstring isolation" },
            { name: "EZ-Bar Skullcrushers & Curls", setsReps: "4 supersets × 12 reps", note: "Arm mass pump & vascularity" },
            { name: "Standing Calf Raises & Shrugs", setsReps: "4 sets × 15 reps", note: "Lower leg & upper trap density" },
          ],
        },
      ];
    } else {
      // 3-4 Days (Moderate Active Split)
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
    }
  } else if (goal === "cut") {
    if (activity === "low") {
      exercises = [
        {
          day: "Day 01",
          focus: "Full Body Strength Preservation A",
          lifts: [
            { name: "Barbell Bench Press", setsReps: "4 sets × 8 reps", note: "Retain upper body strength" },
            { name: "Barbell Squats", setsReps: "4 sets × 8 reps", note: "Compound leg power" },
            { name: "Lat Pulldowns", setsReps: "4 sets × 10 reps", note: "Strict back recruitment" },
            { name: "Overhead Press", setsReps: "3 sets × 10 reps", note: "Core & shoulder strength" },
            { name: "Hanging Leg Raises", setsReps: "3 sets × 15 reps", note: "Abdominal definition" },
          ],
        },
        {
          day: "Day 02",
          focus: "Full Body Strength Preservation B",
          lifts: [
            { name: "Barbell Deadlift", setsReps: "3 sets × 6 reps", note: "Posterior chain density" },
            { name: "Incline Dumbbell Press", setsReps: "3 sets × 10 reps", note: "Upper chest preservation" },
            { name: "Walking Dumbbell Lunges", setsReps: "3 sets × 12 steps", note: "Calorie burner & leg tone" },
            { name: "Dumbbell Rows", setsReps: "3 sets × 10 reps", note: "Mid-back strength" },
            { name: "Zone 2 Incline Walk", setsReps: "20 mins", note: "Fat oxidation finisher" },
          ],
        },
      ];
    } else if (activity === "high") {
      exercises = [
        {
          day: "Day 01",
          focus: "Upper Body Strength Cut",
          lifts: [
            { name: "Barbell Bench Press", setsReps: "4 sets × 8 reps", note: "Retain chest strength" },
            { name: "Lat Pulldowns", setsReps: "4 sets × 10 reps", note: "Strict tempo" },
            { name: "Overhead Press", setsReps: "3 sets × 10 reps", note: "Core braced" },
            { name: "Tricep Pushdowns", setsReps: "3 sets × 12 reps", note: "Arm definition" },
          ],
        },
        {
          day: "Day 02",
          focus: "Lower Body & Posterior Engine",
          lifts: [
            { name: "Barbell Squats", setsReps: "4 sets × 8 reps", note: "Compound power" },
            { name: "Walking Dumbbell Lunges", setsReps: "3 sets × 12 steps", note: "Calorie burner" },
            { name: "Leg Curls", setsReps: "3 sets × 12 reps", note: "Controlled negative" },
            { name: "Calf Raises", setsReps: "4 sets × 15 reps", note: "Strict tempo" },
          ],
        },
        {
          day: "Day 03",
          focus: "Metabolic Pull & Zone 2",
          lifts: [
            { name: "Incline Treadmill Walk", setsReps: "30 mins", note: "Zone 2 heart rate" },
            { name: "Dumbbell Rows", setsReps: "4 sets × 10 reps", note: "Back density" },
            { name: "Hanging Leg Raises", setsReps: "4 sets × 15 reps", note: "Core stability" },
          ],
        },
        {
          day: "Day 04",
          focus: "Push Hypertrophy & Calorie Burner",
          lifts: [
            { name: "Incline Dumbbell Press", setsReps: "4 sets × 10 reps", note: "Upper chest focus" },
            { name: "Lateral Raises", setsReps: "4 sets × 15 reps", note: "Deltoid caps" },
            { name: "Dips / Push-ups", setsReps: "3 sets × 15 reps", note: "High intensity burn" },
          ],
        },
        {
          day: "Day 05",
          focus: "Posterior Chain & Core Sculpt",
          lifts: [
            { name: "Romanian Deadlifts (RDL)", setsReps: "4 sets × 10 reps", note: "Hamstring stretch" },
            { name: "Pull-ups or Cable Pulldowns", setsReps: "3 sets × 10 reps", note: "Lat width" },
            { name: "Plank & Core Circuit", setsReps: "3 rounds × 60s", note: "Core brace" },
          ],
        },
        {
          day: "Day 06",
          focus: "Full Body Functional Athlete Conditioning",
          lifts: [
            { name: "Kettlebell Swings", setsReps: "4 sets × 15 reps", note: "Explosive hip drive" },
            { name: "Dumbbell Thrusters", setsReps: "3 sets × 10 reps", note: "Metabolic conditioning" },
            { name: "Burpees or Battle Ropes", setsReps: "3 rounds × 45s", note: "Anaerobic capacity" },
          ],
        },
      ];
    } else {
      // 3-4 Days Cut
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
    }
  } else {
    // Recomp / Default Track
    if (activity === "low") {
      exercises = [
        {
          day: "Day 01",
          focus: "Full Body Power & Hypertrophy A",
          lifts: [
            { name: "Barbell Squats", setsReps: "4 sets × 8 reps", note: "Solid depth & quad power" },
            { name: "Barbell Bench Press", setsReps: "4 sets × 8 reps", note: "Progressive overload" },
            { name: "Bent Over Rows", setsReps: "4 sets × 8 reps", note: "Full back tension" },
            { name: "Dumbbell Shoulder Press", setsReps: "3 sets × 10 reps", note: "Shoulder strength" },
            { name: "Plank & Core Circuit", setsReps: "3 rounds × 60s", note: "Abdominal brace" },
          ],
        },
        {
          day: "Day 02",
          focus: "Full Body Power & Hypertrophy B",
          lifts: [
            { name: "Romanian Deadlifts (RDL)", setsReps: "4 sets × 8–10 reps", note: "Posterior chain" },
            { name: "Dumbbell Incline Press", setsReps: "3 sets × 10 reps", note: "Upper chest volume" },
            { name: "Pull-ups / Pulldown", setsReps: "4 sets × 8–10 reps", note: "Back volume" },
            { name: "Leg Press", setsReps: "3 sets × 12 reps", note: "Quad pump" },
            { name: "Bicep & Tricep Superset", setsReps: "3 supersets × 12 reps", note: "Arm density" },
          ],
        },
      ];
    } else if (activity === "high") {
      exercises = [
        {
          day: "Day 01",
          focus: "Push Strength & Hypertrophy",
          lifts: [
            { name: "Barbell Bench Press", setsReps: "4 sets × 8 reps", note: "Progressive overload" },
            { name: "Incline Dumbbell Press", setsReps: "3 sets × 10 reps", note: "Upper chest focus" },
            { name: "Dumbbell Shoulder Press", setsReps: "3 sets × 10 reps", note: "Shoulder strength" },
            { name: "Tricep Pushdowns", setsReps: "3 sets × 12 reps", note: "Tricep burn" },
          ],
        },
        {
          day: "Day 02",
          focus: "Pull Strength & Lat Width",
          lifts: [
            { name: "Bent Over Rows", setsReps: "4 sets × 8 reps", note: "Full back tension" },
            { name: "Pull-ups / Pulldown", setsReps: "4 sets × 10 reps", note: "Back volume" },
            { name: "Face Pulls", setsReps: "3 sets × 15 reps", note: "Rear delt posture" },
            { name: "Bicep Barbell Curls", setsReps: "3 sets × 10 reps", note: "Strict contraction" },
          ],
        },
        {
          day: "Day 03",
          focus: "Lower Body Power & Quads",
          lifts: [
            { name: "Barbell Squats", setsReps: "4 sets × 8 reps", note: "Solid depth" },
            { name: "Leg Press", setsReps: "3 sets × 12 reps", note: "Quad pump" },
            { name: "Walking Lunges", setsReps: "3 sets × 12 steps", note: "Unilateral drive" },
            { name: "Calf Raises", setsReps: "4 sets × 15 reps", note: "Peak contraction" },
          ],
        },
        {
          day: "Day 04",
          focus: "Upper Density & Delts Focus",
          lifts: [
            { name: "Standing Overhead Press", setsReps: "4 sets × 8 reps", note: "Shoulder power" },
            { name: "Lateral Dumbbell Raises", setsReps: "4 sets × 15 reps", note: "Side delt cap" },
            { name: "Chest Dips", setsReps: "3 sets × 12 reps", note: "Chest & tricep pump" },
            { name: "Hammer Curls", setsReps: "3 sets × 12 reps", note: "Forearm & brachialis" },
          ],
        },
        {
          day: "Day 05",
          focus: "Posterior Chain & Hamstrings",
          lifts: [
            { name: "Romanian Deadlifts (RDL)", setsReps: "4 sets × 10 reps", note: "Hamstring recruitment" },
            { name: "Seated Cable Row", setsReps: "4 sets × 10 reps", note: "Mid-back thickness" },
            { name: "Lying Leg Curls", setsReps: "3 sets × 12 reps", note: "Hamstring pump" },
            { name: "Hanging Leg Raises", setsReps: "3 sets × 15 reps", note: "Core stability" },
          ],
        },
        {
          day: "Day 06",
          focus: "Functional Conditioning & Agility",
          lifts: [
            { name: "Zone 2 Aerobic Base", setsReps: "30 min steady", note: "Cardiovascular health" },
            { name: "Plank & Core Circuit", setsReps: "3 rounds × 60s", note: "Abdominal brace" },
            { name: "Dumbbell Farmers Walk", setsReps: "3 sets × 40m", note: "Grip & trap strength" },
          ],
        },
      ];
    } else {
      // 3-4 Days Recomp
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
  }

  // Adapt exercise plan if a chronic illness protocol is active
  if (illnessProtocol) {
    exercises = exercises.map((day) => {
      let illnessTag = "";
      if (illnessProtocol.id === "diabetes_type_1") {
        illnessTag = " • T1D GLUT-4 Target";
      } else if (illnessProtocol.id === "diabetes_type_2") {
        illnessTag = " • T2D Glycogen Clearance";
      } else if (illnessProtocol.id === "thyroid") {
        illnessTag = " • Thyroid Tempo & BMR";
      } else if (illnessProtocol.id === "amenorrhea") {
        illnessTag = " • Bone-Loading Restorative";
      }

      return {
        ...day,
        focus: `${day.focus}${illnessTag}`,
        lifts: day.lifts.map((lift, i) => {
          if (illnessProtocol.id === "diabetes_type_1" && i === 0) {
            return {
              ...lift,
              note: `${lift.note} (Confirm pre-workout glucose 100–180 mg/dL)`,
            };
          }
          if (illnessProtocol.id === "diabetes_type_2" && i === day.lifts.length - 1) {
            return {
              ...lift,
              note: `${lift.note} + 12-min brisk post-session walk for rapid glucose uptake`,
            };
          }
          if (illnessProtocol.id === "thyroid") {
            return {
              ...lift,
              note: `${lift.note} (Controlled 3s negative; low joint impact)`,
            };
          }
          if (illnessProtocol.id === "amenorrhea") {
            return {
              ...lift,
              note: `${lift.note} (Restorative bone loading, avoid systemic failure)`,
            };
          }
          return lift;
        }),
      };
    });
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

  // Override meals if a specialized chronic condition protocol is active
  if (illnessProtocol) {
    if (illnessProtocol.id === "diabetes_type_1") {
      meals = {
        morning: {
          title: "Low-GI Glycemic Stabilizer Breakfast",
          desc: diet === "vegan"
            ? "Tofu scramble with spinach, avocado on sprouted sourdough + steel-cut oats with chia seeds, walnuts & Ceylon cinnamon."
            : "3 whole eggs scrambled with avocado on sprouted grain toast + rolled oats with blueberries, chia & Ceylon cinnamon.",
          calories: 540,
          protein: 36,
        },
        midday: {
          title: "Sustained Glucose Power Bowl",
          desc: diet === "vegan"
            ? "Sprouted brown lentils, cooked quinoa, edamame, and steamed broccoli with extra-virgin olive oil dressing."
            : "Grilled herb chicken or paneer, 1 cup brown basmati rice, steamed greens & cucumber raita.",
          calories: 680,
          protein: 48,
        },
        shake: {
          title: "Slow-Release Protein & Fiber Shake (Snack)",
          desc: "1 scoop protein powder + almond milk + 1 tbsp chia seeds + 1 tbsp almond butter + blueberries (Low-GI).",
          calories: 260,
          protein: 28,
        },
        evening: {
          title: "High-Fiber Lean Repair Plate",
          desc: diet === "vegan"
            ? "Tempeh with sauteed green beans, mushrooms, and complex wild rice with roasted sunflower seeds."
            : "Baked Atlantic salmon or paneer with asparagus, roasted sweet potato cubes & olive oil drizzle.",
          calories: 640,
          protein: 46,
        },
      };
    } else if (illnessProtocol.id === "diabetes_type_2") {
      meals = {
        morning: {
          title: "Insulin-Sensitizing Fenugreek Breakfast",
          desc: diet === "vegan"
            ? "Methi (fenugreek) sprouted moong bowl with tofu, avocado slices, and Ceylon cinnamon green tea."
            : "3 egg scramble with spinach, methi leaves, 1 slice sprouted grain bread & Ceylon cinnamon.",
          calories: 510,
          protein: 36,
        },
        midday: {
          title: "Glycemic-Blunting Sprouted Bowl",
          desc: diet === "vegan"
            ? "Sprouted kala chana & tempeh salad with cucumber, flaxseed oil, and steamed broccoli."
            : "Spiced grilled paneer or chicken, 1/2 cup cooked quinoa, large raw salad with apple cider vinaigrette.",
          calories: 650,
          protein: 50,
        },
        shake: {
          title: "Cinnamon & Viscous Fiber Refresher (Snack)",
          desc: "1 scoop whey/pea protein + unsweetened almond milk + 1 tbsp ground flaxseeds + 1/2 tsp Ceylon cinnamon.",
          calories: 230,
          protein: 27,
        },
        evening: {
          title: "Karela & Lean Protein Stir-Fry",
          desc: diet === "vegan"
            ? "Spiced bitter gourd (karela) with roasted tofu, mixed greens and 1 small millet roti."
            : "Grilled fish or paneer with sauteed bitter greens, bell peppers and small portion of roasted lentils.",
          calories: 610,
          protein: 45,
        },
      };
    } else if (illnessProtocol.id === "thyroid") {
      meals = {
        morning: {
          title: "Selenium & Zinc Fortified Breakfast",
          desc: diet === "vegan"
            ? "Sprouted moong & tofu bhurji with roasted pumpkin seeds, 2 Brazil nuts (Selenium peak) & gluten-free toast."
            : "3 whole eggs scrambled with grass-fed butter, 2 Brazil nuts (Selenium peak), pumpkin seeds & avocado toast.",
          calories: 560,
          protein: 36,
        },
        midday: {
          title: "Thyroid Metabolic Nourish Bowl",
          desc: diet === "vegan"
            ? "Thoroughly cooked steamed broccoli & carrot bowl with quinoa, roasted chickpeas & turmeric coconut dressing."
            : "Wild salmon or grilled paneer with cooked asparagus, sweet potato, and turmeric-infused dal.",
          calories: 690,
          protein: 48,
        },
        shake: {
          title: "T3/T4 Cofactor Smoothie (Snack)",
          desc: "1 scoop protein + almond milk + 1 tbsp pumpkin seeds (Zinc) + blueberries + maca root powder.",
          calories: 250,
          protein: 28,
        },
        evening: {
          title: "Anti-Inflammatory Golden Turmeric Plate",
          desc: diet === "vegan"
            ? "Hearty golden turmeric lentil stew with roasted zucchini, carrots & cooked spinach (no raw goitrogens)."
            : "Slow-cooked chicken or paneer curry with turmeric, cooked green vegetables, and brown basmati rice.",
          calories: 640,
          protein: 45,
        },
      };
    } else if (illnessProtocol.id === "amenorrhea") {
      meals = {
        morning: {
          title: "Hormone-Building Golden Fuel",
          desc: diet === "vegan"
            ? "Large oatmeal bowl cooked in coconut milk with tahini, hemp seeds, banana, dates & walnuts."
            : "3 whole eggs in grass-fed ghee, 2 slices seeded sourdough with avocado, plus oatmeal with full-fat milk & honey.",
          calories: 780,
          protein: 38,
        },
        midday: {
          title: "Energy-Availability Replenish Bowl",
          desc: diet === "vegan"
            ? "Generous quinoa & sweet potato bowl with baked tempeh, roasted pumpkin, and creamy tahini dressing."
            : "Generous portion of salmon or paneer in ghee, 1.5 cups jasmine rice, roasted sweet potato wedges & avocado.",
          calories: 890,
          protein: 52,
        },
        shake: {
          title: "Endocrine Nourishment Mass Shake (Snack)",
          desc: "Full-fat milk or coconut milk, 1.5 scoops protein, 2 tbsp almond butter, 1 banana, 2 dates & 1/2 cup oats.",
          calories: 620,
          protein: 42,
        },
        evening: {
          title: "Lipid-Dense Reproductive Repair Dinner",
          desc: diet === "vegan"
            ? "Rich coconut lentil dal with roasted walnuts, olive oil drizzled roasted roots, and 2 rotis with vegan ghee."
            : "Paneer butter masala or slow-roasted salmon, 2 whole wheat rotis brushed with ghee, and mixed roasted root vegetables.",
          calories: 840,
          protein: 48,
        },
      };
    }
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

  const splitLabel = activity === "high" ? "5–6 Days" : activity === "low" ? "1–2 Days" : "3–4 Days";

  const protocolTitle = illnessProtocol
    ? `${illnessProtocol.name} Protocol (${splitLabel})`
    : isUnderweight
    ? `Hypertrophic Mass Awakening (${splitLabel})`
    : goal === "build"
    ? `Hypertrophy & Strength Protocol (${splitLabel})`
    : goal === "cut"
    ? `Metabolic Shred Protocol (${splitLabel})`
    : `Recomposition & Power Split (${splitLabel})`;

  const protocolTag = illnessProtocol
    ? `${illnessProtocol.badge} // ${splitLabel}`
    : isUnderweight
    ? `Underweight // Mass Protocol (${splitLabel})`
    : `Calibrated Protocol // ${splitLabel}`;
  const protocolSummary = illnessProtocol
    ? `Clinical Protocol calibrated for ${illnessProtocol.name}. ${illnessProtocol.summary}`
    : isUnderweight
    ? `Your current weight (${weight} kg) is below the optimal threshold for your height (${height} cm) and age (${age}). The system has activated a targeted +${surplusOrDeficit} kcal hyper-surplus and an intensive ${splitLabel.toLowerCase()} compound resistance split to safely forge lean muscle mass.`
    : `A balanced ${splitLabel.toLowerCase()} protocol tailored to your ${age}-year-old frame and ${goal} goal.`;

  // Period Cycle Awareness — override exercises and meals if user is in menstrual phase
  const periodCycleInfo = getPeriodCycleInfo(profile);
  let finalExercises = exercises;
  let finalMeals = meals;

  if (periodCycleInfo?.isOnPeriod) {
    // Replace all scheduled exercises with gentle yoga & restorative movement
    finalExercises = getPeriodExercises(periodCycleInfo.periodDay);
    // Replace meals with iron-rich, anti-inflammatory period nutrition
    finalMeals = getPeriodMeals(diet);
  }

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
    exercises: finalExercises,
    meals: finalMeals,
    weightGainTips,
    illnessProtocol,
    periodCycleInfo,
  };
}
