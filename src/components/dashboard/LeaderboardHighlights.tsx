import { Trophy, CalendarDays, Coins, Crown } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";

export async function LeaderboardHighlights() {
  const { data: traders } = await supabaseAdmin
    .from("leaderboard")
    .select("*")
    .order("profit", { ascending: false })
    .limit(4);

  // Map our top 4 database traders to the highlight metric cards for demo purposes
  const highlights = [
    {
      title: "Highest Total Payout",
      value: traders && traders[0] ? `$${Number(traders[0].profit).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—",
      trader: traders && traders[0] ? traders[0].trader : "—",
      country: traders && traders[0] ? traders[0].country : "",
      icon: Trophy,
    },
    {
      title: "Longest Funded Duration",
      value: traders && traders[1] ? traders[1].duration : "—",
      trader: traders && traders[1] ? traders[1].trader : "—",
      country: traders && traders[1] ? traders[1].country : "",
      icon: CalendarDays,
    },
    {
      title: "Highest Single Profit",
      value: traders && traders[2] ? `$${Number(traders[2].avg_win).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—",
      trader: traders && traders[2] ? traders[2].trader : "—",
      country: traders && traders[2] ? traders[2].country : "",
      icon: Coins,
    },
    {
      title: "Most Payouts Received",
      value: traders && traders[3] ? `${traders[3].trades} Trades` : "—",
      trader: traders && traders[3] ? traders[3].trader : "—",
      country: traders && traders[3] ? traders[3].country : "",
      icon: Crown,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {highlights.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="dash-card dash-card-hover p-4 sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <p className="dash-overline leading-snug">{item.title}</p>
              <Icon className="h-4 w-4 shrink-0 text-ink-300" aria-hidden="true" />
            </div>
            <p className="dash-figure text-xl sm:text-2xl">{item.value}</p>
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-ink-500">
              <span className="truncate">{item.trader}</span>
              {item.country && <span aria-hidden="true">{item.country}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
