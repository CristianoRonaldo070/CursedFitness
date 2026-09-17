import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Info,
  Layers,
  Leaf,
  RefreshCw,
  Salad,
  Sparkles,
  Utensils,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/brand";
import { Button } from "@/components/ui/button";
import {
  defaultProfile,
  fetchProfile,
  saveProfile,
  type FitnessProfile,
} from "@/lib/profile";
import { getHunterRecommendations } from "@/lib/recommendations";
import {
  DISH_DATABASE,
  MEAL_SLOTS,
  type DietType,
  type DishOption,
} from "@/lib/diet-database";
import { AuthGuard } from "@/components/auth-guard";

export const Route = createFileRoute("/diet")({
  head: () => ({
    meta: [
      { title: "Diet & Nutrition Matrix — CursedFitness" },
      {
        name: "description",
        content: "Customized nutrition protocols, vegetarian and vegan filters, macro tracking, and dish alternatives.",
      },
      { property: "og:title", content: "Diet & Nutrition Matrix — CursedFitness" },
      {
        property: "og:description",
        content: "Filter veg or non-veg meals, swap dishes, and track calories & protein.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthGuard moduleName="Diet & Nutrition Matrix">
      <DietPage />
    </AuthGuard>
  ),
});

export default function DietPage() {
  const [profile, setProfile] = useState<FitnessProfile>(defaultProfile);
  const [activeDietFilter, setActiveDietFilter] = useState<DietType>("all");

  // Selected dishes state per category: { breakfast: 'id', lunch: 'id', shake: 'id', dinner: 'id' }
  const [selectedDishes, setSelectedDishes] = useState<Record<string, string>>({});
  const [expandedAlternatives, setExpandedAlternatives] = useState<Record<string, boolean>>({
    breakfast: false,
    lunch: false,
    shake: false,
    dinner: false,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const p = await fetchProfile();
      if (isMounted) {
        setProfile(p);
        if (p.diet === "vegetarian") {
          setActiveDietFilter("vegetarian");
        } else if (p.diet === "vegan") {
          setActiveDietFilter("vegan");
        } else {
          setActiveDietFilter("all");
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const rec = getHunterRecommendations(profile);

  // Initialize or update default selected dishes when diet filter changes
  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const slot of MEAL_SLOTS) {
      const available = getAvailableDishesForCategory(slot.id, activeDietFilter);
      if (available.length > 0) {
        initial[slot.id] = available[0].id;
      }
    }
    setSelectedDishes(initial);
  }, [activeDietFilter]);

  function getAvailableDishesForCategory(category: string, filter: DietType): DishOption[] {
    return DISH_DATABASE.filter((dish) => {
      if (dish.category !== category) return false;
      if (filter === "vegetarian") {
        return dish.dietType === "vegetarian";
      }
      if (filter === "vegan") {
        return dish.dietType === "vegan";
      }
      return true; // 'all' shows balanced + vegetarian + vegan
    });
  }

  function handleSelectDish(category: string, dishId: string, dishName: string) {
    setSelectedDishes((prev) => ({ ...prev, [category]: dishId }));
    toast.success(`Selected "${dishName}" for ${category}!`);
  }

  function toggleAlternatives(category: string) {
    setExpandedAlternatives((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }

  async function handleSavePreference(filter: DietType) {
    setActiveDietFilter(filter);
    const updatedDiet: FitnessProfile["diet"] =
      filter === "vegetarian" ? "vegetarian" : filter === "vegan" ? "vegan" : "balanced";
    const updated = { ...profile, diet: updatedDiet };
    setProfile(updated);
    await saveProfile(updated);
    toast.success(`Diet preference updated to ${filter.toUpperCase()} in hunter profile.`);
  }

  // Calculate totals from currently selected dishes
  const selectedDishObjects = MEAL_SLOTS.map((slot) => {
    const id = selectedDishes[slot.id];
    return DISH_DATABASE.find((d) => d.id === id);
  }).filter((d): d is DishOption => Boolean(d));

  const totalCalories = selectedDishObjects.reduce((acc, d) => acc + d.calories, 0);
  const totalProtein = selectedDishObjects.reduce((acc, d) => acc + d.protein, 0);
  const totalCarbs = selectedDishObjects.reduce((acc, d) => acc + d.carbs, 0);
  const totalFats = selectedDishObjects.reduce((acc, d) => acc + d.fats, 0);

  const calorieDiff = totalCalories - rec.caloricTarget;
  const proteinDiff = totalProtein - rec.proteinGrams;

  return (
    <main className="min-h-screen pt-18 pb-20">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col gap-5 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="system-label">Nutritional Matrix // Protocol Customizer</p>
              {rec.isUnderweight && (
                <span className="border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                  Mass Surplus Active (+{rec.calorieSurplusOrDeficit} kcal)
                </span>
              )}
            </div>
            <h1 className="mt-3 text-5xl font-black uppercase md:text-7xl">
              Indian <span className="text-primary">Diet Matrix</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Authentic Indian high-protein protocols calibrated for Hunter <span className="text-foreground font-semibold">{profile.name}</span> (Age {profile.age} · {profile.weight} kg).
              Filter for pure vegetarian (paneer, dal, dahi, soya), vegan, or non-veg desi dishes with live calorie and protein tracking.
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="systemOutline" size="system">
              <Link to="/dashboard">Return to System</Link>
            </Button>
          </div>
        </div>

        {/* Dietary Preference Filter Bar */}
        <section className="mt-8 system-panel p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="system-label text-[9px]">Dietary Framework Filter</p>
              <h3 className="mt-1 font-display text-2xl font-bold uppercase text-foreground">
                Select Your Indian Diet Type
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Click &quot;Vegetarian&quot; to exclusively show veg dishes (Paneer, Dal, Soya, Chana, Dahi, Sattu).
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSavePreference("vegetarian")}
                className={`flex items-center gap-2 border px-4 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeDietFilter === "vegetarian"
                    ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_var(--system-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Leaf className="size-4 text-success" />
                Vegetarian (Desi Shakahari)
              </button>

              <button
                type="button"
                onClick={() => handleSavePreference("vegan")}
                className={`flex items-center gap-2 border px-4 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeDietFilter === "vegan"
                    ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_var(--system-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Salad className="size-4 text-primary" />
                Vegan (100% Plant Based)
              </button>

              <button
                type="button"
                onClick={() => handleSavePreference("all")}
                className={`flex items-center gap-2 border px-4 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeDietFilter === "all"
                    ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_var(--system-glow)]"
                    : "border-border bg-card text-muted-foreground hover:border-primary/50"
                }`}
              >
                <Utensils className="size-4 text-primary" />
                Non-Veg / All Desi Foods
              </button>
            </div>
          </div>
        </section>

        {/* Live Macro Summary Bar */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="system-panel p-5">
            <div className="flex items-center justify-between">
              <p className="system-label text-[9px]">Selected Daily Energy</p>
              <Flame className="size-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl font-black text-foreground">{totalCalories}</span>
              <span className="font-mono text-xs text-muted-foreground">/ {rec.caloricTarget} kcal target</span>
            </div>
            <p className="mt-1 text-[11px] font-mono text-primary">
              {calorieDiff >= 0 ? `+${calorieDiff} kcal surplus` : `${calorieDiff} kcal remaining`}
            </p>
          </div>

          <div className="system-panel p-5">
            <div className="flex items-center justify-between">
              <p className="system-label text-[9px]">Selected Daily Protein</p>
              <Zap className="size-4 text-primary" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl font-black text-foreground">{totalProtein}g</span>
              <span className="font-mono text-xs text-muted-foreground">/ {rec.proteinGrams}g target</span>
            </div>
            <p className="mt-1 text-[11px] font-mono text-success">
              {proteinDiff >= 0 ? `Target exceeded by +${proteinDiff}g!` : `${Math.abs(proteinDiff)}g to target`}
            </p>
          </div>

          <div className="system-panel p-5">
            <div className="flex items-center justify-between">
              <p className="system-label text-[9px]">Carbohydrates</p>
              <Layers className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 font-display text-4xl font-black text-foreground">{totalCarbs}g</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Complex energy & glycogen recovery</p>
          </div>

          <div className="system-panel p-5">
            <div className="flex items-center justify-between">
              <p className="system-label text-[9px]">Healthy Fats</p>
              <Sparkles className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-3 font-display text-4xl font-black text-foreground">{totalFats}g</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Essential hormone & joint support</p>
          </div>
        </section>

        {/* Meal Slots with Selected Dishes and Swappable Alternatives */}
        <section className="mt-10 space-y-8">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <p className="system-label">Daily Protocol Schedule</p>
              <h2 className="mt-1 font-display text-3xl font-bold uppercase">Meals & Alternative Dishes</h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground hidden sm:block">
              // Click &quot;Alternative Options&quot; to swap any meal
            </p>
          </div>

          {MEAL_SLOTS.map((slot) => {
            const availableDishes = getAvailableDishesForCategory(slot.id, activeDietFilter);
            const currentSelectedId = selectedDishes[slot.id];
            const currentDish =
              availableDishes.find((d) => d.id === currentSelectedId) || availableDishes[0];

            const alternatives = availableDishes.filter((d) => d.id !== currentDish?.id);
            const isExpanded = expandedAlternatives[slot.id];

            if (!currentDish) return null;

            return (
              <div key={slot.id} className="system-panel overflow-hidden border border-border p-6 md:p-8">
                {/* Slot Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-primary">{slot.time}</span>
                      <span className="text-muted-foreground">//</span>
                      <h3 className="font-display text-2xl font-black uppercase text-foreground">
                        {slot.title}
                      </h3>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{slot.subtitle}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAlternatives(slot.id)}
                    className="self-start font-mono text-xs uppercase text-primary hover:text-foreground border border-primary/30"
                  >
                    <RefreshCw className="mr-1.5 size-3.5" />
                    {alternatives.length} Alternative{alternatives.length !== 1 ? "s" : ""}
                    {isExpanded ? <ChevronUp className="ml-1 size-3.5" /> : <ChevronDown className="ml-1 size-3.5" />}
                  </Button>
                </div>

                {/* Primary Selected Dish Display */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-primary/20 border border-primary/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                        Active Selected Dish
                      </span>
                      <span className="border border-border bg-card px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {currentDish.dietType}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Prep: {currentDish.prepTime}
                      </span>
                    </div>

                    <h4 className="mt-3 font-display text-3xl font-black uppercase tracking-normal text-foreground">
                      {currentDish.name}
                    </h4>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {currentDish.description}
                    </p>

                    <div className="mt-4 border-l-2 border-primary/60 pl-3">
                      <p className="text-xs text-primary font-medium flex items-center gap-1.5">
                        <Info className="size-3.5 shrink-0" />
                        {currentDish.highlight}
                      </p>
                    </div>

                    <div className="mt-5">
                      <p className="system-label text-[8px] text-muted-foreground">Ingredients Required:</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {currentDish.ingredients.map((ing, i) => (
                          <span
                            key={i}
                            className="border border-border bg-card/80 px-2 py-1 font-mono text-[10px] text-foreground"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary Dish Macro Box */}
                  <div className="flex flex-col justify-between border border-border bg-card/60 p-6">
                    <div>
                      <p className="system-label text-[9px]">Dish Nutritional Profile</p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="border border-primary/30 bg-primary/5 p-3">
                          <span className="system-label text-[8px]">Energy</span>
                          <p className="font-display text-3xl font-black text-primary">
                            {currentDish.calories}
                            <span className="text-xs font-mono font-normal text-muted-foreground ml-1">kcal</span>
                          </p>
                        </div>

                        <div className="border border-success/30 bg-success/5 p-3">
                          <span className="system-label text-[8px] text-success">Protein</span>
                          <p className="font-display text-3xl font-black text-success">
                            {currentDish.protein}
                            <span className="text-xs font-mono font-normal text-muted-foreground ml-1">grams</span>
                          </p>
                        </div>

                        <div className="border border-border bg-card p-3">
                          <span className="system-label text-[8px]">Carbohydrates</span>
                          <p className="font-display text-2xl font-bold text-foreground">
                            {currentDish.carbs}
                            <span className="text-xs font-mono font-normal text-muted-foreground ml-1">g</span>
                          </p>
                        </div>

                        <div className="border border-border bg-card p-3">
                          <span className="system-label text-[8px]">Healthy Fats</span>
                          <p className="font-display text-2xl font-bold text-foreground">
                            {currentDish.fats}
                            <span className="text-xs font-mono font-normal text-muted-foreground ml-1">g</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                      <span className="flex items-center gap-1.5 font-mono text-xs text-success">
                        <Check className="size-4" /> Currently in Protocol
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAlternatives(slot.id)}
                        className="font-mono text-xs uppercase text-primary hover:text-foreground"
                      >
                        {isExpanded ? "Hide Alternatives" : "Browse Alternatives"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Alternatives Drawer / Accordion */}
                {isExpanded && (
                  <div className="mt-8 border-t border-border pt-6 animate-in fade-in-50 duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <p className="system-label text-[9px] text-primary">
                        Alternative Options for {slot.title} ({activeDietFilter.toUpperCase()})
                      </p>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Select any dish below to swap your meal
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {alternatives.map((alt) => (
                        <div
                          key={alt.id}
                          className="flex flex-col justify-between border border-border bg-card p-5 hover:border-primary/50 transition-colors"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="border border-border px-2 py-0.5 font-mono text-[8px] uppercase text-muted-foreground">
                                {alt.dietType}
                              </span>
                              <div className="flex gap-2 font-mono text-xs">
                                <span className="font-bold text-primary">{alt.calories} kcal</span>
                                <span className="text-muted-foreground">·</span>
                                <span className="font-bold text-success">{alt.protein}g P</span>
                              </div>
                            </div>

                            <h5 className="mt-3 font-display text-lg font-bold uppercase text-foreground leading-snug">
                              {alt.name}
                            </h5>

                            <p className="mt-2 text-xs leading-5 text-muted-foreground">
                              {alt.description}
                            </p>

                            <div className="mt-3 flex gap-3 font-mono text-[10px] text-muted-foreground border-t border-border/40 pt-2">
                              <span>Carbs: {alt.carbs}g</span>
                              <span>Fats: {alt.fats}g</span>
                              <span>Prep: {alt.prepTime}</span>
                            </div>
                          </div>

                          <Button
                            onClick={() => handleSelectDish(slot.id, alt.id, alt.name)}
                            variant="systemOutline"
                            size="sm"
                            className="mt-5 w-full font-mono text-xs uppercase"
                          >
                            Swap to this Dish <ArrowRight className="ml-1.5 size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Combined Daily Grocery & Preparation Blueprint */}
        <section className="mt-10 system-panel p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4">
            <div>
              <p className="system-label">Automated Logistics</p>
              <h3 className="mt-1 font-display text-2xl font-bold uppercase">
                Daily Grocery Blueprint for Selected Dishes
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                All raw ingredients needed to fuel today&apos;s protocol based on your dish selections.
              </p>
            </div>
            <div className="mt-4 md:mt-0 font-mono text-xs text-primary">
              // Total Selected: {totalCalories} kcal · {totalProtein}g Protein
            </div>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {selectedDishObjects.flatMap((d) => d.ingredients).map((ing, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 border border-border bg-card p-2.5 text-xs text-foreground"
              >
                <Check className="size-3.5 text-primary shrink-0" />
                <span>{ing}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
