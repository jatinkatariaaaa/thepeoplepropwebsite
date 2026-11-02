"use client";

import { Trophy, Clock, Users, ArrowRight, Medal, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageTitle, Panel, SectionTitle, btn } from "@/components/dashboard/glass";

const activeCompetitions = [
  {
    id: "COMP-24-06",
    title: "June Trading Championship",
    prizePool: "$50,000",
    participants: 1245,
    timeLeft: "12 Days Left",
    status: "Active",
    image: "g-card-emerald",
  }
];

const upcomingCompetitions = [
  {
    id: "COMP-24-07",
    title: "Summer Scalper Showdown",
    prizePool: "$100,000",
    participants: 342,
    startsIn: "Starts in 18 Days",
    status: "Upcoming",
    image: "g-card-dark",
  },
  {
    id: "COMP-24-08",
    title: "Forex Elite Tournament",
    prizePool: "$25,000",
    participants: 156,
    startsIn: "Starts in 45 Days",
    status: "Upcoming",
    image: "g-card-dark",
  }
];

export default function CompetitionsPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Competitions" lede="Compete against other traders to win cash prizes and funded accounts." />

      {/* Active Competitions */}
      <div className="mb-10">
        <SectionTitle
          title={
            <span className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--g-emerald)]" />
              Active Competitions
            </span>
          }
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {activeCompetitions.map((comp) => (
            <Panel key={comp.id} className="group overflow-hidden">
              <div className={cn("relative flex h-32 items-start justify-between overflow-hidden p-6", comp.image)}>
                <div aria-hidden="true" className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.22),transparent)]" />
                <div className="relative z-10">
                  <span className="mb-2 inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur-md">
                    Free Entry
                  </span>
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-white">{comp.title}</h3>
                </div>
                <Trophy className="absolute -right-2 -bottom-2 h-16 w-16 -rotate-12 transform text-white/20 transition-transform duration-500 group-hover:scale-110" />
              </div>

              <div className="p-6">
                <div className="mb-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-3">
                  <div>
                    <p className="mb-1 text-[11px] font-medium tracking-[0.1em] text-[var(--g-muted-ink)] uppercase">Prize Pool</p>
                    <p className="g-num flex items-center gap-1.5 text-[18px] font-semibold text-[var(--g-ink)]">
                      <Medal className="h-4 w-4 text-[var(--g-emerald)]" />
                      {comp.prizePool}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-medium tracking-[0.1em] text-[var(--g-muted-ink)] uppercase">Participants</p>
                    <p className="g-num flex items-center gap-1.5 text-[18px] font-semibold text-[var(--g-ink)]">
                      <Users className="h-4 w-4 text-[var(--g-emerald)]" />
                      {comp.participants}
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-[11px] font-medium tracking-[0.1em] text-[var(--g-muted-ink)] uppercase">Time Left</p>
                    <p className="g-num flex items-center gap-1.5 text-[18px] font-semibold text-[var(--g-ink)]">
                      <Clock className="h-4 w-4 text-[var(--g-emerald)]" />
                      {comp.timeLeft}
                    </p>
                  </div>
                </div>

                <button className={cn(btn.lime, "group/btn w-full")}>
                  Enter Competition <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </Panel>
          ))}
        </div>
      </div>

      {/* Upcoming Competitions */}
      <div>
        <SectionTitle
          title={
            <span className="flex items-center gap-2.5">
              <Calendar className="h-5 w-5 text-[var(--g-emerald)]" />
              Upcoming Competitions
            </span>
          }
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingCompetitions.map((comp) => (
            <Panel key={comp.id} className="group overflow-hidden">
              <div className={cn("relative flex h-24 items-start justify-between overflow-hidden p-5", comp.image)}>
                <div className="relative z-10 w-full">
                  <h3 className="mb-1 text-lg font-semibold tracking-[-0.02em] text-white">{comp.title}</h3>
                  <div className="flex items-center gap-2 text-[12px] font-medium text-white/70">
                    <Clock className="h-3.5 w-3.5" />
                    {comp.startsIn}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.1em] text-[var(--g-muted-ink)] uppercase">Prize Pool</p>
                    <p className="g-num text-[15px] font-semibold text-[var(--g-ink)]">{comp.prizePool}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-medium tracking-[0.1em] text-[var(--g-muted-ink)] uppercase">Pre-registered</p>
                    <p className="g-num text-[15px] font-semibold text-[var(--g-ink)]">{comp.participants}</p>
                  </div>
                </div>

                <button className={cn(btn.light, btn.sm, "w-full")}>
                  Register Early
                </button>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </div>
  );
}
