'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight, Star } from 'lucide-react'
import { motion } from '@/components/v2/motion'

const heroStats = [
  { value: '150%', label: 'Fee Refund' },
  { value: '100%', label: 'Profit Split' },
  { value: '12h', label: 'Avg. Payout Time' },
  { value: '24/7', label: 'Human Support' },
]

export function Hero() {
  return (
    <section className="px-3 pt-3">
      <div className="relative mx-auto flex min-h-[94vh] max-w-[1400px] flex-col overflow-hidden rounded-[2rem] bg-navy md:rounded-[2.5rem]">
        {/* Background image, dimmed for depth */}
        <Image
          src="/v2/images/hero-green.png"
          alt=""
          fill
          priority
          className="object-cover opacity-40"
          sizes="100vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy/30"
        />

        {/* Soft green glow */}
        <div
          aria-hidden="true"
          className="absolute -left-32 top-1/4 size-[480px] rounded-full bg-primary/25 blur-[140px]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-24 bottom-0 size-[380px] rounded-full bg-primary/15 blur-[120px]"
        />

        {/* Subtle grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(ellipse at 30% 40%, black 20%, transparent 70%)',
          }}
        />

        {/* Main content — left aligned, editorial */}
        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-16 pt-36 md:px-14 md:pt-40 lg:px-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="inline-flex w-fit items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 backdrop-blur-md"
          >
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-[13px] font-medium tracking-wide text-white/85">
              Funding traders in 150+ countries
            </span>
            <span className="h-3.5 w-px bg-white/20" aria-hidden="true" />
            <span className="flex items-center gap-1 text-[13px] font-semibold text-white">
              4.8
              <Star className="size-3.5 fill-highlight text-highlight" />
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-8 max-w-[900px] text-balance font-heading text-6xl font-bold leading-[0.95] tracking-tight text-white md:text-8xl lg:text-[6.5rem]"
          >
            The Home of <span className="text-primary">Traders</span>
            <span className="text-highlight">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-7 max-w-[540px] text-pretty text-base leading-relaxed text-white/65 md:text-lg"
          >
            Transparent rules. Real capital up to $500,000. Payouts in under 24
            hours. Built for traders &mdash; not against them.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link
              href="#pricing"
              className="group inline-flex h-13 items-center gap-3 rounded-full bg-primary py-3 pl-6 pr-2 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-[1.03]"
            >
              Start My Challenge
              <span className="flex size-8 items-center justify-center rounded-full bg-navy transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="size-4 text-primary" />
              </span>
            </Link>
            <Link
              href="/rules"
              className="inline-flex h-13 items-center rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/[0.06]"
            >
              Read the Rules
            </Link>
          </motion.div>
        </div>

        {/* Integrated stats strip — hairline dividers, part of the hero card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative z-10 border-t border-white/10 bg-navy/60 backdrop-blur-md"
        >
          <dl className="grid grid-cols-2 divide-white/10 md:grid-cols-4 md:divide-x">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 px-6 py-6 text-center md:py-8"
              >
                <dd className="font-heading text-3xl font-bold text-white md:text-4xl">
                  {stat.value.replace(/%|h$|\/7/g, '')}
                  <span className="text-primary">
                    {stat.value.match(/%|h$|\/7/)?.[0] ?? ''}
                  </span>
                </dd>
                <dt className="text-[13px] text-white/55">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  )
}
