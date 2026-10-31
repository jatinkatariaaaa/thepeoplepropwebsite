'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Mail, MessageCircle, Send } from 'lucide-react'
import { motion, Reveal } from '@/components/v2/motion'

function XMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Z" />
    </svg>
  )
}

function DiscordMark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 127 96"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15ZM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69Zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69Z" />
    </svg>
  )
}

const orbitIcons = [
  { icon: Mail, className: 'left-[16%] top-[8%] text-red-500' },
  { icon: Mail, className: 'right-[14%] top-[16%] text-primary' },
  { icon: Send, className: 'right-[8%] top-[52%] text-sky-500' },
  { icon: XMark, className: 'bottom-[10%] right-[26%] text-navy' },
  { icon: MessageCircle, className: 'bottom-[6%] left-[38%] text-indigo-500' },
  { icon: MessageCircle, className: 'left-[8%] top-[48%] text-primary' },
]

export function Community() {
  return (
    <section id="contact" className="px-4 py-24">
      <div className="mx-auto max-w-[1220px]">
        <Reveal>
          <h2 className="text-balance text-center font-heading text-5xl font-bold text-navy md:text-6xl">
            Join Our <span className="text-primary">Community</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-balance text-center leading-relaxed text-muted-foreground">
            Connect with thousands of traders, get real-time support, and find
            answers to your questions.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Support card */}
          <div className="flex flex-col items-center rounded-[2rem] border border-border bg-card px-8 py-12 text-center shadow-xl shadow-navy/5">
            <div className="relative flex aspect-square w-full max-w-[420px] items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-[6%] rounded-full border border-border"
              />
              <span
                aria-hidden="true"
                className="absolute inset-[18%] rounded-full border border-primary/20"
              />
              <div className="relative size-[52%] overflow-hidden rounded-full border-4 border-primary/20">
                <Image
                  src="/v2/images/support-agent.png"
                  alt="The People Prop support agent wearing a headset"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 60vw, 260px"
                />
              </div>
              {orbitIcons.map((item, i) => (
                <motion.span
                  key={i}
                  className={`absolute flex size-11 items-center justify-center rounded-2xl bg-card shadow-lg shadow-navy/10 ${item.className}`}
                  aria-hidden="true"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3 + (i % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                >
                  <item.icon className="size-5" />
                </motion.span>
              ))}
            </div>

            <h3 className="mt-6 font-heading text-3xl font-bold text-navy">
              24/7 Human Support
            </h3>
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              We&apos;re always here to help.{' '}
              <strong className="text-navy">
                Check our FAQ for quick answers
              </strong>{' '}
              or reach out to our dedicated support team via human live chat,
              discord, email, or social media.
            </p>

            <div className="mt-8 flex gap-3">
              <Link
                href="#faq"
                className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-[#0b8a5f]"
              >
                FAQ
              </Link>
              <Link
                href="#contact"
                className="rounded-full border border-border px-8 py-3 text-sm font-bold text-navy transition-colors hover:bg-muted"
              >
                Live Chat
              </Link>
            </div>
          </div>

          {/* Discord card */}
          <div className="relative flex flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#14b47e] to-[#0a7a53] px-8 py-12 shadow-xl shadow-primary/20">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2"
            >
              <span className="absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
              <span className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
              <DiscordMark className="relative size-56 text-white/30 md:size-72" />
            </span>

            <div className="relative z-10 mt-72">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/90">
                <span className="size-2.5 rounded-full bg-white/70" />
                Join the Community
              </p>
              <h3 className="mt-4 font-heading text-5xl font-bold text-white">
                Never trade alone.
              </h3>
              <Link
                href="#discord"
                className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <DiscordMark className="size-5" />
                Join our Discord
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
