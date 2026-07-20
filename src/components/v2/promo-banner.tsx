'use client'

import Link from 'next/link'
import { motion, Reveal } from '@/components/v2/motion'

export function PromoBanner() {
  return (
    <div className="mx-auto mt-4 max-w-[1320px] px-4">
      <Reveal>
      <div className="relative overflow-hidden rounded-md border border-primary/40 bg-primary shadow-2xl shadow-primary/20">
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-white/50"
          animate={{ x: ['-160px', '110vw'] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.4 }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 60% 120% at 50% 120%, rgba(255,255,255,0.35), transparent 60%), repeating-linear-gradient(115deg, transparent 0 60px, rgba(255,255,255,0.05) 60px 62px)',
          }}
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-8 lg:flex-row lg:justify-between lg:px-10">
          <span className="rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white">
            Limited Offer
          </span>

          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-8">
            <div>
              <p className="font-heading text-5xl font-bold text-white md:text-6xl">
                45% OFF
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/90">
                On All Accounts
              </p>
            </div>
            <span
              aria-hidden="true"
              className="font-heading text-3xl font-bold text-white/80"
            >
              +
            </span>
            <div>
              <p className="font-heading text-5xl font-bold text-white md:text-6xl">
                KEEP 50%
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-white/90">
                Of Your Challenge Profit
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="rounded-2xl bg-white/15 px-6 py-3 text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                Promo Code
              </p>
              <p className="font-heading text-xl font-bold tracking-wider text-white">
                WORLDCUP45
              </p>
            </div>
            <Link
              href="#pricing"
              className="w-full rounded-xl bg-white px-6 py-2.5 text-center text-sm font-bold text-[#066a49] transition-colors hover:bg-white/90"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      </Reveal>
    </div>
  )
}
