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
    image: "bg-gradient-to-br from-emerald-500 to-teal-700",
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
    image: "bg-gradient-to-br from-blue-500 to-indigo-700",
  },
  {
    id: "COMP-24-08",
    title: "Forex Elite Tournament",
    prizePool: "$25,000",
    participants: 156,
    startsIn: "Starts in 45 Days",
    status: "Upcoming",
    image: "bg-gradient-to-br from-purple-500 to-violet-700",
  }
];

export default function CompetitionsPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] mb-2">Competitions</h1>
        <p className="text-[var(--ink-500)]">Compete against other traders to win cash prizes and funded accounts.</p>
      </div>

      {/* Active Competitions */}
      <div className="mb-10">
        <h2 className="text-[18px] font-bold text-[var(--ink-950)] mb-4 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active Competitions
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeCompetitions.map((comp) => (
            <div key={comp.id} className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden group">
              <div className={cn("h-32 p-6 flex items-start justify-between relative overflow-hidden", comp.image)}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-md mb-2 border border-white/10">
                    Free Entry
                  </span>
                  <h3 className="text-xl font-bold text-white font-display">{comp.title}</h3>
                </div>
                <Trophy className="w-16 h-16 text-white/20 absolute -right-2 -bottom-2 transform -rotate-12 group-hover:scale-110 transition-transform duration-500" />
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Prize Pool</p>
                    <p className="text-[18px] font-bold text-[var(--ink-950)] flex items-center gap-1.5">
                      <Medal className="w-4 h-4 text-amber-500" />
                      {comp.prizePool}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Participants</p>
                    <p className="text-[18px] font-bold text-[var(--ink-950)] flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" />
                      {comp.participants}
                    </p>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Time Left</p>
                    <p className="text-[18px] font-bold text-[var(--ink-950)] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-red-500" />
                      {comp.timeLeft}
                    </p>
                  </div>
                </div>
                
                <button className="w-full h-11 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white text-[14px] font-bold rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2">
                  Enter Competition <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Competitions */}
      <div>
        <h2 className="text-[18px] font-bold text-[var(--ink-950)] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--ink-500)]" />
          Upcoming Competitions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingCompetitions.map((comp) => (
            <div key={comp.id} className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden group">
              <div className={cn("h-24 p-5 flex items-start justify-between relative overflow-hidden", comp.image)}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 w-full">
                  <h3 className="text-lg font-bold text-white font-display mb-1">{comp.title}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-[12px] font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {comp.startsIn}
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <p className="text-[11px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Prize Pool</p>
                    <p className="text-[15px] font-bold text-[var(--ink-950)]">{comp.prizePool}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Pre-registered</p>
                    <p className="text-[15px] font-bold text-[var(--ink-950)]">{comp.participants}</p>
                  </div>
                </div>
                
                <button className="w-full h-10 bg-[var(--paper-2)] hover:bg-[var(--border)] text-[var(--ink-950)] text-[13px] font-bold rounded-xl transition-colors border border-[var(--border)]">
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
