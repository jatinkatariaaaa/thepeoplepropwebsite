"use client";

import { Trophy, Clock, Users, ArrowRight, Medal, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const activeCompetitions = [
  {
    id: "COMP-24-06",
    title: "June Trading Championship",
    prizePool: "$50,000",
    participants: 1245,
    timeLeft: "12 Days Left",
    status: "Active",
    image: "bg-ink-950",
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
    image: "bg-ink-950",
  },
  {
    id: "COMP-24-08",
    title: "Forex Elite Tournament",
    prizePool: "$25,000",
    participants: 156,
    startsIn: "Starts in 45 Days",
    status: "Upcoming",
    image: "bg-ink-950",
  }
];

export default function CompetitionsPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Compete</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Competitions</h1>
        <p className="mt-1 text-sm text-ink-500">Compete against other traders to win cash prizes and funded accounts.</p>
      </div>

      {/* Active Competitions */}
      <div className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
          <span className="status-dot bg-[var(--dash-positive)]" aria-hidden="true"></span>
          Active Competitions
        </h2>
        
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {activeCompetitions.map((comp) => (
            <div key={comp.id} className="dash-card dash-card-hover group overflow-hidden">
              <div className={cn("h-32 p-6 flex items-start justify-between relative overflow-hidden", comp.image)}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" aria-hidden="true"></div>
                <div className="relative z-10">
                  <span className="mb-2 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/90">
                    Free Entry
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-white">{comp.title}</h3>
                </div>
                <Trophy className="absolute -bottom-2 -right-2 h-14 w-14 -rotate-12 text-white/10 transition-transform duration-500 group-hover:scale-105" aria-hidden="true" />
              </div>
              
              <div className="p-6">
                <div className="mb-5 grid grid-cols-3 gap-4">
                  <div>
                    <p className="dash-overline mb-1">Prize Pool</p>
                    <p className="dash-figure flex items-center gap-1.5 text-base">
                      <Medal className="h-4 w-4 text-amber-500" />
                      {comp.prizePool}
                    </p>
                  </div>
                  <div>
                    <p className="dash-overline mb-1">Participants</p>
                    <p className="dash-figure flex items-center gap-1.5 text-base">
                      <Users className="h-4 w-4 text-ink-400" />
                      {comp.participants}
                    </p>
                  </div>
                  <div>
                    <p className="dash-overline mb-1">Time Left</p>
                    <p className="dash-figure flex items-center gap-1.5 text-base">
                      <Clock className="h-4 w-4 text-ink-400" />
                      {comp.timeLeft}
                    </p>
                  </div>
                </div>
                
                <button className="flex h-10 w-full items-center justify-center gap-2 carbon-btn-primary transition-all hover:bg-[var(--carbon-blue-hover)] active:scale-[0.98]">
                  Enter Competition <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Competitions */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-[15px] font-semibold tracking-tight text-ink">
          <Calendar className="h-4 w-4 text-ink-400" />
          Upcoming Competitions
        </h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {upcomingCompetitions.map((comp) => (
            <div key={comp.id} className="dash-card dash-card-hover group overflow-hidden">
              <div className={cn("h-24 p-5 flex items-start justify-between relative overflow-hidden", comp.image)}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" aria-hidden="true"></div>
                <div className="relative z-10 w-full">
                  <h3 className="mb-1 text-base font-semibold tracking-tight text-white">{comp.title}</h3>
                  <div className="flex items-center gap-1.5 text-[12px] font-medium text-white/70">
                    <Clock className="w-3.5 h-3.5" />
                    {comp.startsIn}
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <p className="dash-overline">Prize Pool</p>
                    <p className="dash-figure text-[15px]">{comp.prizePool}</p>
                  </div>
                  <div className="text-right">
                    <p className="dash-overline">Pre-registered</p>
                    <p className="dash-figure text-[15px]">{comp.participants}</p>
                  </div>
                </div>
                
                <button className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white text-[13px] font-semibold text-ink transition-colors hover:border-[var(--dash-hairline-strong)] hover:bg-ink-50">
                  Register Early
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
