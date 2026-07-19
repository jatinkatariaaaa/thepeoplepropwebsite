import Link from 'next/link'
import { ArrowRight, Star, Target } from 'lucide-react'

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
    <section
      id="rules"
      className="relative overflow-hidden bg-[#f6f9ff] px-4 py-24"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(14,159,110,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(14,159,110,0.05) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
      }}
    >
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-card py-1.5 pl-1.5 pr-4 shadow-md shadow-navy/5">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary">
              <Star className="size-3.5 fill-white text-white" />
            </span>
            <span className="text-sm font-semibold text-navy">Excellent</span>
            <span className="text-sm font-bold text-navy">4.8</span>
          </div>

          <h2 className="mt-6 text-balance font-heading text-4xl font-bold leading-tight text-navy md:text-5xl">
            Positioned above the rest
            <br />
            <span className="text-primary">Built for modern traders.</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
            We benchmarked leading prop firms across the factors that matter
            most: market presence. The People Prop stands where leaders belong,
            at the top right of the market map.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-2 gap-x-8 gap-y-6 border-t border-border pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-5xl font-bold text-navy">
                  {s.value}
                  <span className="align-super text-2xl text-primary">
                    {s.unit}
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <Link
            href="#pricing"
            className="mt-10 flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-[1.02]"
          >
            Get Started Now
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/10">
              <Target className="size-4 text-primary" />
            </span>
            <span className="text-sm font-semibold text-navy">
              Market Positioning
            </span>
          </div>

          <div
            className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-primary/20"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 75% 25%, #0e9f6e 0%, #12332a 55%, #08180f 100%)',
            }}
            role="img"
            aria-label="Market positioning quadrant chart showing The People Prop as the leader in the top right, surrounded by competitor firms"
          >
            <span className="absolute left-4 top-3 text-xs text-white/60">
              Contenders
            </span>
            <span className="absolute right-4 top-3 text-xs text-white/80">
              Leaders
            </span>
            <span className="absolute bottom-8 left-4 text-xs text-white/60">
              Emerging Firms
            </span>
            <span className="absolute bottom-8 right-24 text-xs text-white/80">
              High Performers
            </span>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-white/70">
              Reliability &rarr;
            </span>
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-widest text-white/70"
              style={{ writingMode: 'vertical-rl' }}
            >
              Market Presence &uarr;
            </span>

            {/* Axis lines */}
            <span
              aria-hidden="true"
              className="absolute left-[8%] right-[12%] top-[55%] h-px bg-white/25"
            />
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[55%] size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60"
            />

            {/* Competitor dots */}
            {competitors.map((c) => (
              <span
                key={`${c.x}-${c.y}`}
                className="absolute flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-white/15 text-[9px] font-bold text-white backdrop-blur-sm"
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
              >
                {c.label}
              </span>
            ))}

            {/* The People Prop */}
            <div className="absolute right-[8%] top-[18%] flex flex-col items-center gap-1 rounded-2xl border border-white/25 bg-navy px-5 py-4 shadow-2xl shadow-black/40">
              <span className="font-heading text-2xl font-bold text-white">
                TP<span className="text-primary">/</span>P
              </span>
              <span className="text-[9px] font-semibold text-white/80">
                ThePeople<span className="text-primary">/</span>Prop
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
