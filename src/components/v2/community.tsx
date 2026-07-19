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
  { icon: Mail, className: 'left-[16%] top-[8%]' },
  { icon: Mail, className: 'right-[14%] top-[16%] text-primary' },
  { icon: Send, className: 'right-[8%] top-[52%]' },
  { icon: XMark, className: 'bottom-[10%] right-[26%]' },
  { icon: MessageCircle, className: 'bottom-[6%] left-[38%] text-primary' },
  { icon: MessageCircle, className: 'left-[8%] top-[48%]' },
]

export function Community() {
  return (
    <section id="contact" className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            09 &mdash; Community
          </p>
          <h2 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight text-foreground md:text-6xl">
            Never trade alone<span className="text-primary">.</span>
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-[15px] leading-relaxed text-muted-foreground">
            Connect with thousands of traders, get real-time support, and find
            answers to your questions.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 border border-foreground lg:grid-cols-2">
          {/* Support panel */}
          <div className="flex flex-col items-center border-b border-foreground bg-card px-8 py-12 text-center lg:border-b-0 lg:border-r">
            <div className="relative flex aspect-square w-full max-w-[380px] items-center justify-center">
              <span
                aria-hidden="true"
                className="absolute inset-[6%] rounded-full border border-border"
              />
              <span
                aria-hidden="true"
                className="absolute inset-[18%] rounded-full border border-primary/30"
              />
              <div className="relative size-[52%] overflow-hidden rounded-full border-2 border-foreground">
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
                  className={`absolute flex size-10 items-center justify-center border border-border bg-background text-foreground ${item.className}`}
                  aria-hidden="true"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3 + (i % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.4,
                  }}
                >
                  <item.icon className="size-4.5" />
                </motion.span>
              ))}
            </div>

            <h3 className="mt-6 font-heading text-3xl font-bold tracking-tight text-foreground">
              24/7 Human Support
            </h3>
            <p className="mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">
              We&apos;re always here to help.{' '}
              <strong className="text-foreground">
                Check our FAQ for quick answers
              </strong>{' '}
              or reach out to our dedicated support team via human live chat,
              discord, email, or social media.
            </p>

            <div className="mt-8 flex gap-3">
              <Link
                href="#faq"
                className="bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-[0.12em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                FAQ
              </Link>
              <Link
                href="#contact"
                className="border border-foreground px-8 py-3 text-sm font-bold uppercase tracking-[0.12em] text-foreground transition-colors hover:bg-secondary"
              >
                Live Chat
              </Link>
            </div>
          </div>

          {/* Discord panel */}
          <div className="relative flex flex-col justify-end overflow-hidden bg-foreground px-8 py-12 text-background">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2"
            >
              <span className="absolute left-1/2 top-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-background/10" />
              <span className="absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-background/15" />
              <DiscordMark className="relative size-56 text-background/15 md:size-72" />
            </span>

            <div className="relative z-10 mt-64">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-highlight">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-highlight"
                />
                Join the community
              </p>
              <h3 className="mt-4 font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight md:text-5xl">
                Trade alongside thousands<span className="text-highlight">.</span>
              </h3>
              <Link
                href="#discord"
                className="mt-8 inline-flex items-center gap-3 border border-background/40 px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-background transition-colors hover:bg-background hover:text-foreground"
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
