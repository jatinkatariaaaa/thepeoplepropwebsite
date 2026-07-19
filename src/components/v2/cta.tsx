'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/v2/motion'

export function Cta() {
  return (
    <section className="border-b border-border bg-foreground text-background">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            10 &mdash; Final call
          </p>
          <h2 className="mt-8 font-heading text-[14vw] font-bold uppercase leading-[0.92] tracking-tight md:text-[8rem] lg:text-[9rem]">
            Ready to
            <br />
            <span className="text-outline">start trading</span>
            <span className="text-highlight">?</span>
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <p className="max-w-sm text-pretty text-[15px] leading-relaxed text-background/70">
              Join thousands of traders already funded by The People Prop.
              Your challenge starts the moment you do.
            </p>
            <Link
              href="#pricing"
              className="group inline-flex w-fit items-center gap-3 bg-highlight px-8 py-4 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-background"
            >
              Start your challenge
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
