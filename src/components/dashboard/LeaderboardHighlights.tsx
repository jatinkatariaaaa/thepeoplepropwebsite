import { Trophy, CalendarDays, Coins, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const highlights = [
  {
    title: "Highest Total Rewards",
    value: "$58,124.00",
    trader: "Zagros S",
    country: "🇨🇦",
    icon: Trophy,
    gradient: "from-[var(--accent-700)] to-[var(--ink-950)]"
  },
  {
    title: "Longest Master Acc Duration",
    value: "349 days",
    trader: "Tianyi C",
    country: "🇹🇭",
    icon: CalendarDays,
    gradient: "from-[var(--accent-700)] to-[var(--ink-950)]"
  },
  {
    title: "Highest Single Reward",
    value: "$40,000.00",
    trader: "Zagros S",
    country: "🇨🇦",
    icon: Coins,
    gradient: "from-[var(--accent-700)] to-[var(--ink-950)]"
  },
  {
    title: "Highest Total Rewards Count",
    value: "12",
    trader: "Erti C",
    country: "🇦🇱",
    icon: Crown,
    gradient: "from-[var(--accent-700)] to-[var(--ink-950)]"
  }
];

export function LeaderboardHighlights() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {highlights.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div 
            key={idx}
            className={cn(
              "relative overflow-hidden rounded-[24px] p-6 text-white shadow-md transition-transform hover:-translate-y-1",
              "bg-gradient-to-br", item.gradient
            )}
          >
            {/* Background Icon Watermark */}
            <Icon className="absolute -bottom-6 -right-6 w-32 h-32 text-white opacity-5" strokeWidth={1} />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
                  <Icon className="w-5 h-5 text-[#FDE047]" />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-blue-100 opacity-90 max-w-[120px] leading-tight">
                  {item.title}
                </h3>
              </div>
              
              <div>
                <p className="text-[32px] font-display font-bold tracking-tight mb-1">
                  {item.value}
                </p>
                <div className="flex items-center gap-2 text-[14px] text-blue-100/80 font-medium">
                  <span>{item.trader}</span>
                  <span className="text-[16px]">{item.country}</span>
                </div>
              </div>
            </div>
            
            {/* Glossy top edge */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        );
      })}
    </div>
  );
}
