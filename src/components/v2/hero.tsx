'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, TrendingUp } from 'lucide-react'
import { motion, Stagger, StaggerItem } from '@/components/v2/motion'

const heroStats = [
  { value: '150%', suffix: '+', label: 'Fee Refund' },
  { value: '24/7', suffix: '+', label: 'Human Support' },
  { value: '100', suffix: '%', label: 'Profit Split' },
  { value: '12h', suffix: '', label: 'Average Processing Time' },
]

export function Hero() {
  return (
    <section className="relative">
      <div className="relative flex min-h-[92vh] flex-col items-center justify-start overflow-hidden pt-36 md:pt-40">
        <Image
          src="/v2/images/hero-green.png"
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-navy/40 via-transparent to-navy/60"
        />

        {/* floating glow particles */}
        <motion.span
          aria-hidden="true"
          className="absolute left-[12%] top-[30%] size-3 rounded-full bg-primary/70 blur-[2px]"
          animate={{ y: [0, -24, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute right-[16%] top-[24%] size-2 rounded-full bg-highlight/80 blur-[1px]"
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.span
          aria-hidden="true"
          className="absolute bottom-[34%] left-[24%] size-2.5 rounded-full bg-primary/60 blur-[2px]"
          animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />

        <div className="relative z-10 flex flex-col items-center px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-3 rounded-full bg-card py-2 pl-2 pr-5 shadow-lg shadow-navy/10"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-primary">
              <TrendingUp className="size-4 text-primary-foreground" />
            </span>
            <span className="text-sm font-semibold text-navy">
              Join Active Traders
            </span>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <span className="text-sm font-bold text-navy">
              4.8<span className="font-normal text-muted-foreground">/5</span>
            </span>
            <Star className="size-4 fill-highlight text-highlight" />
            <span className="text-sm font-semibold text-navy">Excellent</span>
          </motion.div>

          <h1 className="mt-8 flex flex-wrap items-center justify-center gap-4 text-center">
            <motion.span
              initial={{ opacity: 0, x: -50, rotate: -3 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="rounded-2xl bg-navy/70 px-6 py-3 font-heading text-5xl font-bold text-white backdrop-blur-sm md:text-7xl"
            >
              The Home
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 50, rotate: 3 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="rounded-2xl bg-navy/70 px-6 py-3 font-heading text-5xl font-bold text-white backdrop-blur-sm md:text-7xl"
            >
              of Traders<span className="text-primary">.</span>
            </motion.span>
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative z-10 mt-auto pb-40 pt-16 md:pb-44"
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Link
              href="#pricing"
              className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-xl shadow-primary/40 transition-transform hover:scale-105"
            >
              Start My Challenge
              <ArrowRight className="size-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <Stagger className="relative z-20 mx-auto -mt-32 grid max-w-[1320px] grid-cols-1 gap-3 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {heroStats.map((stat) => (
          <StaggerItem
            key={stat.label}
            className="flex flex-col items-center rounded-3xl border border-border/60 bg-card px-6 py-8 text-center shadow-xl shadow-navy/10 transition-shadow hover:shadow-2xl hover:shadow-primary/15"
          >
            <p className="font-heading text-4xl font-bold text-navy">
              {stat.value}
              {stat.suffix && (
                <span className="text-primary">{stat.suffix}</span>
              )}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
