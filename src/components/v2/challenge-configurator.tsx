'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  Lock,
  Percent,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingDown,
  Wallet,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import { Reveal } from '@/components/v2/motion'
import {
  feeFor,
  formatSize,
  formatSizeLong,
  platforms,
  programOffersSize,
  type AccountSize,
  type PlatformKey,
  type ProgramKey,
} from '@/data/programs'
import { useHydratedPrograms } from '@/hooks/useHydratedPrograms'
import { cn } from '@/lib/utils'

const DEFAULT_PROGRAM: ProgramKey = '1-step'
const DEFAULT_SIZE: AccountSize = 25_000
const DEFAULT_PLATFORM: PlatformKey = 'tppdashboard'

const SPEC_ICONS: Record<string, LucideIcon> = {
  'Account size': Wallet,
  'Profit target': Target,
  'Max. daily loss': TrendingDown,
  'Max. overall loss': ShieldAlert,
  'Min. trading days': CalendarDays,
  'Profit split': Percent,
  'Payout cycle': FileText,
  'Consistency rule': Scale,
  'Expert advisors': Bot,
}

export function ChallengeConfigurator() {
  const [programKey, setProgramKey] = useState<ProgramKey>(DEFAULT_PROGRAM)
  const [size, setSize] = useState<AccountSize>(DEFAULT_SIZE)
  const [platformKey, setPlatformKey] = useState<PlatformKey>(DEFAULT_PLATFORM)
  const { programs: livePrograms } = useHydratedPrograms()

  const program = useMemo(
    () => livePrograms.find((p) => p.key === programKey) ?? livePrograms[0],
    [livePrograms, programKey],
  )

  const allSizes = useMemo(() => {
    const set = new Set<number>()
    livePrograms.forEach((p) =>
      Object.keys(p.fees || {}).forEach((k) => set.add(Number(k))),
    )
    return Array.from(set).sort((a, b) => a - b) as AccountSize[]
  }, [livePrograms])

  // Fall back to closest available size when the program doesn't offer it
  const effectiveSize = useMemo<AccountSize>(() => {
    if (programOffersSize(program, size)) return size
    const offered = (Object.keys(program.fees) as unknown as string[])
      .map((s) => Number(s) as AccountSize)
      .sort((a, b) => a - b)
    const lowerOrEqual = offered.filter((s) => s <= size).pop()
    return lowerOrEqual ?? offered[0]
  }, [program, size])

  const { total } = useMemo(
    () => feeFor(program, effectiveSize, []),
    [program, effectiveSize],
  )

  const specs = useMemo(() => {
    let profitTarget = program.profitTarget
    const m = program.profitTarget.match(/(\d+(?:\.\d+)?)/)
    if (m && program.phases === 1) {
      const usd = Math.round((effectiveSize * parseFloat(m[1])) / 100)
      profitTarget = `${program.profitTarget} · $${usd.toLocaleString('en-US')}`
    }
    return [
      { label: 'Account size', value: formatSizeLong(effectiveSize), strong: true },
      { label: 'Profit target', value: profitTarget },
      { label: 'Max. daily loss', value: program.dailyDrawdown },
      { label: 'Max. overall loss', value: program.maxDrawdown },
      {
        label: 'Min. trading days',
        value:
          program.key === 'instant'
            ? `${program.minTradingDays} on funded`
            : `${program.minTradingDays} per phase`,
      },
      { label: 'Profit split', value: `Up to ${program.profitSplitMax}%`, accent: true },
      { label: 'Payout cycle', value: program.payoutCycle },
      { label: 'Consistency rule', value: program.consistencyRule },
      { label: 'Expert advisors', value: 'Allowed' },
    ]
  }, [program, effectiveSize])

  return (
    <section id="pricing" className="px-4 pb-20 md:pb-28">
      <div className="mx-auto max-w-[1320px]">
        <div className="rounded-[2rem] bg-navy px-5 py-14 md:rounded-[2.5rem] md:px-12 md:py-20">
          <Reveal>
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-primary">
                Build Your Challenge
              </p>
              <h2 className="mt-4 text-balance font-heading text-4xl font-bold text-white md:text-5xl lg:text-6xl">
                Choose Your Account
              </h2>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75">
                <span className="grid size-6 place-items-center rounded-lg bg-primary">
                  <Lock className="size-3.5 text-primary-foreground" strokeWidth={2.5} />
                </span>
                Payouts Guaranteed &middot; 150% Fee Refund
              </div>
            </div>
          </Reveal>

          <div className="mt-12 grid items-start gap-5 lg:grid-cols-[1fr_minmax(0,440px)]">
            {/* LEFT — configuration cards */}
            <div className="flex flex-col gap-5">
              {/* Model */}
              <Reveal delay={0.05}>
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">
                  <h3 className="mb-4 font-heading text-lg font-bold text-white">
                    Challenge Model
                  </h3>
                  <div className="flex flex-wrap items-start gap-x-2.5 gap-y-3">
                    {livePrograms.map((p) => {
                      const active = p.key === program.key
                      return (
                        <div key={p.key} className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setProgramKey(p.key)}
                            aria-pressed={active}
                            className={cn(
                              'inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-white/[0.07] text-white hover:bg-white/[0.14]',
                            )}
                          >
                            {p.shortLabel}
                          </button>
                          {p.badge && (
                            <span className="inline-flex items-center rounded-md bg-highlight px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-white/50">
                    {program.tagline}
                  </p>
                </div>
              </Reveal>

              {/* Account size */}
              <Reveal delay={0.1}>
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">
                  <h3 className="mb-4 font-heading text-lg font-bold text-white">
                    Account Size
                  </h3>
                  <div className="flex flex-wrap items-start gap-x-2.5 gap-y-3">
                    {allSizes.map((s) => {
                      const offered = program.fees[s] != null
                      const active = s === effectiveSize && offered
                      const popular = s === 25_000
                      return (
                        <div key={s} className="flex flex-col items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => offered && setSize(s)}
                            disabled={!offered}
                            aria-pressed={active}
                            className={cn(
                              'inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold tabular-nums transition-colors',
                              !offered && 'cursor-not-allowed opacity-30',
                              active
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-white/[0.07] text-white hover:bg-white/[0.14]',
                            )}
                          >
                            {formatSize(s).replace('$', '')}
                          </button>
                          {popular && offered && (
                            <span className="inline-flex items-center rounded-md bg-highlight px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy">
                              Most Popular
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Reveal>

              {/* Platform */}
              <Reveal delay={0.15}>
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6">
                  <h3 className="mb-4 font-heading text-lg font-bold text-white">
                    Trading Platform
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {platforms.map((p) => {
                      const active = p.key === platformKey
                      const disabled = p.status === 'soon'
                      return (
                        <button
                          key={p.key}
                          type="button"
                          disabled={disabled}
                          onClick={() => !disabled && setPlatformKey(p.key)}
                          aria-pressed={active}
                          className={cn(
                            'inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors',
                            disabled && 'cursor-not-allowed opacity-50',
                            active && !disabled
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-white/[0.07] text-white hover:bg-white/[0.14]',
                          )}
                        >
                          {p.label}
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[10px] font-medium',
                              active && !disabled
                                ? 'bg-navy/70 text-white'
                                : 'bg-white/[0.08] text-white/60',
                            )}
                          >
                            {p.sub}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* RIGHT — spec + price card */}
            <Reveal delay={0.1} className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-3xl bg-card shadow-2xl shadow-black/30">
                <div className="border-b border-border px-7 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Your Challenge
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-navy">
                    {program.label} &middot; {formatSize(effectiveSize)}
                  </p>
                </div>

                <ul className="px-7 py-3">
                  {specs.map((row) => {
                    const Icon = SPEC_ICONS[row.label] ?? ShieldCheck
                    return (
                      <li
                        key={row.label}
                        className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-b-0"
                      >
                        <span className="flex items-center gap-2.5 text-muted-foreground">
                          <Icon className="size-4 text-primary" strokeWidth={2.2} />
                          {row.label}
                        </span>
                        <span
                          className={cn(
                            'text-right font-semibold text-navy',
                            row.accent && 'text-primary',
                          )}
                        >
                          {row.value}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                <div className="bg-secondary px-7 py-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        One-Time Fee
                      </p>
                      <p className="font-heading text-4xl font-bold text-navy">
                        {total != null ? `$${total.toLocaleString('en-US')}` : '—'}
                      </p>
                    </div>
                    <p className="max-w-[140px] text-right text-xs leading-snug text-muted-foreground">
                      150% refunded with your first payout
                    </p>
                  </div>
                  <Link
                    href="/dashboard/new-challenge"
                    className="group mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-primary px-6 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-[1.02]"
                  >
                    Start My Challenge
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
