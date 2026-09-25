import rankE from "@/assets/ranks/rank-e.png";
import rankD from "@/assets/ranks/rank-d.png";
import rankC from "@/assets/ranks/rank-c.png";
import rankB from "@/assets/ranks/rank-b.png";
import rankA from "@/assets/ranks/rank-a.png";
import rankS from "@/assets/ranks/rank-s.png";

export type RankTier = "E" | "D" | "C" | "B" | "A" | "S";

export interface RankMetadata {
  tier: RankTier;
  title: string;
  image: string;
  minXp: number;
  color: string;
  glowColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  unlocks: string[];
}

export const RANK_ORDER: RankTier[] = ["E", "D", "C", "B", "A", "S"];

export const RANKS_DATA: Record<RankTier, RankMetadata> = {
  E: {
    tier: "E",
    title: "Initiate",
    image: rankE,
    minXp: 0,
    color: "#d4b38a",
    glowColor: "rgba(212, 179, 138, 0.45)",
    borderColor: "border-[#d4b38a]/60",
    textColor: "text-[#d4b38a]",
    description: "The physical awakening has begun. Establishing neuromuscular conditioning and baseline strength.",
    unlocks: [
      "Daily protocol calibration",
      "Foundation hypertrophy split",
      "Morning warm-up gate",
    ],
  },
  D: {
    tier: "D",
    title: "Awakened",
    image: rankD,
    minXp: 1000,
    color: "#67b8e3",
    glowColor: "rgba(103, 184, 227, 0.55)",
    borderColor: "border-[#67b8e3]/60",
    textColor: "text-[#67b8e3]",
    description: "Neural link strengthened. Conditioning breaks through previous biological limitations.",
    unlocks: [
      "Compound movement acceleration",
      "Protein synthesis optimization",
      "Awakened quest rewards (+20% XP)",
    ],
  },
  C: {
    tier: "C",
    title: "Vanguard",
    image: rankC,
    minXp: 2000,
    color: "#f47289",
    glowColor: "rgba(244, 114, 137, 0.55)",
    borderColor: "border-[#f47289]/60",
    textColor: "text-[#f47289]",
    description: "Frontline warrior status. High mechanical tension & muscular density protocols engaged.",
    unlocks: [
      "Hypertrophy overload multipliers",
      "Metabolic conditioning protocols",
      "Advanced exercise variations",
    ],
  },
  B: {
    tier: "B",
    title: "Titan",
    image: rankB,
    minXp: 3500,
    color: "#72c49b",
    glowColor: "rgba(114, 196, 155, 0.55)",
    borderColor: "border-[#72c49b]/60",
    textColor: "text-[#72c49b]",
    description: "Unstoppable force unlocked. Structural power and heavy compound lifting capacity fully awakened.",
    unlocks: [
      "Anabolic recovery enhancement",
      "Heavy PR conquest protocol",
      "Titan endurance matrix",
    ],
  },
  A: {
    tier: "A",
    title: "Apex",
    image: rankA,
    minXp: 5000,
    color: "#b983e8",
    glowColor: "rgba(185, 131, 232, 0.6)",
    borderColor: "border-[#b983e8]/60",
    textColor: "text-[#b983e8]",
    description: "Near the absolute summit of physical ascension. Master-class biological precision and speed.",
    unlocks: [
      "Instantaneous neural muscle recruitment",
      "Max velocity power output",
      "Apex hunter aura & priority access",
    ],
  },
  S: {
    tier: "S",
    title: "Sovereign",
    image: rankS,
    minXp: 7500,
    color: "#f6c343",
    glowColor: "rgba(246, 195, 67, 0.75)",
    borderColor: "border-[#f6c343]/70",
    textColor: "text-[#f6c343]",
    description: "Absolute Monarch. Transcended human biological boundaries into limitless power.",
    unlocks: [
      "Legendary Sovereign crown prestige",
      "Peak biological optimization",
      "Infinite Ascension protocol",
    ],
  },
};

export interface RankInfo {
  tier: RankTier;
  title: string;
  image: string;
  minXp: number;
  nextTier: RankTier | "MAX";
  nextTitle: string;
  targetTierXp: number;
  currentTierXp: number;
  tierProgressPercent: number;
  color: string;
  glowColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  unlocks: string[];
}

export function getRankInfo(xp: number): RankInfo {
  const safeXp = Math.max(0, xp || 0);

  if (safeXp >= 7500) {
    const meta = RANKS_DATA.S;
    return {
      ...meta,
      nextTier: "MAX",
      nextTitle: "Ascended",
      targetTierXp: 2500,
      currentTierXp: safeXp - 7500,
      tierProgressPercent: 100,
    };
  }

  if (safeXp >= 5000) {
    const meta = RANKS_DATA.A;
    const currentTierXp = safeXp - 5000;
    const targetTierXp = 2500;
    return {
      ...meta,
      nextTier: "S",
      nextTitle: RANKS_DATA.S.title,
      targetTierXp,
      currentTierXp,
      tierProgressPercent: Math.min(100, Math.round((currentTierXp / targetTierXp) * 100)),
    };
  }

  if (safeXp >= 3500) {
    const meta = RANKS_DATA.B;
    const currentTierXp = safeXp - 3500;
    const targetTierXp = 1500;
    return {
      ...meta,
      nextTier: "A",
      nextTitle: RANKS_DATA.A.title,
      targetTierXp,
      currentTierXp,
      tierProgressPercent: Math.min(100, Math.round((currentTierXp / targetTierXp) * 100)),
    };
  }

  if (safeXp >= 2000) {
    const meta = RANKS_DATA.C;
    const currentTierXp = safeXp - 2000;
    const targetTierXp = 1500;
    return {
      ...meta,
      nextTier: "B",
      nextTitle: RANKS_DATA.B.title,
      targetTierXp,
      currentTierXp,
      tierProgressPercent: Math.min(100, Math.round((currentTierXp / targetTierXp) * 100)),
    };
  }

  if (safeXp >= 1000) {
    const meta = RANKS_DATA.D;
    const currentTierXp = safeXp - 1000;
    const targetTierXp = 1000;
    return {
      ...meta,
      nextTier: "C",
      nextTitle: RANKS_DATA.C.title,
      targetTierXp,
      currentTierXp,
      tierProgressPercent: Math.min(100, Math.round((currentTierXp / targetTierXp) * 100)),
    };
  }

  const meta = RANKS_DATA.E;
  const currentTierXp = safeXp;
  const targetTierXp = 1000;
  return {
    ...meta,
    nextTier: "D",
    nextTitle: RANKS_DATA.D.title,
    targetTierXp,
    currentTierXp,
    tierProgressPercent: Math.min(100, Math.round((currentTierXp / targetTierXp) * 100)),
  };
}

export function isHigherRank(newTier: RankTier, oldTier: RankTier): boolean {
  return RANK_ORDER.indexOf(newTier) > RANK_ORDER.indexOf(oldTier);
}

const LAST_RANK_STORAGE_KEY = "cursed_last_hunter_rank";

export function getStoredHunterRank(): RankTier | null {
  if (typeof window === "undefined") return null;
  try {
    const val = window.localStorage.getItem(LAST_RANK_STORAGE_KEY) as RankTier | null;
    if (val && RANK_ORDER.includes(val)) return val;
  } catch {
    // fallback
  }
  return null;
}

export function saveStoredHunterRank(rank: RankTier): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_RANK_STORAGE_KEY, rank);
  } catch {
    // fallback
  }
}
