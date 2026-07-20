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
    <section id="about" className="px-4 pb-20 pt-24">
      <div className="mx-auto max-w-[1320px]">
        <Reveal>
          <h2 className="max-w-4xl text-balance font-heading text-5xl font-semibold leading-[.95] text-foreground md:text-7xl">
            Why Traders Choose
            <br />
            The People <span className="text-primary">Prop</span>
          </h2>
          <p className="mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Everything traders need to trade freely, and grow with better
            conditions from day one.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 max-w-[1100px] border-y border-border bg-card">
            <Stagger
              className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4"
              staggerDelay={0.05}
            >
              {features.map((f) => (
                <StaggerItem
                  key={`${f.highlight}-${f.rest}`}
                  className="group min-h-40 bg-card px-5 py-7 transition-colors hover:bg-secondary md:px-7"
                >
                  <p className="font-heading text-xl font-semibold leading-snug text-foreground transition-colors">
                    <span className="block text-3xl text-primary transition-colors">
                      {f.highlight}
                    </span>{' '}
                    {f.rest}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 flex justify-center">
            <Link
              href="#pricing"
              className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105"
            >
              Start My Challenge Now
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
