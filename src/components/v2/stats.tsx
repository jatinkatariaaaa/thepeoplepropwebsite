'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Reveal, CountUp } from '@/components/v2/motion'

interface StatItem {
  value: string
  label: string
  key_name?: string
}

const DEFAULT_STATS: StatItem[] = [
  { value: '250+', label: 'Successful payouts', key_name: 'total_payouts' },
  { value: '142+', label: 'Countries served', key_name: 'countries' },
  { value: '5*', label: 'TrustPilot rating', key_name: 'trustpilot' },
]

/** Split "250+" into { num: 250, suffix: "+" } for the animated counter. */
function parseStat(value: string): { num: number | null; suffix: string } {
  const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/)
  if (!m) return { num: null, suffix: '' }
  return { num: parseFloat(m[1]), suffix: m[2] }
}

export function Stats() {
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS)

  useEffect(() => {
    supabase
      .from('tpp_stats')
      .select('*')
      .order('key_name')
      .then(({ data }) => {
        if (data && data.length > 0) setStats(data as StatItem[])
      })
  }, [])

  return (
    <section
      className="border-b border-border"
      aria-label="Company statistics"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              02 &mdash; Track record
            </p>
            <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              Real traders. Real payouts. Verified results across the globe,
              every single week.
            </p>
          </div>
          <h2 className="mt-6 max-w-2xl text-balance font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight text-foreground md:text-6xl">
            Numbers louder than promises<span className="text-primary">.</span>
          </h2>
        </Reveal>

        <div className="mt-12 flex flex-col">
          {stats.map((s, i) => {
            const { num, suffix } = parseStat(s.value)
            return (
              <Reveal key={s.key_name ?? s.label} delay={i * 0.08}>
                <div className="group flex items-baseline justify-between gap-6 border-t border-border py-6 transition-colors last:border-b hover:bg-card md:py-8">
                  <p className="font-heading text-6xl font-bold tracking-tight text-foreground md:text-8xl">
                    {num != null ? (
                      <>
                        <CountUp value={num} />
                        <span className="text-primary">{suffix}</span>
                      </>
                    ) : (
                      s.value
                    )}
                  </p>
                  <div className="flex items-baseline gap-6">
                    <p className="text-right font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground md:text-xs">
                      {s.label}
                    </p>
                    <p
                      className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 md:block"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
