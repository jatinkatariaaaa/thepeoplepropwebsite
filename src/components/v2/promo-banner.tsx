'use client'

import Link from 'next/link'
import { Reveal } from '@/components/v2/motion'

export function PromoBanner() {
  return (
    <Reveal>
      <div className="border-b border-border bg-foreground text-background">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-5 py-10 md:px-8 md:py-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-highlight">
              Limited offer
            </p>
            <p className="mt-4 font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight md:text-6xl">
              45% off all accounts
              <br />
              <span className="text-outline">+ keep 50%</span> of challenge
              profit
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">
              Promo code
            </p>
            <p className="border border-background/30 px-5 py-2.5 font-heading text-xl font-bold tracking-[0.14em]">
              WORLDCUP45
            </p>
            <Link
              href="#pricing"
              className="bg-highlight px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </Reveal>
  )
}
