const fs = require('fs');

let content = `import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { V2ChallengeCalculator } from "@/components/landing/V2ChallengeCalculator";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faq } from "@/data/faq";
import { ALL_SIZES, formatSize, programs } from "@/data/programs";
import { V3Navbar } from "@/components/layout/V3Navbar";
import { V3Footer } from "@/components/layout/V3Footer";

export const metadata: Metadata = {
  title: "Challenges — The People Prop",
  description: "Five paths to a funded account: 1-Step, 2-Step, 3-Step, Instant Funded, and Pay-After-You-Pass. Sizes from $5K to $400K with up to 100% profit split.",
};

export default function ChallengesPage() {
  const challengeFaq = faq
    .filter((f) => ["rules", "payouts", "general"].includes(f.category ?? ""))
    .slice(0, 6);

  return (
    <div className="v3-page min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased">
      <V3Navbar />
      
      {/* 1. Hero wrapped in Black card */}
      <section className="pt-24 lg:pt-32 px-[5px] pb-[5px]">
        <div className="rounded-2xl bg-[#0c0c0c] text-white py-16 md:py-24 px-6 md:px-10 relative overflow-hidden">
          {/* Subtle grid texture */}
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 mb-8 text-[13px] font-medium text-white/80">Funded Accounts</span>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white mb-6">
              Five paths to a <span className="font-serif italic text-[#0c0c0c] px-2 bg-[#cbfb45] rounded-xl -rotate-2 inline-block">funded</span> account.
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-white/60">
              Pick the evaluation that fits how you trade — from the fastest 1-Step to our $5 Pay-After-You-Pass route. Up to $400K in scaled allocation, up to 100% split.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Calculator in Creme (default) */}
      <section className="px-[5px] py-[5px]">
        <div className="rounded-2xl bg-[#f1eade] border border-[#0c0c0c]/10 py-16 md:py-24 px-6 md:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Select your path" title="Build your challenge." align="center" className="mb-12" />
            <V2ChallengeCalculator />
          </div>
        </div>
      </section>

      {/* 3. Compare Table in Black card */}
      <section className="px-[5px] py-[5px]">
        <div className="rounded-2xl bg-[#0c0c0c] text-white py-16 md:py-24 px-6 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 md:mb-14 text-center flex flex-col items-center">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 mb-6 text-[11px] uppercase tracking-widest font-bold text-white/60">Side by side</span>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em] text-white">
                Compare <span className="font-serif italic text-[#0c0c0c] px-2 bg-[#cbfb45] rounded-xl rotate-1 inline-block">every</span> plan.
              </h2>
              <p className="mt-4 text-[15px] text-white/60 max-w-xl mx-auto">Every program, every account size — one transparent table. All fees one-time, refunded on your first qualifying payout.</p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] tabular-nums">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left font-bold text-white px-5 py-4 sticky left-0 bg-[#161616]">Program</th>
                      {ALL_SIZES.map((s) => (
                        <th key={s} className="text-right font-bold text-white px-4 py-4 whitespace-nowrap">{formatSize(s)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {programs.map((p, idx) => (
                      <tr key={p.key} className={idx % 2 === 1 ? "bg-white/[0.02]" : "bg-transparent"}>
                        <td className="px-5 py-4 sticky left-0 bg-[#121212]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{p.shortLabel}</span>
                            {p.badge && <span className="rounded-full bg-[#cbfb45] text-[#0c0c0c] text-[9.5px] uppercase font-bold px-2 py-0.5">{p.badge}</span>}
                          </div>
                          <p className="text-[11.5px] text-white/40 mt-1 font-medium">{p.profitTarget} · {p.maxDrawdown} max DD</p>
                        </td>
                        {ALL_SIZES.map((s) => {
                          const fee = p.fees[s];
                          return (
                            <td key={s} className="text-right px-4 py-4 text-white/80 border-l border-white/5">
                              {fee != null ? <span className="font-medium">\${fee.toLocaleString("en-US")}</span> : <span className="text-white/20 text-[11px] font-medium">—</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-5 py-4 mt-4 rounded-xl border border-white/10 bg-white/5 text-[11.5px] text-white/50 font-medium text-center">
              All prices in USD. One-time fee. Refunded with your first qualifying payout. Add-ons (100% split, on-demand payouts) sold separately at checkout.
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ in Lime card */}
      <section className="px-[5px] pb-[5px]">
        <div className="rounded-2xl bg-[#cbfb45] text-[#0c0c0c] py-16 md:py-24 px-6 md:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 md:mb-14 text-center flex flex-col items-center">
              <span className="inline-flex items-center gap-2.5 rounded-full border border-[#0c0c0c]/10 bg-[#0c0c0c]/5 px-4 py-2 mb-6 text-[11px] uppercase tracking-widest font-bold text-[#0c0c0c]/60">Challenge Questions</span>
              <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1] tracking-[-0.03em] text-[#0c0c0c]">
                What traders <span className="font-serif italic text-[#cbfb45] px-2 bg-[#0c0c0c] rounded-xl -rotate-1 inline-block">ask</span> before buying.
              </h2>
            </div>
            <div className="rounded-2xl border border-[#0c0c0c]/10 bg-[#0c0c0c]/5 p-2">
              <Accordion items={challengeFaq} />
            </div>
          </div>
        </div>
      </section>

      <V3Footer />
    </div>
  );
}
`;

fs.writeFileSync('src/app/challenges/page.tsx', content, 'utf8');
console.log('Challenges page completely rewritten into V3 card sections');
