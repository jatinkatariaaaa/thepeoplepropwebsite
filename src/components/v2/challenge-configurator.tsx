'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
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

function OptionButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-2 border px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors',
        disabled && 'cursor-not-allowed opacity-30',
        active
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-transparent text-foreground hover:border-foreground',
      )}
    >
      {children}
    </button>
  )
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
      { label: 'Account size', value: formatSizeLong(effectiveSize) },
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
      {
        label: 'Profit split',
        value: `Up to ${program.profitSplitMax}%`,
        accent: true,
      },
      { label: 'Payout cycle', value: program.payoutCycle },
      { label: 'Consistency rule', value: program.consistencyRule },
      { label: 'Expert advisors', value: 'Allowed' },
    ]
  }, [program, effectiveSize])

  return (
    <section id="pricing" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              03 &mdash; Build your challenge
            </p>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Payouts guaranteed &middot; 150% fee refund
            </p>
          </div>
          <h2 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight text-foreground md:text-6xl">
            Choose your account<span className="text-primary">.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_minmax(0,440px)] lg:gap-14">
          {/* LEFT — configuration */}
          <div className="flex flex-col">
            {/* Model */}
            <Reveal delay={0.05}>
              <div className="border-t border-border py-7">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
                    A &mdash; Challenge model
                  </h3>
                </div>
                <div className="mt-5 flex flex-wrap items-start gap-x-2.5 gap-y-3">
                  {livePrograms.map((p) => {
                    const active = p.key === program.key
                    return (
                      <div
                        key={p.key}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <OptionButton
                          active={active}
                          onClick={() => setProgramKey(p.key)}
                        >
                          {p.shortLabel}
                        </OptionButton>
                        {p.badge && (
                          <span className="inline-flex items-center bg-highlight px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-foreground">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p className="mt-4 max-w-[520px] text-sm leading-relaxed text-muted-foreground">
                  {program.tagline}
                </p>
              </div>
            </Reveal>

            {/* Account size */}
            <Reveal delay={0.1}>
              <div className="border-t border-border py-7">
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
                  B &mdash; Account size
                </h3>
                <div className="mt-5 flex flex-wrap items-start gap-x-2.5 gap-y-3">
                  {allSizes.map((s) => {
                    const offered = program.fees[s] != null
                    const active = s === effectiveSize && offered
                    const popular = s === 25_000
                    return (
                      <div
                        key={s}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <OptionButton
                          active={active}
                          disabled={!offered}
                          onClick={() => offered && setSize(s)}
                        >
                          <span className="tabular-nums">{formatSize(s)}</span>
                        </OptionButton>
                        {popular && offered && (
                          <span className="inline-flex items-center bg-highlight px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-foreground">
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
              <div className="border-b border-t border-border py-7">
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground">
                  C &mdash; Trading platform
                </h3>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {platforms.map((p) => {
                    const active = p.key === platformKey
                    const disabled = p.status === 'soon'
                    return (
                      <OptionButton
                        key={p.key}
                        active={active && !disabled}
                        disabled={disabled}
                        onClick={() => !disabled && setPlatformKey(p.key)}
                      >
                        {p.label}
                        <span
                          className={cn(
                            'font-mono text-[9px] font-medium uppercase tracking-[0.1em]',
                            active && !disabled
                              ? 'text-background/70'
                              : 'text-muted-foreground',
                          )}
                        >
                          {p.sub}
                        </span>
                      </OptionButton>
                    )
                  })}
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT — spec + price card */}
          <Reveal delay={0.1} className="lg:sticky lg:top-32">
            <div className="border border-foreground bg-card">
              <div className="flex items-baseline justify-between gap-4 border-b border-border px-6 py-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Your challenge
                </p>
                <p className="font-heading text-lg font-bold text-foreground">
                  {program.label} &middot; {formatSize(effectiveSize)}
                </p>
              </div>

              <ul className="px-6 py-2">
                {specs.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-b-0"
                  >
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                      {row.label}
                    </span>
                    <span
                      className={cn(
                        'text-right font-semibold text-foreground',
                        row.accent && 'text-primary',
                      )}
                    >
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-foreground px-6 py-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      One-time fee
                    </p>
                    <p className="mt-1 font-heading text-5xl font-bold tracking-tight text-foreground">
                      {total != null
                        ? `$${total.toLocaleString('en-US')}`
                        : '—'}
                    </p>
                  </div>
                  <p className="max-w-[150px] text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.1em] text-muted-foreground">
                    150% refunded with your first payout
                  </p>
                </div>
                <Link
                  href="/dashboard/new-challenge"
                  className="group mt-6 flex w-full items-center justify-center gap-2.5 bg-primary px-6 py-4 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-foreground hover:text-background"
                >
                  Start My Challenge
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
