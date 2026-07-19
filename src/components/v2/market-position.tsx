import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const competitors = [
  { x: 74, y: 36, label: 'FS' },
  { x: 60, y: 46, label: 'FN' },
  { x: 73, y: 48, label: 'SF' },
  { x: 81, y: 46, label: 'IP' },
  { x: 47, y: 60, label: 'AX' },
  { x: 78, y: 60, label: 'GF' },
  { x: 68, y: 63, label: 'TB' },
  { x: 56, y: 66, label: 'BT' },
  { x: 10, y: 71, label: 'SK' },
  { x: 22, y: 79, label: 'QT' },
  { x: 44, y: 81, label: 'MV' },
  { x: 60, y: 81, label: 'EC' },
]

const stats = [
  { value: '100', unit: '%', label: 'Profit Split' },
  { value: '50', unit: '%', label: 'In-Challenge' },
  { value: '12', unit: 'h', label: 'Trading Speed' },
]

export function MarketPosition() {
  return (
    <section id="rules" className="border-b border-border">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        <div className="border-b border-border px-5 py-14 md:px-8 md:py-20 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            05 &mdash; Market position
          </p>
          <p className="mt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
            Excellent &mdash; rated 4.8 / 5
          </p>

          <h2 className="mt-8 text-balance font-heading text-4xl font-bold uppercase leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Positioned above the rest<span className="text-primary">.</span>
            <br />
            <span className="text-muted-foreground">
              Built for modern traders.
            </span>
          </h2>
          <p className="mt-6 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">
            We benchmarked leading prop firms across the factors that matter
            most. The People Prop stands where leaders belong &mdash; at the
            top right of the market map.
          </p>

          <dl className="mt-10 flex flex-col">
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex items-baseline justify-between border-t border-border py-4"
              >
                <dd className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                  {s.value}
                  <span className="text-2xl text-primary">{s.unit}</span>
                </dd>
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>

          <Link
            href="#pricing"
            className="group mt-10 inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Get Started Now
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="px-5 py-14 md:px-8 md:py-20">
          <p className="text-right font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            TPP &mdash; Market map 02
          </p>

          <div
            className="relative mt-8 aspect-[4/3] overflow-hidden border border-foreground bg-foreground"
            role="img"
            aria-label="Market positioning quadrant chart showing The People Prop as the leader in the top right, surrounded by competitor firms"
          >
            <span className="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.14em] text-background/50">
              Contenders
            </span>
            <span className="absolute right-4 top-3 font-mono text-[10px] uppercase tracking-[0.14em] text-background/80">
              Leaders
            </span>
            <span className="absolute bottom-8 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-background/50">
              Emerging Firms
            </span>
            <span className="absolute bottom-8 right-24 font-mono text-[10px] uppercase tracking-[0.14em] text-background/80">
              High Performers
            </span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold uppercase tracking-widest text-background/60">
              Reliability &rarr;
            </span>
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold uppercase tracking-widest text-background/60"
              style={{ writingMode: 'vertical-rl' }}
            >
              Market Presence &uarr;
            </span>

            {/* Axis lines */}
            <span
              aria-hidden="true"
              className="absolute left-[8%] right-[12%] top-[55%] h-px bg-background/25"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-[12%] left-1/2 top-[8%] w-px bg-background/15"
            />

            {/* Competitor dots */}
            {competitors.map((c) => (
              <span
                key={`${c.x}-${c.y}`}
                className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-background/25 font-mono text-[9px] font-bold text-background/70"
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
              >
                {c.label}
              </span>
            ))}

            {/* The People Prop */}
            <div className="absolute right-[8%] top-[18%] flex flex-col items-center gap-1 border border-highlight bg-highlight px-5 py-4 text-foreground">
              <span className="font-heading text-2xl font-bold">
                TP<span className="text-primary">/</span>P
              </span>
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em]">
                ThePeople/Prop
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
