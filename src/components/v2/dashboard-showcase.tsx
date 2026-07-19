'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, Reveal } from '@/components/v2/motion'
import {
  ArrowRight,
  ArrowUp,
  Award,
  Bell,
  CheckCircle2,
  CreditCard,
  Gift,
  Home,
  LineChart,
  Tag,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'

const tabs = ['Home Page', 'Statistics', 'Certificates'] as const

const statCards = [
  { icon: Wallet, label: 'Total Payouts', value: '$248,750', delta: '12.5% vs last 7 days' },
  { icon: Users, label: 'Active Accounts', value: '3', delta: '1 vs last 7 days' },
  { icon: Trophy, label: 'Challenges Passed', value: '27', delta: '8 vs last 7 days' },
  { icon: Award, label: 'Funded Accounts', value: '96', delta: '15.8% vs last 7 days' },
]

const sidebarMain = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: Gift, label: 'Rewards', badge: '12' },
  { icon: CreditCard, label: 'Payouts' },
  { icon: CheckCircle2, label: 'Challenges' },
  { icon: Trophy, label: 'Leaderboard' },
  { icon: Tag, label: 'Offers', badge: '9' },
]

const GREEN = '#1c5b38'

function ChartArea() {
  return (
    <svg
      viewBox="0 0 600 140"
      className="h-28 w-full md:h-36"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GREEN} stopOpacity="0.25" />
          <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,60 C60,30 100,25 150,45 C200,65 240,85 300,80 C360,75 380,45 440,40 C500,35 540,55 600,50 L600,140 L0,140 Z"
        fill="url(#dashFill)"
      />
      <path
        d="M0,60 C60,30 100,25 150,45 C200,65 240,85 300,80 C360,75 380,45 440,40 C500,35 540,55 600,50"
        fill="none"
        stroke={GREEN}
        strokeWidth="2.5"
      />
      <circle cx="150" cy="45" r="4" fill={GREEN} />
      <circle cx="440" cy="40" r="4" fill={GREEN} />
    </svg>
  )
}

function DashboardMock() {
  return (
    <div className="overflow-hidden border border-border bg-white text-left">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="font-heading text-sm font-bold uppercase tracking-tight">
          <span className="text-foreground">ThePeople</span>
          <span className="text-primary">/Prop</span>
        </span>
        <span className="relative">
          <Bell className="size-4 text-muted-foreground" />
          <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[7px] font-bold text-white">
            12
          </span>
        </span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border p-3 sm:flex">
          <div className="mb-2 border border-border px-3 py-2 text-[10px] font-medium text-muted-foreground">
            Account - 1 - MF1234567
          </div>
          <button
            type="button"
            className="mb-2 flex items-center justify-between bg-primary px-3 py-2 text-[10px] font-bold text-white"
          >
            New Challenge <ArrowRight className="size-3" />
          </button>
          <p className="px-2 pb-1 pt-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            Main Menu
          </p>
          {sidebarMain.map((item) => (
            <span
              key={item.label}
              className={`flex items-center justify-between px-3 py-1.5 text-[10px] font-medium ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                <item.icon className="size-3" />
                {item.label}
              </span>
              {item.badge && (
                <span className="rounded-full bg-primary px-1.5 text-[7px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </span>
          ))}
          <p className="px-2 pb-1 pt-3 text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            Analytics
          </p>
          {['Performance', 'Certificates', 'Competitions'].map((label) => (
            <span
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-medium text-muted-foreground"
            >
              <LineChart className="size-3" />
              {label}
            </span>
          ))}
          <div className="mt-3 flex items-center gap-2 border border-border px-3 py-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
              JC
            </span>
            <span>
              <span className="block text-[9px] font-bold text-foreground">
                James Carter
              </span>
              <span className="block text-[8px] text-muted-foreground">
                Trader
              </span>
            </span>
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between">
            <p className="font-heading text-sm font-bold text-foreground">
              Welcome back, James Carter
            </p>
            <span className="bg-primary px-3 py-1.5 text-[9px] font-bold text-white">
              New Challenge
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="border border-border bg-[#f7f6f2] p-3"
              >
                <span className="flex size-6 items-center justify-center bg-primary/10">
                  <card.icon className="size-3 text-primary" />
                </span>
                <p className="mt-2 text-[9px] text-muted-foreground">
                  {card.label}
                </p>
                <p className="font-heading text-sm font-bold text-primary">
                  {card.value}
                </p>
                <p className="mt-0.5 flex items-center gap-0.5 text-[8px] text-emerald-700">
                  <ArrowUp className="size-2" />
                  {card.delta}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-foreground">
                Payout Overview
              </p>
              <span className="border border-border px-2 py-1 text-[8px] text-muted-foreground">
                Last 7 Days
              </span>
            </div>
            <ChartArea />
            <div className="flex justify-between text-[7px] text-muted-foreground">
              {['May 12', 'May 13', 'May 14', 'May 15', 'May 16', 'May 17', 'May 18'].map(
                (d) => (
                  <span key={d}>{d}</span>
                ),
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-2">
            <div className="border border-border p-3">
              <p className="text-[10px] font-bold text-foreground">
                Challenge Progress
              </p>
              <div className="mt-2 flex flex-col gap-2.5">
                {[
                  { label: 'Evaluation Phase', amount: '$82,500 / $100,000', pct: 82 },
                  { label: 'Verification Phase', amount: '$45,250 / $50,000', pct: 91 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {row.label}
                      </span>
                      <span>{row.amount}</span>
                      <span className="font-bold text-foreground">
                        {row.pct}%
                      </span>
                    </div>
                    <div className="mt-1 h-1 bg-border">
                      <div
                        className="h-1 bg-primary"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-foreground">
                  Recent Payouts
                </p>
                <span className="text-[8px] font-bold text-primary">
                  View All
                </span>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {[
                  { name: 'Alex Thompson', id: '#MF83921', date: 'May 18, 2024', amount: '$4,250.00' },
                  { name: 'Jordan Smith', id: '#MF83920', date: 'May 17, 2024', amount: '$3,180.00' },
                ].map((row) => (
                  <div
                    key={row.id}
                    className="flex items-center justify-between text-[8px]"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary">
                        {row.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      <span className="font-semibold text-foreground">
                        {row.name}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      Payout {row.id}
                    </span>
                    <span className="text-muted-foreground">{row.date}</span>
                    <span className="font-bold text-primary">
                      {row.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardShowcase() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Home Page')

  return (
    <section className="border-b border-border bg-foreground text-background">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
              07 &mdash; The platform
            </p>
            <h2 className="mt-6 text-balance font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight md:text-6xl">
              The most advanced{' '}
              <span className="text-outline">dashboard</span> in prop trading
              <span className="text-highlight">.</span>
            </h2>
            <p className="mt-6 max-w-lg text-pretty text-[15px] leading-relaxed text-background/70">
              Built entirely in-house, our platform gives traders a faster,
              clearer, and more powerful way to manage accounts, track
              performance, and stay in control from one seamless interface.
            </p>
            <Link
              href="#pricing"
              className="group mt-8 inline-flex items-center gap-2 border-b-2 border-background pb-1 text-sm font-bold uppercase tracking-[0.14em] text-background transition-colors hover:border-highlight hover:text-highlight"
            >
              Start your challenge
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="border border-background/20 bg-background/5 p-2.5"
          >
            <DashboardMock />
          </motion.div>
        </div>

        <div className="mt-24 md:mt-32">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 className="max-w-2xl text-balance font-heading text-3xl font-bold uppercase leading-[1.05] tracking-tight md:text-5xl">
                Everything traders need to perform, in one place
                <span className="text-highlight">.</span>
              </h2>
              <p className="max-w-md text-pretty text-sm leading-relaxed text-background/60">
                Account metrics, competitions, tasks, points, exclusive
                promotions, free challenges, and educational resources built to
                help you progress faster.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`border px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                    tab === t
                      ? 'border-background bg-background text-foreground'
                      : 'border-background/30 text-background/70 hover:border-background hover:text-background'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-10 border border-background/20 bg-background/5 p-2.5">
              <DashboardMock />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
