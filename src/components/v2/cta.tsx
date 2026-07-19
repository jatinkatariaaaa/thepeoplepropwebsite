'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion, Reveal } from '@/components/v2/motion'

export function Cta() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/v2/images/footer-city.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-navy/50 to-navy/80" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-48 pt-24 text-center md:pb-64 md:pt-32">
        <Reveal>
          <h2 className="text-balance text-4xl font-bold tracking-tight text-white md:text-6xl">
            Ready to start trading?
          </h2>
          <p className="mt-4 text-lg text-white/80 md:text-xl">
            Join thousands of traders.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <motion.a
            href="#pricing"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/40 transition-colors hover:bg-[#0b8a5f]"
          >
            Start your challenge
            <ArrowRight className="size-4" />
          </motion.a>
        </Reveal>
      </div>
    </section>
  )
}
