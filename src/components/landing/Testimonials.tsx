import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, Globe2, Star, TrendingUp } from "lucide-react";
import { testimonialsExtended, type Testimonial } from "@/data/testimonials";

/* ═══════════════════════════════════════════════════════════════
   Testimonials — Bento Grid

   Asymmetric bento layout:
   - 1 large hero card (long quote + big payout number)
   - 1 dark inverted card for contrast
   - Medium quote cards
   - Small stat tiles mixed in
   ═══════════════════════════════════════════════════════════════ */

/* Pick a curated set for the bento grid */
const hero = testimonialsExtended.find((t) => t.payout === "$24,300")!; // Daniel Park
const dark = testimonialsExtended.find((t) => t.initials === "FR")!; // Fatima — scaling story
const mediums: Testimonial[] = [
  testimonialsExtended.find((t) => t.initials === "MA")!, // Marcus
  testimonialsExtended.find((t) => t.initials === "AO")!, // Aisha
  testimonialsExtended.find((t) => t.initials === "CW")!, // Chen
  testimonialsExtended.find((t) => t.initials === "NK")!, // Nina
];

function Avatar({ t, dark = false }: { t: Testimonial; dark?: boolean }) {
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold tracking-wide ${
        dark
          ? "bg-[var(--lime)] text-[var(--ink-950)]"
          : "bg-[var(--ink-950)] text-white"
      }`}
      aria-hidden="true"
    >
      {t.initials}
    </div>
  );
}

function PersonRow({ t, dark = false }: { t: Testimonial; dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar t={t} dark={dark} />
      <div className="min-w-0">
        <p
          className={`text-[14px] font-semibold truncate ${
            dark ? "text-white" : "text-[var(--ink-950)]"
          }`}
        >
          {t.name}
        </p>
        <p
          className={`text-[12px] truncate ${
            dark ? "text-white/50" : "text-[var(--ink-400)]"
          }`}
        >
          {t.handle} · {t.location}
        </p>
      </div>
    </div>
  );
}

function VerifiedPayout({ payout }: { payout: string }) {
  return (
    <Badge variant="success" className="!gap-1">
      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
      {payout} payout
    </Badge>
  );
}

/* ── Large hero card ── */
function HeroCard({ t }: { t: Testimonial }) {
  return (
    <article className="lift surface-elevated flex flex-col justify-between gap-8 p-7 md:p-9 md:col-span-2 md:row-span-2">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <VerifiedPayout payout={t.payout} />
          <div className="flex items-center gap-0.5" aria-label="5 star rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-[var(--amber)] text-[var(--amber)]"
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        <blockquote className="text-[22px] md:text-[26px] lg:text-[30px] leading-[1.25] font-medium tracking-[-0.02em] text-[var(--ink-950)] text-pretty">
          &ldquo;{t.body}&rdquo;
        </blockquote>
      </div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <PersonRow t={t} />
        <div className="text-right">
          <p className="text-[28px] md:text-[34px] font-bold tracking-[-0.03em] text-[var(--ink-950)] tabular-nums leading-none">
            {t.payout}
          </p>
          <p className="text-[11px] tracking-[0.1em] uppercase text-[var(--ink-400)] font-medium mt-1.5">
            Largest single payout
          </p>
        </div>
      </div>
    </article>
  );
}

/* ── Dark inverted card ── */
function DarkCard({ t }: { t: Testimonial }) {
  return (
    <article className="lift flex flex-col justify-between gap-6 p-6 md:p-7 rounded-[18px] bg-[var(--ink-950)] border border-[var(--ink-900)] shadow-[var(--shadow-lg)] md:col-span-2">
      <div className="flex flex-col gap-4">
        <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[11px] font-medium tracking-[0.04em] bg-[rgba(203,251,69,0.14)] text-[var(--lime)] border border-[rgba(203,251,69,0.25)]">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} />
          {t.payout} payout
        </span>
        <blockquote className="text-[16px] md:text-[18px] leading-relaxed text-white/85 text-pretty">
          &ldquo;{t.body}&rdquo;
        </blockquote>
      </div>
      <PersonRow t={t} dark />
    </article>
  );
}

/* ── Medium quote card ── */
function QuoteCard({ t }: { t: Testimonial }) {
  return (
    <article className="lift surface-card flex flex-col justify-between gap-5 p-6">
      <blockquote className="text-[14px] leading-relaxed text-[var(--ink-600)] text-pretty">
        &ldquo;{t.body}&rdquo;
      </blockquote>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <PersonRow t={t} />
        <VerifiedPayout payout={t.payout} />
      </div>
    </article>
  );
}

/* ── Small stat tile ── */
function StatTile({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="surface-quiet flex flex-col justify-between gap-6 p-6">
      <div className="w-9 h-9 rounded-full bg-[var(--lime)] flex items-center justify-center">
        <Icon className="w-4 h-4 text-[var(--ink-950)]" strokeWidth={2.25} aria-hidden="true" />
      </div>
      <div>
        <p className="text-[26px] md:text-[30px] font-bold tracking-[-0.03em] text-[var(--ink-950)] tabular-nums leading-none">
          {value}
        </p>
        <p className="text-[12px] text-[var(--ink-500)] mt-1.5">{label}</p>
      </div>
    </div>
  );
}

export function Testimonials() {
  return (
    <section
      className="relative w-full py-12 md:py-32 lg:py-40"
      aria-label="Trader Testimonials"
    >
      {/* Dot-grid background */}
      <div className="testimonial-dot-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <header className="max-w-xl mx-auto text-center mb-12 md:mb-16">
          <SectionHeading
            eyebrow="Trader Voices"
            title={
              <>
                Real <span className="word-serif">payouts</span>.
                <br />
                Real reviews.
              </>
            }
            description="Every testimonial below is from a verified TPP trader, with a verified payout receipt."
            align="center"
          />
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {/* Row 1–2 left: hero (2×2) */}
          <HeroCard t={hero} />

          {/* Row 1 right: quote + stat */}
          <QuoteCard t={mediums[0]} />
          <StatTile icon={TrendingUp} value="$2.4M+" label="Paid out to traders" />

          {/* Row 2 right: dark card (2 wide) */}
          <DarkCard t={dark} />

          {/* Row 3: stat + quote + quote + stat */}
          <StatTile icon={Globe2} value="142" label="Countries served" />
          <QuoteCard t={mediums[1]} />
          <QuoteCard t={mediums[2]} />
          <StatTile icon={Star} value="4.9/5" label="Average trader rating" />

          {/* Row 4: wide quote spans handled naturally on md */}
          <div className="sm:col-span-2 md:col-span-4">
            <QuoteCard t={mediums[3]} />
          </div>
        </div>
      </div>
    </section>
  );
}
