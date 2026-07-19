'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from '@/components/v2/motion'

const steps = [
  {
    num: '01',
    kicker: 'Qualify',
    title: 'Pass a transparent challenge.',
    className: 'bg-highlight text-foreground',
  },
  {
    num: '02',
    kicker: 'Get Funded',
    title: 'Trade real capital up to $500K.',
    className: 'bg-primary text-primary-foreground',
  },
  {
    num: '03',
    kicker: 'Get Paid',
    title: '100% split. Payouts in 12 hours.',
    className: 'bg-foreground text-background',
  },
]

const ease = [0.21, 0.47, 0.32, 0.98] as const

export function Hero() {
  return (
    <section className="pt-[57px] lg:pt-[103px]">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        {/* Micro label row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease }}
          className="flex items-center justify-between border-b border-border py-4"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Based on 250+ verified payouts
          </p>
          <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
            Avg. payout time &mdash; 12h
          </p>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease }}
          className="mt-10 font-heading text-[13vw] font-bold uppercase leading-[0.92] tracking-tight text-foreground md:mt-14 md:text-[7.5rem] lg:text-[8.5rem]"
        >
          The Home
          <br />
          of Traders<span className="text-primary">.</span>
        </motion.h1>

        {/* Outlined display numeral */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease }}
          aria-label="Funded accounts up to $500,000"
          className="mt-2 font-heading text-[16vw] font-bold leading-[1.05] tracking-tight text-foreground md:text-[9.5rem] lg:text-[11rem]"
        >
          <span aria-hidden="true">
            <span className="text-outline">$500,000</span>
            <span className="align-baseline text-[0.35em] font-bold">.00</span>
          </span>
        </motion.p>

        {/* Sub copy + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease }}
          className="mt-6 flex flex-col gap-8 pb-14 md:mt-8 md:flex-row md:items-end md:justify-between md:pb-20"
        >
          <p className="max-w-[420px] text-pretty text-[15px] leading-relaxed text-muted-foreground">
            The People Prop funds disciplined traders with real capital.
            Transparent rules, 150% fee refund, and profits in your wallet in
            under 24 hours &mdash; built for traders, not against them.
          </p>
          <div className="flex flex-wrap items-center gap-8">
            <Link
              href="#pricing"
              className="group inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Start My Challenge
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/rules"
              className="inline-flex items-center gap-2 border-b border-border pb-1 text-sm font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              Read the Rules
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Step blocks — full-bleed color strip */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease }}
        className="grid grid-cols-1 md:grid-cols-3"
      >
        {steps.map((step) => (
          <div
            key={step.num}
            className={`relative flex min-h-[150px] flex-col justify-between gap-6 px-6 py-6 md:min-h-[180px] md:px-8 ${step.className}`}
          >
            <div className="flex items-start justify-between">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">
                {step.kicker}
              </p>
              <p
                className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-60"
                style={{ writingMode: 'vertical-rl' }}
              >
                Step {step.num}
              </p>
            </div>
            <p className="max-w-[260px] text-pretty font-heading text-xl font-bold leading-snug md:text-2xl">
              {step.title}
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
