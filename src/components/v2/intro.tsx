'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Wallet, Zap } from 'lucide-react'
import { Reveal } from '@/components/v2/motion'

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Transparent Rules',
    desc: 'Every rule published upfront. No hidden gotchas, no fine print traps.',
  },
  {
    icon: Wallet,
    title: 'Real Capital',
    desc: 'Trade funded accounts up to $500K with institutional-grade conditions.',
  },
  {
    icon: Zap,
    title: 'Fast Payouts',
    desc: 'Profits land in your wallet in under 24 hours. Guaranteed.',
  },
]

export function Intro() {
  return (
    <section id="about" className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Copy column */}
          <div>
            <Reveal>
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">
                Who We Are
              </p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-bold leading-tight text-navy md:text-5xl lg:text-6xl">
                We&apos;re The People{' '}
                <span className="relative inline-block text-primary">
                  Prop
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-highlight"
                  />
                </span>
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <h3 className="mt-6 text-pretty font-heading text-xl font-semibold text-navy md:text-2xl">
                The prop firm that rebels against industry clich&eacute;s.
              </h3>
              <p className="mt-4 max-w-[520px] text-pretty leading-relaxed text-muted-foreground">
                Ever noticed how every prop firm looks the same? Impossible
                rules, hidden gotchas, and payouts that never arrive. We built
                The People Prop to be the opposite &mdash; transparent rules,
                real capital, and payouts in under 24 hours.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <ul className="mt-8 flex flex-col gap-5">
                {pillars.map((p) => (
                  <li key={p.title} className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                      <p.icon className="size-5 text-primary" strokeWidth={2.2} />
                    </span>
                    <div>
                      <p className="font-heading text-base font-bold text-navy">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        {p.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="#pricing"
                  className="flex items-center gap-3 rounded-full bg-navy px-7 py-3.5 text-sm font-bold text-white transition-transform hover:scale-[1.03]"
                >
                  Start Trading
                  <ArrowRight className="size-4 text-primary" />
                </Link>
                <Link
                  href="/rules"
                  className="flex items-center rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-navy transition-colors hover:bg-secondary"
                >
                  About TPP
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Visual column */}
          <Reveal delay={0.1}>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -right-6 -top-6 hidden size-40 rounded-[2rem] bg-highlight/20 lg:block"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-6 -left-6 hidden size-48 rounded-[2rem] bg-primary/10 lg:block"
              />
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-3 shadow-2xl shadow-navy/10">
                <div className="overflow-hidden rounded-[1.4rem]">
                  <Image
                    src="/images/dashboard-v2.webp"
                    alt="The People Prop trading dashboard"
                    width={880}
                    height={660}
                    className="h-auto w-full object-cover"
                  />
                </div>
                {/* Floating payout chip */}
                <div className="absolute bottom-8 left-8 flex items-center gap-3 rounded-2xl bg-navy px-5 py-3.5 shadow-xl">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary">
                    <Wallet className="size-4.5 text-primary-foreground" />
                  </span>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/50">
                      Payout Sent
                    </p>
                    <p className="font-heading text-lg font-bold text-white">
                      $12,480<span className="text-primary">.00</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
