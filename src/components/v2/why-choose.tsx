'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/v2/motion'

const features = [
  { highlight: '100%', rest: 'Profit Split' },
  { highlight: '150%', rest: 'Fee Refund' },
  { highlight: '12h', rest: 'Speed' },
  { highlight: '50%', rest: 'In-Challenge Trading' },
  { highlight: 'Zero', rest: 'Consistency Rules' },
  { highlight: 'First', rest: 'Loss Insurance' },
  { highlight: 'Guaranteed', rest: 'Trading' },
  { highlight: '24/7', rest: 'Human Support' },
  { highlight: 'Open', rest: 'Weekend & News' },
  { highlight: 'EAs &', rest: 'Algo Allowed' },
  { highlight: 'Free', rest: 'Challenge Reset' },
  { highlight: '\u221E', rest: 'Trading Days' },
]

export function WhyChoose() {
  return (
    <section id="why-choose" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              04 &mdash; The advantage
            </p>
            <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
              Everything traders need to trade freely, with better conditions
              from day one.
            </p>
          </div>
          <h2 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight text-foreground md:text-6xl">
            Why traders choose The People Prop
            <span className="text-primary">.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <Stagger
            className="mt-12 grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4"
            staggerDelay={0.04}
          >
            {features.map((f, i) => (
              <StaggerItem
                key={`${f.highlight}-${f.rest}`}
                className="group relative border-b border-r border-border bg-transparent px-6 py-9 transition-colors hover:bg-foreground"
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-background/50"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="mt-4 font-heading text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-background">
                  <span className="text-primary transition-colors group-hover:text-highlight">
                    {f.highlight}
                  </span>{' '}
                  {f.rest}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 flex">
            <Link
              href="#pricing"
              className="group inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Start My Challenge Now
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
