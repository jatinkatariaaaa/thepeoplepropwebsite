import { Trophy, CalendarDays, Coins, Crown } from "lucide-react";
import { getDailyLeaderboard } from "@/lib/daily-leaderboard";

export async function LeaderboardHighlights() {
  const traders = getDailyLeaderboard(20).slice(0, 4);

  // Map our top 4 database traders to the highlight metric cards for demo purposes
  const highlights = [
    {
      title: "Highest Total Payout",
      value: traders && traders[0] ? `$${Number(traders[0].profit).toLocaleString(undefined, {minimumFractionDigits: 2})}` : "-",
      trader: traders && traders[0] ? traders[0].trader : "-",
      country: traders && traders[0] ? traders[0].country : "-",
      icon: Trophy,
    },
    {
      title: "Longest Funded Duration",
      value: traders && traders[1] ? traders[1].duration : "-",
      trader: traders && traders[1] ? traders[1].trader : "-",
      country: traders && traders[1] ? traders[1].country : "-",
      icon: CalendarDays,
    },
    {
      title: "Highest Single Profit",
      value: traders && traders[2] ? `$${Number(traders[2].avg_win).toLocaleString(undefined, {minimumFractionDigits: 2})}` : "-",
      trader: traders && traders[2] ? traders[2].trader : "-",
      country: traders && traders[2] ? traders[2].country : "-",
      icon: Coins,
    },
    {
      title: "Most Payouts Received",
      value: traders && traders[3] ? `${traders[3].trades} Trades` : "-",
      trader: traders && traders[3] ? traders[3].trader : "-",
      country: traders && traders[3] ? traders[3].country : "-",
      icon: Crown,
    }
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-4">
      {highlights.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="g-card-dark g-hair relative overflow-hidden rounded-[24px] p-6 text-white transition-transform duration-500 [transition-timing-function:var(--g-out)] hover:-translate-y-1"
          >
            {/* Background Icon Watermark */}
            <Icon className="absolute -right-6 -bottom-6 h-32 w-32 text-white opacity-[0.06]" strokeWidth={1} />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-5 w-5 text-[var(--g-lime)]" />
                </div>
                <h3 className="max-w-[140px] text-[11px] leading-tight font-medium tracking-[0.12em] text-white/55 uppercase">
                  {item.title}
                </h3>
              </div>

              <div>
                <p className="g-num mb-1 text-[28px] leading-tight font-semibold text-white">
                  {item.value}
                </p>
                <div className="flex items-center gap-2 text-[14px] font-medium text-white/60">
                  <span>{item.trader}</span>
                  <span className="text-[16px]">{item.country}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
