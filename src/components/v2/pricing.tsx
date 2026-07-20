'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  CandlestickChart,
  Check,
  Lock,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react'
import { Reveal } from '@/components/v2/motion'

type StepKey = 'instant' | '1step' | '2step' | '3step'

const steps: { key: StepKey; label: string; popular?: boolean }[] = [
  { key: 'instant', label: 'Instant', popular: true },
  { key: '1step', label: '1 Step' },
  { key: '2step', label: '2 Step' },
  { key: '3step', label: '3 Step' },
]

const sizes = [
  { key: '10k', label: '$10K', amount: 10_000 },
  { key: '25k', label: '$25K', amount: 25_000 },
  { key: '50k', label: '$50K', amount: 50_000 },
  { key: '100k', label: '$100K', amount: 100_000, popular: true },
  { key: '200k', label: '$200K', amount: 200_000 },
  { key: '500k', label: '$500K', amount: 500_000 },
]

const stepConfig: Record<
  StepKey,
  {
    name: string
    targets: number[]
    dailyDd: number
    maxDd: number
    prices: Record<string, { old: number; current: number }>
  }
> = {
  instant: {
    name: 'Instant Challenge',
    targets: [],
    dailyDd: 4,
    maxDd: 7,
    prices: {
      '10k': { old: 125, current: 69 },
      '25k': { old: 235, current: 129 },
      '50k': { old: 409, current: 225 },
      '100k': { old: 708, current: 389 },
      '200k': { old: 1235, current: 679 },
      '500k': { old: 2725, current: 1499 },
    },
  },
  '1step': {
    name: '1-Step Challenge',
    targets: [9],
    dailyDd: 3,
    maxDd: 6,
    prices: {
      '10k': { old: 100, current: 55 },
      '25k': { old: 144, current: 79 },
      '50k': { old: 264, current: 145 },
      '100k': { old: 464, current: 255 },
      '200k': { old: 852, current: 469 },
      '500k': { old: 1725, current: 949 },
    },
  },
  '2step': {
    name: '2-Step Challenge',
    targets: [8, 5],
    dailyDd: 5,
    maxDd: 10,
    prices: {
      '10k': { old: 68, current: 37 },
      '25k': { old: 125, current: 69 },
      '50k': { old: 235, current: 129 },
      '100k': { old: 416, current: 229 },
      '200k': { old: 835, current: 459 },
      '500k': { old: 1635, current: 899 },
    },
  },
  '3step': {
    name: '3-Step Challenge',
    targets: [6],
    dailyDd: 4,
    maxDd: 9,
    prices: {
      '10k': { old: 64, current: 35 },
      '25k': { old: 118, current: 65 },
      '50k': { old: 209, current: 115 },
      '100k': { old: 362, current: 199 },
      '200k': { old: 635, current: 349 },
      '500k': { old: 1271, current: 699 },
    },
  },
}

const included = [
  '100% Reward Split',
  '150% Fee Refund',
  '12h Reward Speed',
  '50% In-Challenge Reward',
  'Zero Consistency Rules',
  'First Loss Insurance',
  'Guaranteed Rewards',
  '24/7 Human Support',
  'Open Weekend & News',
  'EAs & Algo Allowed',
  'Free Challenge Reset',
  '\u221E Trading Days',
]

const paymentMethods = [
  'VISA',
  'Mastercard',
  'Maestro',
  'Amex',
  'Apple Pay',
  'BTC',
  'ETH',
  'Crypto',
]

function usd(n: number) {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

function StatRow({
  label,
  value,
  amount,
}: {
  label: string
  value: string
  amount: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-card px-5 py-4">
      <span className="text-sm font-medium text-navy">{label}</span>
      <span className="font-heading text-lg font-bold text-primary">
        {value}
      </span>
      <span
        aria-hidden="true"
        className="hidden flex-1 border-b border-dotted border-border sm:block"
      />
      <span className="text-sm font-semibold text-navy">{amount}</span>
    </div>
  )
}

export function Pricing() {
  const [step, setStep] = useState<StepKey>('2step')
  const [size, setSize] = useState('100k')

  const config = stepConfig[step]
  const selectedSize = sizes.find((s) => s.key === size) ?? sizes[3]
  const originalPrice = config.prices[selectedSize.key].old
  const price = config.prices[selectedSize.key].current

  const targetLabel =
    config.targets.length > 0
      ? config.targets.map((t) => `${t}%`).join(' \u00B7 ')
      : '\u2014'
  const targetAmounts =
    config.targets.length > 0
      ? config.targets
          .map((t) => usd((selectedSize.amount * t) / 100))
          .join(' / ')
      : '\u2014'

  return (
    <section id="pricing" className="px-4 pb-24 pt-16">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <h2 className="text-balance text-center font-heading text-5xl font-bold text-navy md:text-6xl">
            Choose your challenge
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr]">
          {/* Configurator */}
          <div className="rounded-[2rem] bg-primary p-1 shadow-2xl shadow-primary/25">
            <div className="rounded-[1.85rem] bg-primary p-6 md:p-8">
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-navy px-6 py-4">
                <CandlestickChart className="size-5 text-white" aria-hidden="true" />
                <span className="font-heading text-lg font-bold text-white">
                  MetaTrader 5
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/20 pt-6 sm:grid-cols-4">
                {steps.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStep(s.key)}
                    className={`relative rounded-xl px-4 py-3.5 text-sm font-bold transition-colors ${
                      step === s.key
                        ? 'bg-navy text-white'
                        : 'bg-white text-navy hover:bg-white/85'
                    }`}
                  >
                    {s.popular && (
                      <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-md bg-highlight px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy">
                        <Star className="size-2.5 fill-navy" /> Popular
                      </span>
                    )}
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/20 pt-6 sm:grid-cols-3">
                {sizes.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setSize(s.key)}
                    className={`relative rounded-xl px-4 py-3.5 text-sm font-bold transition-colors ${
                      size === s.key
                        ? 'bg-navy text-white'
                        : 'bg-white text-navy hover:bg-white/85'
                    }`}
                  >
                    {s.popular && (
                      <span className="absolute -top-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-md bg-highlight px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-navy">
                        <Star className="size-2.5 fill-navy" /> Popular
                      </span>
                    )}
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-white/20 pt-6">
                <StatRow
                  label="Target"
                  value={targetLabel}
                  amount={targetAmounts}
                />
                <StatRow
                  label="Daily Drawdown"
                  value={`${config.dailyDd}%`}
                  amount={usd((selectedSize.amount * config.dailyDd) / 100)}
                />
                <StatRow
                  label="Max Drawdown"
                  value={`${config.maxDd}%`}
                  amount={usd((selectedSize.amount * config.maxDd) / 100)}
                />
              </div>
            </div>
          </div>

          {/* Price card */}
          <div className="flex flex-col justify-center rounded-[2rem] bg-card p-8 text-center shadow-2xl shadow-navy/10">
            <p className="font-heading text-lg font-bold">
              <span className="text-primary">{selectedSize.label}</span>
              <span className="text-muted-foreground">{' \u00B7 '}</span>
              <span className="text-navy">{config.name}</span>
            </p>

            <p className="mt-4 flex items-end justify-center gap-3">
              <span className="pb-3 text-2xl font-semibold text-muted-foreground line-through">
                {usd(originalPrice)}
              </span>
              <span className="font-heading text-7xl font-bold text-navy">
                <span className="text-primary">$</span>
                {Math.round(price)}
              </span>
            </p>

            <div className="mt-6 flex items-stretch justify-center gap-0 overflow-hidden rounded-xl bg-highlight">
              <span className="flex items-center px-5 py-3 font-heading text-2xl font-bold text-navy">
                &minus;45%
              </span>
              <span className="my-2 w-px bg-navy/20" aria-hidden="true" />
              <span className="flex items-center px-5 py-3 text-sm font-bold leading-tight text-navy">
                +Keep 50% Profit
                <br />
                from Challenge
              </span>
            </div>

            <Link
              href="/dashboard/new-challenge"
              className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-navy px-8 py-5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
            >
              Buy Challenge
              <ArrowRight className="size-4" />
            </Link>

            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-navy">
              <Check className="size-4 text-primary" />
              150% refundable
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {paymentMethods.map((m) => (
                <span
                  key={m}
                  className="rounded border border-border bg-muted px-2 py-1 text-[9px] font-bold text-muted-foreground"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* What's included */}
        <Reveal className="mt-6 rounded-[2rem] bg-card p-8 shadow-2xl shadow-navy/10 md:p-10">
          <h3 className="font-heading text-2xl font-bold text-navy">
            What&apos;s Included
          </h3>
          <ul className="mt-6 grid grid-cols-1 gap-x-12 gap-y-4 md:grid-cols-2">
            {included.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex size-5 items-center justify-center rounded-md bg-primary/10">
                  <Check className="size-3.5 text-primary" />
                </span>
                <span className="text-sm text-navy">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 lg:flex-row">
            <p className="flex items-end gap-2">
              <span className="pb-1.5 text-lg font-semibold text-muted-foreground line-through">
                {usd(originalPrice)}
              </span>
              <span className="font-heading text-5xl font-bold text-navy">
                <span className="text-primary">$</span>
                {Math.round(price)}
              </span>
              <span className="mb-1.5 rounded-md bg-highlight px-2 py-1 text-xs font-bold text-navy">
                &minus;45%
              </span>
            </p>
            <Link
              href="/dashboard/new-challenge"
              className="flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-navy px-8 py-5 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
            >
              Buy Challenge
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-border pt-8 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Reward Guarantee',
                desc: 'Paid in 12h or doubled',
              },
              {
                icon: Lock,
                title: 'Secure Payment',
                desc: 'SSL encrypted \u00B7 PCI DSS',
              },
              {
                icon: Zap,
                title: 'Instant Access',
                desc: 'Start trading instantly',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 rounded-2xl bg-secondary px-6 py-5"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="size-5 text-primary" />
                </span>
                <div>
                  <p className="text-sm font-bold text-navy">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-8">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Payment
            </span>
            {paymentMethods.map((m) => (
              <span
                key={m}
                className="rounded-md border border-border bg-muted px-3 py-1.5 text-[10px] font-bold text-muted-foreground"
              >
                {m}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
