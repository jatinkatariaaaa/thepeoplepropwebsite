import { Trophy } from "lucide-react";
import { getDailyLeaderboard } from "@/lib/daily-leaderboard";
import { Button, Container, Section } from "../ui";
import { PageHero } from "../page-hero";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", signDisplay: "always" });

export async function DailyRankings() {
  const { entries, unavailable } = await getDailyLeaderboard();
  return (
    <div className="g-card-dark g-hair overflow-hidden rounded-[28px] text-white">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="text-xl font-semibold">Today&apos;s rankings</h2>
        <p className="mt-1 text-sm text-white/65">Net profit from closed trades on funded simulation accounts since 00:00 UTC. Trader identities are private.</p>
      </div>
      {entries.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="text-white/60">
              <tr>
                {["Rank", "Net profit", "Closed trades", "Win rate"].map((label) => (
                  <th className="px-5 py-4 font-medium" key={label} scope="col">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr className="g-num border-t border-white/10" key={entry.rank}>
                  <td className="px-5 py-4 font-semibold">{entry.rank}</td>
                  <td className="px-5 py-4 text-[var(--g-lime)]">{usd.format(entry.profit)}</td>
                  <td className="px-5 py-4">{entry.trades}</td>
                  <td className="px-5 py-4">{entry.winRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-6 py-8 text-sm text-white/70">
          {unavailable ? "Rankings are temporarily unavailable." : "No eligible profitable trading results have been recorded today."}
        </p>
      )}
    </div>
  );
}

export function LeaderboardPage() {
  return (
    <>
      <PageHero art="/art/page-leaderboard.webp" crumb="Leaderboard" eyebrow="Leaderboard" icon={Trophy} lead="The daily" fade="leaderboard." lede="Ranked by realized net profit on funded simulation accounts. The ranking day starts at 00:00 UTC.">
        <Button href="/challenges">Start a challenge</Button>
      </PageHero>
      <Section shell={false} className="pb-28">
        <Container><DailyRankings /></Container>
      </Section>
    </>
  );
}
