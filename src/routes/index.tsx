import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Crosshair, Dumbbell, ShieldCheck, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader, SystemCore } from "@/components/brand";
import athleteImage from "@/assets/cursed-athlete.jpg";
import trainingImage from "@/assets/cursed-training.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "CursedFitness — Level Up Your Body" },
    { name: "description", content: "A gamified fitness system with adaptive workouts, nutrition, quests, and rank progression." },
    { property: "og:title", content: "CursedFitness — Level Up Your Body" },
    { property: "og:description", content: "Enter a fitness system built around your body, goals, and progress." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ]}), component: HomePage,
});

const ranks = ["E", "D", "C", "B", "A", "S"];

function HomePage() {
  return <main className="overflow-hidden"><SiteHeader />
    <section className="relative min-h-[860px] pt-18 lg:min-h-[920px]">
      <div className="absolute inset-0"><img src={athleteImage} width={1280} height={1536} alt="Athlete standing in the CursedFitness training chamber" className="h-full w-full object-cover object-[63%_center] opacity-65" /><div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background)_4%,color-mix(in_oklab,var(--background)_90%,transparent)_37%,color-mix(in_oklab,var(--background)_24%,transparent)_72%,var(--background)_100%)]" /><div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-background to-transparent" /></div>
      <div className="relative mx-auto grid min-h-[780px] max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="max-w-2xl"><div className="system-label mb-6 flex items-center gap-3"><span className="h-px w-10 bg-primary" /> System online // candidate detected</div>
          <h1 className="font-display text-[clamp(4.6rem,11vw,9.5rem)] font-black uppercase leading-[.74] tracking-normal text-foreground">Level up<br/><span className="text-primary text-glow">your body.</span></h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">Your body is the avatar. Train through adaptive missions, fuel with precision, and rise from E-Rank to the elite.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Button asChild variant="system" size="system"><Link to="/login">Awaken now <ArrowRight /></Link></Button><Button asChild variant="systemOutline" size="system"><Link to="/dashboard">View demo system</Link></Button></div>
          <div className="mt-12 grid max-w-lg grid-cols-3 gap-px border border-border bg-border"><Stat value="10K+" label="Hunters"/><Stat value="48" label="Missions"/><Stat value="6" label="Ranks"/></div>
        </div>
        <div className="hidden lg:block"><SystemCore /></div>
      </div>
      <div className="absolute bottom-9 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:flex">Scroll to initialize <span className="h-7 w-px bg-primary/60" /></div>
    </section>

    <section className="border-y border-border bg-card/50 py-24"><div className="mx-auto max-w-7xl px-5 lg:px-8"><div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="system-label">The protocol</p><h2 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">No random<br/>workouts.</h2></div><p className="max-w-xl text-lg leading-8 text-muted-foreground">CursedFitness reads your starting stats, defines your daily missions, and evolves the plan as your rank climbs.</p></div>
      <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-3"><Feature icon={<Crosshair/>} n="01" title="Scan your stats" text="Height, weight, age, activity and goals shape your starting protocol."/><Feature icon={<Dumbbell/>} n="02" title="Receive missions" text="A focused training split turns progress into daily, measurable quests."/><Feature icon={<ShieldCheck/>} n="03" title="Break your limits" text="Complete streaks, earn XP and unlock the next hunter rank."/></div></div></section>

    <section className="py-24"><div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:items-center lg:px-8"><div className="relative min-h-[520px] overflow-hidden border border-border"><img src={trainingImage} loading="lazy" width={1536} height={1024} alt="Athlete completing a strength mission" className="absolute inset-0 h-full w-full object-cover object-[62%_center]"/><div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"/><div className="system-panel absolute bottom-5 left-5 right-5 p-5"><div className="flex items-center justify-between"><span className="system-label">Daily mission</span><span className="font-mono text-xs text-success">+240 XP</span></div><p className="mt-3 font-display text-3xl font-bold uppercase">Strength of the awakened</p><div className="mt-4 h-1 bg-muted"><div className="h-full w-3/4 bg-primary shadow-[0_0_14px_var(--system-glow)]"/></div></div></div>
      <div><p className="system-label">Ascension path</p><h2 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">Every rep<br/>earns power.</h2><p className="mt-6 max-w-lg leading-7 text-muted-foreground">Your rank is more than a badge. It records consistency, strength gains and missions conquered.</p><div className="mt-10 flex items-center gap-2">{ranks.map((rank,i)=><div key={rank} className={`grid size-11 place-items-center border font-display text-xl font-black ${i===0 ? "border-primary bg-primary text-primary-foreground shadow-[0_0_24px_var(--system-glow)]" : "border-border bg-card text-muted-foreground"}`}>{rank}</div>)}</div><Button asChild variant="systemOutline" size="system" className="mt-9"><Link to="/assessment">Start assessment <ChevronRight/></Link></Button></div></div></section>

    <section className="border-t border-border px-5 py-24 text-center"><div className="mx-auto max-w-3xl"><Utensils className="mx-auto size-9 text-primary"/><p className="system-label mt-6">Your evolution begins now</p><h2 className="mt-4 text-5xl font-black uppercase md:text-7xl">Accept the quest?</h2><p className="mx-auto mt-5 max-w-xl text-muted-foreground">Enter your stats. Get your protocol. Become unrecognizable.</p><Button asChild variant="system" size="system" className="mt-8"><Link to="/login">Enter the system <ArrowRight/></Link></Button></div></section>
    <footer className="border-t border-border px-5 py-8"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:flex-row"><span>© 2026 CursedFitness</span><span>Frontend concept // No data stored</span></div></footer>
  </main>;
}

function Stat({ value, label }: { value:string; label:string }) { return <div className="bg-background/80 px-4 py-4"><p className="font-display text-2xl font-bold text-foreground">{value}</p><p className="system-label mt-1 text-[9px]">{label}</p></div> }
function Feature({icon,n,title,text}:{icon:React.ReactNode;n:string;title:string;text:string}) { return <article className="bg-background p-7 lg:p-9"><div className="flex items-center justify-between text-primary">{icon}<span className="font-mono text-xs text-muted-foreground">{n}</span></div><h3 className="mt-9 text-3xl font-bold uppercase">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></article> }