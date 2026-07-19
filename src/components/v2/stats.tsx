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
    <section className="px-4 pb-20 md:pb-28" aria-label="Company statistics">
      <div className="mx-auto max-w-[1320px]">
        <div className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-14 md:rounded-[2.5rem] md:px-14 md:py-20">
          {/* Decorative ring */}
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-72 rounded-full border-[3rem] border-primary/10"
          />

          <Reveal>
            <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <h2 className="max-w-md text-balance font-heading text-3xl font-bold leading-tight text-navy md:text-4xl">
                Numbers that speak louder than promises
              </h2>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Real traders. Real payouts. Verified results across the globe,
                every single week.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {stats.map((s, i) => {
              const { num, suffix } = parseStat(s.value)
              return (
                <Reveal key={s.key_name ?? s.label} delay={i * 0.1}>
                  <div className="rounded-[1.5rem] border border-border bg-card px-8 py-10 shadow-lg shadow-navy/5 transition-shadow hover:shadow-xl hover:shadow-primary/10">
                    <p className="font-heading text-5xl font-bold tracking-tight text-navy md:text-6xl">
                      {num != null ? (
                        <>
                          <CountUp value={num} />
                          <span className="text-primary">{suffix}</span>
                        </>
                      ) : (
                        s.value
                      )}
                    </p>
                    <p className="mt-3 text-sm font-medium text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
