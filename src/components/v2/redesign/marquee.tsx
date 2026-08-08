const ITEMS = [
  "Forex — 60+ pairs",
  "Gold & Silver",
  "Indices",
  "Crypto 24/7",
  "Energies",
  "Raw spreads from 0.0",
  "No commission tiers",
  "News trading allowed",
  "EAs permitted",
  "Weekend holding",
];

export function Marquee() {
  return (
    <section
      aria-label="Tradable instruments"
      className="relative overflow-hidden border-y border-border bg-background py-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-32 bg-[linear-gradient(to_right,var(--background),transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-32 bg-[linear-gradient(to_left,var(--background),transparent)]"
      />
      <div className="v2-marquee flex w-max items-center">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex items-center"
          >
            {ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-8 px-8 font-mono text-[11px] tracking-[0.2em] whitespace-nowrap text-muted-foreground uppercase"
              >
                {item}
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-primary/70"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
