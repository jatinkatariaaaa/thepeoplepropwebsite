import { MessageSquareQuote } from "lucide-react";
import { testimonialsExtended, type Testimonial } from "@/data/testimonials";
import { Container, Eyebrow, Lede, Title } from "./ui";
import { Parallax, Reveal } from "./motion";

function StoryCard({ t, hidden }: { t: Testimonial; hidden?: boolean }) {
  return (
    <figure aria-hidden={hidden || undefined} className="g-card-paper g-hair g-hair-ink flex w-[330px] shrink-0 flex-col rounded-[28px] p-6 sm:w-[400px] sm:p-7">
      <div className="flex items-center justify-between">
        <span className="g-num rounded-full bg-[var(--g-ink)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--g-lime)]">Payout {t.payout}</span>
        <MessageSquareQuote aria-hidden="true" className="h-5 w-5 text-black/15" />
      </div>
      <blockquote className="mt-5 flex-1 text-[15.5px] leading-relaxed text-[var(--g-ink)]/85">“{t.body}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-black/[0.06] pt-5">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#7eaa9e,#1d6656_55%,#063a31)] text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
          {t.initials}
        </span>
        <div className="leading-tight">
          <p className="text-[14.5px] font-semibold text-[var(--g-ink)]">{t.name}</p>
          <p className="text-[12.5px] text-black/45">
            {t.handle} · {t.location}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

function Rail({ items, reverse, dur }: { items: Testimonial[]; reverse?: boolean; dur: string }) {
  return (
    <div className="g-fade-x g-pause overflow-hidden py-4">
      <div className={reverse ? "g-marquee g-marquee-rev flex w-max gap-5" : "g-marquee flex w-max gap-5"} style={{ ["--g-dur" as string]: dur }}>
        {items.map((t) => (
          <StoryCard key={t.handle} t={t} />
        ))}
        {items.map((t) => (
          <StoryCard key={`${t.handle}-b`} t={t} hidden />
        ))}
      </div>
    </div>
  );
}

export function Stories() {
  const half = Math.ceil(testimonialsExtended.length / 2);
  return (
    <section id="stories" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-28 pb-24 sm:rounded-t-[56px] sm:pt-36 sm:pb-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[560px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.22),transparent)]" />
      </div>
      <Parallax speed={0.2} rotate={5} className="pointer-events-none absolute top-16 right-[5%] hidden w-[260px] lg:block xl:right-[9%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/prop-paid.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="g-float w-full drop-shadow-[0_40px_36px_rgba(16,40,34,0.28)]" />
      </Parallax>

      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow tone="light" icon={MessageSquareQuote}>
              Trader stories
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.3rem,4.8vw,4.2rem)]" lead="Traders who chose" fade="transparency." />
          </Reveal>
          <Reveal delay={0.12}>
            <Lede tone="light" className="mt-6">
              In their words — what changed when the rules stopped working against them.
            </Lede>
          </Reveal>
        </div>
      </Container>

      <Reveal delay={0.15} className="mt-14 flex flex-col gap-1">
        <Rail items={testimonialsExtended.slice(0, half)} dur="95s" />
        <Rail items={testimonialsExtended.slice(half)} dur="105s" reverse />
      </Reveal>
      <Container>
        <p className="mt-6 text-center text-[12px] text-black/40">Individual results vary. Accounts are simulated and trading involves risk.</p>
      </Container>
    </section>
  );
}
