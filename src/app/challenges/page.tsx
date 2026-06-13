import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ChallengeCalculator } from "@/components/landing/ChallengeCalculator";
import { Accordion } from "@/components/ui/Accordion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faq } from "@/data/faq";
import {
  ALL_SIZES,
  formatSize,
  programs,
} from "@/data/programs";
import { V3Navbar } from "@/components/layout/V3Navbar";
import { V3Footer } from "@/components/layout/V3Footer";

export const metadata: Metadata = {
  title: "Challenges — The People Prop",
  description:
    "Five paths to a funded account: 1-Step, 2-Step, 3-Step, Instant Funded, and Pay-After-You-Pass. Sizes from $5K to $400K with up to 100% profit split.",
};

export default function ChallengesPage() {
  const challengeFaq = faq
    .filter((f) =>
      ["rules", "payouts", "general"].includes(f.category ?? ""),
    )
    .slice(0, 6);

  return (
    <div className="v3-page min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased">
      <V3Navbar />
      <div className="pt-24 lg:pt-32 pb-16">
        <PageHero
        eyebrow="Funded Accounts"
        title={
          <>
            Five paths to a{" "}
            <span className="word-serif">funded</span> account.
          </>
        }
        description="Pick the evaluation that fits how you trade — from the fastest 1-Step to our $5 Pay-After-You-Pass route. Up to $400K in scaled allocation, up to 100% split."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Challenges", href: "/challenges" },
        ]}
      />

      <ChallengeCalculator />

      {/* Compare-every-plan section — full fee matrix */}
      <section className="relative py-16 md:py-24 border-t border-[var(--border)] bg-[var(--paper-2)]">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Side by side"
            title={
              <>
                Compare <span className="word-serif">every</span> plan.
              </>
            }
            description="Every program, every account size — one transparent table. All fees one-time, refunded on your first qualifying payout."
            className="mb-10 md:mb-14"
          />

          <div className="surface-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] tabular-nums">
                <thead>
                  <tr className="bg-[var(--paper)] border-b border-[var(--border)]">
                    <th className="text-left font-medium text-[var(--ink-700)] px-5 py-3.5 sticky left-0 bg-[var(--paper)]">
                      Program
                    </th>
                    {ALL_SIZES.map((s) => (
                      <th
                        key={s}
                        className="text-right font-medium text-[var(--ink-700)] px-4 py-3.5 whitespace-nowrap"
                      >
                        {formatSize(s)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p, idx) => (
                    <tr
                      key={p.key}
                      className={
                        idx % 2 === 1
                          ? "bg-[var(--paper)]"
                          : "bg-white"
                      }
                    >
                      <td className="px-5 py-3.5 sticky left-0 bg-inherit">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[var(--ink-950)]">
                            {p.shortLabel}
                          </span>
                          {p.badge && (
                            <span className="rounded-full bg-[var(--accent-50)] text-[var(--accent-700)] text-[9.5px] tracking-eyebrow font-semibold px-1.5 py-0.5">
                              {p.badge.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] text-[var(--ink-500)] mt-0.5">
                          {p.profitTarget} · {p.maxDrawdown} max DD
                        </p>
                      </td>
                      {ALL_SIZES.map((s) => {
                        const fee = p.fees[s];
                        return (
                          <td
                            key={s}
                            className="text-right px-4 py-3.5 whitespace-nowrap"
                          >
                            {fee != null ? (
                              <span className="text-[var(--ink-950)]">
                                ${fee.toLocaleString("en-US")}
                              </span>
                            ) : (
                              <span className="text-[var(--ink-400)]">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-[var(--border)] bg-[var(--paper)] text-[11.5px] text-[var(--ink-500)]">
              All prices in USD. One-time fee. Refunded with your first
              qualifying payout. Add-ons (100% split, on-demand payouts) sold
              separately at checkout.
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-16 md:py-24 border-t border-[var(--border)]">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Challenge questions"
            title={
              <>
                What traders <span className="word-serif">ask</span> before
                buying.
              </>
            }
            align="center"
            className="mb-10 md:mb-14"
          />
          <Accordion items={challengeFaq} />
        </div>
      </section>
      </div>
      <V3Footer />
    </div>
  );
}