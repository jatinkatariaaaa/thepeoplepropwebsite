'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/v2/motion'

const figures = [
  { value: '150%', label: 'Fee refunded with your first payout' },
  { value: '100%', label: 'Profit split — keep every dollar you earn' },
  { value: '12h', label: 'Average payout processing time' },
  { value: '$500K', label: 'Maximum funded account size' },
]

export function Intro() {
  return (
    <section id="about" className="border-b border-border">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2">
        {/* Copy column */}
        <div className="border-b border-border px-5 py-14 md:px-8 md:py-20 lg:border-b-0 lg:border-r">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              01 &mdash; Who we are
            </p>
            <h2 className="mt-8 text-pretty font-heading text-3xl font-bold leading-[1.15] tracking-tight text-foreground md:text-4xl">
              In a world of copy-paste prop firms,{' '}
              <span className="text-primary">The People Prop</span> returns
              capital and control to traders who shouldn&apos;t be leaving
              money on the table.
            </h2>
            <p className="mt-6 max-w-[480px] text-pretty text-[15px] leading-relaxed text-muted-foreground">
              Ever noticed how every prop firm looks the same? Impossible
              rules, hidden gotchas, and payouts that never arrive. We built
              the opposite &mdash; published rules, institutional-grade
              capital, and payouts in under 24 hours.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="mt-12 flex flex-col">
              {figures.map((f) => (
                <div
                  key={f.value}
                  className="flex items-baseline justify-between gap-6 border-t border-border py-4"
                >
                  <dd className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    {f.value}
                  </dd>
                  <dt className="text-right font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
                    {f.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Link
                href="#pricing"
                className="group inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                Start Trading
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/rules"
                className="inline-flex items-center border-b border-border pb-1 text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
              >
                About TPP
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Visual column */}
        <div className="flex flex-col px-5 py-14 md:px-8 md:py-20">
          <Reveal delay={0.1}>
            <p className="text-right font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              TPP &mdash; Report 01
            </p>
            <div className="mt-8 border border-border bg-card p-2.5">
              <Image
                src="/images/dashboard-v2.webp"
                alt="The People Prop trading dashboard"
                width={880}
                height={660}
                className="h-auto w-full object-cover"
              />
              <div className="flex items-center justify-between px-2 pb-1 pt-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Live trader dashboard
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
                  Payout sent &mdash; $12,480.00
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-[420px] text-pretty text-sm leading-relaxed text-muted-foreground">
              Every account, payout, and challenge tracked in one in-house
              platform &mdash; no third-party dashboards, no data games.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
