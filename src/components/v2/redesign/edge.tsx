import { Container, Eyebrow, Lede, SectionHeading } from "./primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/v2/motion";

const LEDGER = [
  { id: "#TPP-90412", region: "Lagos, NG", amount: "$18,240", time: "9h 12m" },
  { id: "#TPP-90408", region: "Karachi, PK", amount: "$7,905", time: "6h 40m" },
  { id: "#TPP-90391", region: "São Paulo, BR", amount: "$32,110", time: "11h 05m" },
  { id: "#TPP-90387", region: "Warsaw, PL", amount: "$4,620", time: "3h 55m" },
];

const RULES = [
  {
    term: "No consistency rule",
    detail:
      "One good day will never invalidate your account. Trade your edge at the size your edge deserves.",
  },
  {
    term: "Static drawdown",
    detail:
      "Your breach level is fixed at the starting balance. Profits are yours to keep, not a moving goalpost.",
  },
  {
    term: "150% fee refund",
    detail:
      "Clear your first payout and we return your evaluation fee with half again on top.",
  },
  {
    term: "Scale to $2M",
    detail:
      "Every 10% gained unlocks a 40% capital increase, reviewed automatically with no interviews.",
  },
];

export function Edge() {
  return (
    <section id="edge" className="v2-grain relative isolate overflow-hidden py-28 sm:py-36">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="v2-fog v2-drift top-[-160px] left-[8%] h-[420px] w-[520px] opacity-[0.18]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_7%,transparent),transparent)]" />
      </div>

      <Container>
        <Reveal>
          <div className="flex flex-col gap-5">
            <Eyebrow>The difference</Eyebrow>
            <SectionHeading className="max-w-2xl">
              Most firms are built to fail you. We are built to pay you.
            </SectionHeading>
            <Lede>
              Every rule below exists because a trader asked us for it. Read them
              once — there is nothing else hiding in the terms.
            </Lede>
          </div>
        </Reveal>

        {/* Asymmetric split: live ledger against a plain-language rulebook */}
        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="v2-glass v2-litedge relative h-full overflow-hidden rounded-[26px] p-7">
              <div
                aria-hidden="true"
                className="v2-fog bottom-[-200px] left-1/2 h-[320px] w-[80%] -translate-x-1/2 opacity-40"
              />
              <div className="relative flex items-center justify-between gap-4">
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  Payout ledger — last 24 hours
                </p>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-highlight">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_2px_var(--primary)]" />
                  Settling
                </span>
              </div>

              <ul className="relative mt-6 flex flex-col">
                {LEDGER.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-baseline gap-4 border-b border-border py-4 last:border-b-0"
                  >
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {row.id}
                    </span>
                    <span className="hidden text-[13px] text-foreground/70 sm:block">
                      {row.region}
                    </span>
                    <span className="font-heading ml-auto text-lg text-foreground">
                      {row.amount}
                    </span>
                    <span className="w-16 text-right font-mono text-[11px] text-highlight">
                      {row.time}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="relative mt-7 max-w-sm text-[13px] leading-relaxed text-muted-foreground">
                Requests are processed continuously, not on a Friday batch.
                Median transfer time last quarter was under twelve hours.
              </p>
            </div>
          </Reveal>

          {/* Rulebook as a definition list — deliberately not a card grid */}
          <Stagger className="flex flex-col lg:col-span-5" staggerDelay={0.1}>
            {RULES.map((rule, i) => (
              <StaggerItem key={rule.term}>
                <div
                  className={
                    i === 0
                      ? "flex flex-col gap-2 pb-7"
                      : "flex flex-col gap-2 border-t border-border py-7 last:pb-0"
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="h-px w-6 bg-[linear-gradient(to_right,var(--primary),transparent)]"
                    />
                    <h3 className="font-heading text-[17px] text-foreground">
                      {rule.term}
                    </h3>
                  </div>
                  <p className="pl-9 text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
                    {rule.detail}
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
