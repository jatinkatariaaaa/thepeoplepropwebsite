import { Container, Eyebrow, SectionHeading } from "./primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/v2/motion";

const STEPS = [
  {
    step: "01",
    title: "Pick your capital",
    body: "Choose an account from $5,000 to $500,000. One phase, an 8% target, and a 10% static drawdown. No time limit.",
  },
  {
    step: "02",
    title: "Prove your edge",
    body: "Trade on MT5, cTrader or the TPP Terminal. News, EAs, weekend holds and hedging are all allowed.",
  },
  {
    step: "03",
    title: "Get funded and paid",
    body: "Sign your agreement the same day, request a payout whenever you like, and keep 100% of what you make.",
  },
];

export function Steps() {
  return (
    <section
      id="how"
      className="relative isolate overflow-hidden border-y border-border py-28 sm:py-32"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_5%,transparent),transparent_45%)]" />
      </div>

      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-5 text-center">
            <Eyebrow>Three steps</Eyebrow>
            <SectionHeading className="max-w-xl">
              From sign-up to first payout in a single week.
            </SectionHeading>
          </div>
        </Reveal>

        {/* Beam threading the three steps together */}
        <div className="relative mt-16">
          <div
            aria-hidden="true"
            className="absolute top-6 right-0 left-0 hidden h-px bg-[linear-gradient(to_right,transparent,color-mix(in_oklab,var(--primary)_55%,transparent),transparent)] md:block"
          />
          <Stagger
            className="grid gap-10 md:grid-cols-3 md:gap-8"
            staggerDelay={0.14}
          >
            {STEPS.map((item) => (
              <StaggerItem key={item.step}>
                <div className="relative flex flex-col gap-4 md:pr-6">
                  <span
                    aria-hidden="true"
                    className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-border bg-background font-mono text-[11px] tracking-[0.14em] text-highlight shadow-[0_0_30px_-6px_color-mix(in_oklab,var(--primary)_70%,transparent)]"
                  >
                    {item.step}
                  </span>
                  <h3 className="font-heading text-xl text-foreground">
                    {item.title}
                  </h3>
                  <p className="max-w-xs text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
                    {item.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
