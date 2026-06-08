import { TrendingUp, Target, TrendingDown, BarChart3, PieChart, Activity } from "lucide-react";

export function AnalysisGrid() {
  return (
    <div className="space-y-6 mb-8">
      
      {/* 4 Mini Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { l: "Average Win", v: "$0.00", icon: TrendingUp },
          { l: "Win Ratio", v: "—", icon: Target },
          { l: "Average Loss", v: "$0.00", icon: TrendingDown },
          { l: "Profit Factor", v: "—", icon: BarChart3 }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--ink-500)] mb-2">
                <Icon className="w-4 h-4" /> {s.l}
              </div>
              <div className="text-[20px] font-display font-bold text-[var(--ink-950)]">{s.v}</div>
            </div>
          );
        })}
      </div>

      {/* Extra stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { l: "Number of days", v: "0", icon: CalendarDays },
          { l: "Total Trades Taken", v: "0", icon: Hash },
          { l: "Total Lots Used", v: "0.00", icon: BarChart3 },
          { l: "Biggest Win", v: "$0.00", icon: TrendingUp },
          { l: "Biggest Loss", v: "$0.00", icon: TrendingDown }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--ink-500)] mb-2">
                <Icon className="w-3.5 h-3.5" /> {s.l}
              </div>
              <div className="text-[18px] font-display font-bold text-[var(--ink-950)]">{s.v}</div>
            </div>
          );
        })}
      </div>

      {/* Pie Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Short Analysis" },
          { title: "Profitability", sub: "Total Trades" },
          { title: "Long Analysis" }
        ].map((chart, i) => (
          <div key={i} className="bg-white border border-[var(--border)] rounded-2xl shadow-sm flex flex-col">
            <div className="p-5 border-b border-[var(--border)]">
              <h4 className="font-bold text-[15px] text-[var(--ink-950)]">{chart.title}</h4>
            </div>
            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center border-b border-[var(--border)] min-h-[200px]">
              <PieChart className="w-8 h-8 text-[var(--ink-400)] mb-3" />
              <div className="text-[12px] text-[var(--ink-500)] mb-1">{chart.sub || "Profit"}</div>
              <div className="text-[14px] font-medium text-[var(--ink-600)]">Start trading to see analysis</div>
            </div>
            <div className="grid grid-cols-3 p-4 text-center divide-x divide-[var(--border)]">
              <div>
                <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Wins (0)</div>
                <div className="text-[14px] font-bold text-[var(--ink-950)]">$0.00</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Win Rate</div>
                <div className="text-[14px] font-bold text-[var(--ink-950)]">0%</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Losses (0)</div>
                <div className="text-[14px] font-bold text-[var(--ink-950)]">$0.00</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Bar Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm p-6">
          <h4 className="font-bold text-[15px] text-[var(--ink-950)] mb-6">PnL Distribution by Duration</h4>
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <BarChart3 className="w-8 h-8 text-[var(--ink-400)] mb-3" />
            <div className="text-[14px] font-bold text-[var(--ink-950)] mb-1">No trading data available</div>
            <div className="text-[13px] text-[var(--ink-500)]">Start trading to see profit distribution</div>
          </div>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm p-6">
          <h4 className="font-bold text-[15px] text-[var(--ink-950)] mb-6">PnL by Trade Duration</h4>
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <Activity className="w-8 h-8 text-[var(--ink-400)] mb-3" />
            <div className="text-[14px] font-bold text-[var(--ink-950)] mb-1">No trading data available</div>
            <div className="text-[13px] text-[var(--ink-500)]">Trade to see profit vs duration analysis</div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Just adding simple icon definitions to avoid missing imports up top
const CalendarDays = CalendarClock;
const Hash = Activity;
import { CalendarClock } from "lucide-react";
