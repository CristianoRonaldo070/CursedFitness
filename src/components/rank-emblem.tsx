import React, { useState, useEffect } from "react";
import { Sparkles, Trophy, ArrowRight, ShieldCheck, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type RankTier,
  type RankInfo,
  RANKS_DATA,
  RANK_ORDER,
  getRankInfo,
  isHigherRank,
  getStoredHunterRank,
  saveStoredHunterRank,
} from "@/lib/ranks";

// Audio synthesized celebratory sound using Web Audio API (100% self-contained, no external files)
function playRankUpFanfare() {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5]; // C, E, G, C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === notes.length - 1 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.1 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.65);
    });
  } catch {
    // Audio context may be restricted by browser policy before user interaction
  }
}

interface RankEmblemProps {
  rank: RankTier;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  showTitle?: boolean;
  withGlow?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

const sizeClasses: Record<string, string> = {
  xs: "size-6",
  sm: "size-8",
  md: "size-12",
  lg: "size-20",
  xl: "size-28 md:size-32",
  hero: "size-36 md:size-48",
};

export function RankEmblem({
  rank,
  size = "md",
  className = "",
  showTitle = false,
  withGlow = true,
  interactive = false,
  onClick,
}: RankEmblemProps) {
  const meta = RANKS_DATA[rank] || RANKS_DATA.E;

  return (
    <div
      onClick={onClick}
      className={`group relative inline-flex flex-col items-center justify-center ${
        interactive ? "cursor-pointer transition-transform duration-300 hover:scale-105" : ""
      } ${className}`}
    >
      {/* Dynamic ambient glow behind emblem */}
      {withGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-60 transition-opacity duration-500 group-hover:opacity-90 animate-pulse pointer-events-none"
          style={{ backgroundColor: meta.glowColor }}
        />
      )}

      {/* Emblem Image */}
      <img
        src={meta.image}
        alt={`${meta.tier} Rank - ${meta.title} Emblem`}
        className={`relative z-10 object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] transition-all duration-500 ${sizeClasses[size]}`}
      />

      {/* Optional Title Label */}
      {showTitle && (
        <span
          className="relative z-10 mt-1.5 font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border"
          style={{
            borderColor: meta.color,
            color: meta.color,
            backgroundColor: `${meta.color}15`,
          }}
        >
          {meta.tier} // {meta.title}
        </span>
      )}
    </div>
  );
}

interface RankPromotionModalProps {
  currentXp: number;
  onPromotionClosed?: () => void;
}

export function RankPromotionModal({ currentXp, onPromotionClosed }: RankPromotionModalProps) {
  const [promoData, setPromoData] = useState<{
    isOpen: boolean;
    prevTier: RankTier;
    newTier: RankTier;
  }>({
    isOpen: false,
    prevTier: "E",
    newTier: "E",
  });

  const rankInfo = getRankInfo(currentXp);

  useEffect(() => {
    const storedTier = getStoredHunterRank();
    const currentTier = rankInfo.tier;

    if (!storedTier) {
      // First time initialization: store current tier silently
      saveStoredHunterRank(currentTier);
      return;
    }

    if (isHigherRank(currentTier, storedTier)) {
      // Hunter promoted! Trigger celebratory modal & fanfare
      setPromoData({
        isOpen: true,
        prevTier: storedTier,
        newTier: currentTier,
      });
      playRankUpFanfare();
      saveStoredHunterRank(currentTier);
    }
  }, [rankInfo.tier, currentXp]);

  if (!promoData.isOpen) return null;

  const newMeta = RANKS_DATA[promoData.newTier];
  const prevMeta = RANKS_DATA[promoData.prevTier];

  function handleClose() {
    setPromoData((prev) => ({ ...prev, isOpen: false }));
    onPromotionClosed?.();
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-background/90 backdrop-blur-2xl animate-in fade-in duration-300">
      {/* Background Animated Rays / Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div
          className="size-[650px] rounded-full blur-[140px] opacity-40 animate-pulse"
          style={{ backgroundColor: newMeta.glowColor }}
        />
        <div className="absolute size-[550px] rounded-full border border-dashed border-primary/20 animate-core-spin" />
        <div className="absolute size-[700px] rounded-full border border-primary/10 animate-core-reverse" />
      </div>

      {/* Main Promotion Card */}
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden border border-border bg-card p-6 md:p-8 text-center shadow-[0_25px_80px_rgba(0,0,0,0.8)] [clip-path:polygon(0_16px,16px_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%)] animate-in zoom-in-90 duration-500"
        style={{
          boxShadow: `0 0 50px ${newMeta.glowColor}, inset 0 0 30px ${newMeta.glowColor}`,
          borderColor: newMeta.color,
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
          aria-label="Close promotion announcement"
        >
          <X className="size-5" />
        </button>

        {/* System Alert Header */}
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="size-4 animate-spin text-primary" style={{ color: newMeta.color }} />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em]" style={{ color: newMeta.color }}>
            System Notice // Hunter Promotion
          </p>
          <Sparkles className="size-4 animate-spin text-primary" style={{ color: newMeta.color }} />
        </div>

        <h2 className="mt-3 font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground">
          Rank Ascension!
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Your physical stats & XP progression have broken through the previous ceiling.
        </p>

        {/* Transition Badges: Old Rank -> New Rank */}
        <div className="mt-5 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 rounded border border-border bg-muted/40 px-3 py-1.5 opacity-60">
            <img src={prevMeta.image} alt={prevMeta.title} className="size-6 object-contain" />
            <span className="font-mono text-xs font-bold uppercase">{prevMeta.tier} Rank</span>
          </div>

          <ArrowRight className="size-4 text-muted-foreground animate-pulse" />

          <div
            className="flex items-center gap-2 rounded border px-3.5 py-1.5 font-bold shadow-lg"
            style={{
              borderColor: newMeta.color,
              backgroundColor: `${newMeta.color}20`,
              color: newMeta.color,
            }}
          >
            <Zap className="size-4" />
            <span className="font-mono text-xs uppercase tracking-wider">
              {newMeta.tier}-Rank {newMeta.title}
            </span>
          </div>
        </div>

        {/* Giant Showcase Emblem with Spring-Scale & Rotation */}
        <div className="my-6 flex justify-center">
          <div className="relative group">
            <div
              className="absolute -inset-4 rounded-full blur-2xl opacity-75 animate-pulse"
              style={{ backgroundColor: newMeta.glowColor }}
            />
            <img
              src={newMeta.image}
              alt={`${newMeta.tier} Rank Emblem`}
              className="relative z-10 size-48 md:size-56 object-contain transition-transform duration-700 hover:scale-110 drop-shadow-[0_15px_35px_rgba(0,0,0,0.7)] animate-in zoom-in-75 duration-700"
            />
          </div>
        </div>

        {/* Rank Title & Description */}
        <div className="rounded border border-border/80 bg-background/60 p-4 backdrop-blur-md">
          <p className="font-display text-2xl font-black uppercase" style={{ color: newMeta.color }}>
            {newMeta.title} Emblem Equipped
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {newMeta.description}
          </p>

          {/* Unlocked Capabilities */}
          <div className="mt-4 border-t border-border/60 pt-3 text-left">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
              New Protocols Unlocked:
            </p>
            <ul className="mt-2 space-y-1.5">
              {newMeta.unlocks.map((unlock) => (
                <li key={unlock} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 shrink-0" style={{ color: newMeta.color }} />
                  <span>{unlock}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Claim Button */}
        <Button
          type="button"
          onClick={handleClose}
          size="system"
          className="mt-6 w-full font-mono text-xs uppercase tracking-widest cursor-pointer"
          style={{
            backgroundColor: newMeta.color,
            color: "#0a0e1a",
          }}
        >
          Equip {newMeta.tier}-Rank Emblem & Ascend
        </Button>
      </div>
    </div>
  );
}
