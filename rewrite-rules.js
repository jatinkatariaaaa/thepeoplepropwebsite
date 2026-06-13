const fs = require('fs');

const rulesContent = `import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { RuleCard } from "@/components/rules/RuleCard";
import { RulesFAQ } from "@/components/rules/RulesFAQ";
import { rules } from "@/data/rules";
import { V3Navbar } from "@/components/layout/V3Navbar";
import { V3Footer } from "@/components/layout/V3Footer";

export const metadata: Metadata = {
  title: "Rules — The People Prop",
  description: "Every TPP rule, written plainly. Profit targets, drawdown limits, consistency policy, news trading, scaling plan, and refund policy.",
};

export default function RulesPage() {
  return (
    <div className="v3-page min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased">
      <V3Navbar />
      
      {/* 1. Hero wrapped in Black card */}
      <section className="pt-24 lg:pt-32 px-[5px] pb-[5px]">
        <div className="rounded-2xl bg-[#0c0c0c] text-white py-16 md:py-24 px-6 md:px-10 relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 mb-8 text-[13px] font-medium text-white/80">The Rulebook</span>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white mb-6">
              Fair rules.<br/>
              <span className="font-serif italic text-[#0c0c0c] px-2 bg-[#cbfb45] rounded-xl -rotate-1 inline-block">Set in stone</span>.
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-white/60">
              Every constraint, ratio and review window — published openly. No mystery footnotes. No mid-evaluation changes.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Rules and FAQ in Creme card */}
      <section className="px-[5px] pb-[5px]">
        <div className="rounded-2xl bg-[#f1eade] border border-[#0c0c0c]/10 py-16 md:py-24 px-6 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
              {/* Left: rule cards */}
              <aside className="lg:sticky lg:top-28 lg:self-start space-y-3">
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#0c0c0c]/60 mb-5">
                  <span className="h-px w-8 bg-[#0c0c0c]/20" />
                  Quick reference
                </div>
                <div className="space-y-3">
                  {rules.map((r) => (
                    <RuleCard key={r.id} rule={r} />
                  ))}
                </div>
              </aside>

              {/* Right: FAQ */}
              <div>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#0c0c0c]/60 mb-5">
                  <span className="h-px w-8 bg-[#0c0c0c]/20" />
                  Detailed FAQ
                </div>
                <h2 className="font-bold text-[clamp(1.8rem,3.5vw,2.5rem)] leading-[1.05] tracking-tight text-[#0c0c0c] mb-8 max-w-md">
                  Plain-English answers, written by{" "}
                  <span className="font-serif italic text-[#cbfb45] px-2 bg-[#0c0c0c] rounded-xl rotate-1 inline-block">traders</span>.
                </h2>
                <div className="rounded-2xl border border-[#0c0c0c]/10 bg-white/50 backdrop-blur-sm p-4">
                  <RulesFAQ />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <V3Footer />
    </div>
  );
}`;

fs.writeFileSync('src/app/rules/page.tsx', rulesContent, 'utf8');
console.log('Rules page completely rewritten into V3 card sections');
