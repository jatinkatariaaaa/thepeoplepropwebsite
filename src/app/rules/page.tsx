import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { RuleCard } from "@/components/rules/RuleCard";
import { RulesFAQ } from "@/components/rules/RulesFAQ";
import { rules } from "@/data/rules";

export const metadata: Metadata = {
  title: "Rules — The People Prop",
  description:
    "Every TPP rule, written plainly. Profit targets, drawdown limits, consistency policy, news trading, scaling plan, and refund policy.",
};

export default function RulesPage() {
  return (
    <>
      <PageHero
        eyebrow="The Rulebook"
        title={
          <>
            Fair rules.
            <br />
            <span className="word-serif">Set in stone</span>.
          </>
        }
        description="Every constraint, ratio and review window — published openly. No mystery footnotes. No mid-evaluation changes."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Rules", href: "/rules" },
        ]}
      />

      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16">
            {/* Left: rule cards */}
            <aside className="lg:sticky lg:top-28 lg:self-start space-y-3">
              <div className="flex items-center gap-3 text-[11px] tracking-eyebrow text-[var(--accent-700)] mb-5">
                <span className="h-px w-8 bg-[var(--accent)]/40" />
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
              <div className="flex items-center gap-3 text-[11px] tracking-eyebrow text-[var(--accent-700)] mb-5">
                <span className="h-px w-8 bg-[var(--accent)]/40" />
                Detailed FAQ
              </div>
              <h2 className="font-medium text-[clamp(1.8rem,3.5vw,2.5rem)] leading-[1.05] tracking-tight text-[var(--ink-950)] mb-8 max-w-md">
                Plain-English answers, written by{" "}
                <span className="word-serif">traders</span>.
              </h2>
              <RulesFAQ />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}