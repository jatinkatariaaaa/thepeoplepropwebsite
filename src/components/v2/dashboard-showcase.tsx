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
          <stop offset="0%" stopColor="#0e9f6e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0e9f6e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,60 C60,30 100,25 150,45 C200,65 240,85 300,80 C360,75 380,45 440,40 C500,35 540,55 600,50 L600,140 L0,140 Z"
        fill="url(#dashFill)"
      />
      <path
        d="M0,60 C60,30 100,25 150,45 C200,65 240,85 300,80 C360,75 380,45 440,40 C500,35 540,55 600,50"
        fill="none"
        stroke="#0e9f6e"
        strokeWidth="2.5"
      />
      <circle cx="150" cy="45" r="4" fill="#0e9f6e" />
      <circle cx="440" cy="40" r="4" fill="#0e9f6e" />
    </svg>
  )
}

function DashboardMock() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white text-left shadow-2xl shadow-navy/20">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="font-heading text-sm font-bold">
          <span className="text-navy">THE PEOPLE</span>{' '}
          <span className="text-primary">PROP</span>
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
          <div className="mb-2 rounded-lg border border-border px-3 py-2 text-[10px] font-medium text-muted-foreground">
            Account - 1 - MF1234567
          </div>
          <button
            type="button"
            className="mb-2 flex items-center justify-between rounded-lg bg-primary px-3 py-2 text-[10px] font-bold text-white"
          >
            New Challenge <ArrowRight className="size-3" />
          </button>
          <p className="px-2 pb-1 pt-2 text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            Main Menu
          </p>
          {sidebarMain.map((item) => (
            <span
              key={item.label}
              className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-medium ${
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
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-medium text-muted-foreground"
            >
              <LineChart className="size-3" />
              {label}
            </span>
          ))}
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[8px] font-bold text-primary">
              JC
            </span>
            <span>
              <span className="block text-[9px] font-bold text-navy">
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
            <p className="font-heading text-sm font-bold text-navy">
              Welcome back, James Carter
            </p>
            <span className="rounded-lg bg-primary px-3 py-1.5 text-[9px] font-bold text-white">
              New Challenge
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-border bg-[#f8faff] p-3"
              >
                <span className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                  <card.icon className="size-3 text-primary" />
                </span>
                <p className="mt-2 text-[9px] text-muted-foreground">
                  {card.label}
                </p>
                <p className="font-heading text-sm font-bold text-primary">
                  {card.value}
                </p>
                <p className="mt-0.5 flex items-center gap-0.5 text-[8px] text-emerald-600">
                  <ArrowUp className="size-2" />
                  {card.delta}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-navy">Payout Overview</p>
              <span className="rounded-md border border-border px-2 py-1 text-[8px] text-muted-foreground">
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
            <div className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold text-navy">
                Challenge Progress
              </p>
              <div className="mt-2 flex flex-col gap-2.5">
                {[
                  { label: 'Evaluation Phase', amount: '$82,500 / $100,000', pct: 82 },
                  { label: 'Verification Phase', amount: '$45,250 / $50,000', pct: 91 },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex justify-between text-[8px] text-muted-foreground">
                      <span className="font-semibold text-navy">
                        {row.label}
                      </span>
                      <span>{row.amount}</span>
                      <span className="font-bold text-navy">{row.pct}%</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-border">
                      <div
                        className="h-1 rounded-full bg-primary"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-navy">
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
                      <span className="font-semibold text-navy">
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
    <section className="overflow-hidden bg-gradient-to-b from-[#0b8a5f] via-[#0fae78] to-[#37c68f] px-4 py-24">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-balance font-heading text-5xl font-bold leading-tight text-white md:text-6xl">
              The Most Advanced <span className="text-white/70">Dashboard</span>{' '}
              in Prop Trading.
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-white/90">
              Built entirely in-house, our platform gives traders a faster,
              clearer, and more powerful way to manage accounts, track
              performance, and stay in control from one seamless interface.
            </p>
            <Link
              href="#pricing"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-primary shadow-xl shadow-navy/20 transition-transform hover:scale-105"
            >
              Start your challenge
              <ArrowRight className="size-4" />
            </Link>
          </Reveal>

          <motion.div
            initial={{ opacity: 0, y: 60, rotate: 4 }}
            whileInView={{ opacity: 1, y: 0, rotate: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            className="rounded-3xl bg-navy/60 p-3 backdrop-blur-sm"
          >
            <DashboardMock />
          </motion.div>
        </div>

        <div className="mt-28 text-center">
          <Reveal>
          <h2 className="text-balance font-heading text-4xl font-bold leading-tight text-white md:text-5xl">
            Everything <span className="text-white/70">traders need</span> to
            perform, in one place.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-balance leading-relaxed text-white/90">
            Explore every part of your The People Prop journey in one place,
            from account metrics, competitions, tasks, points, exclusive
            promotions, and free challenges to educational resources built to
            help you progress faster.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t
                    ? 'bg-white text-primary'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-[960px]">
            <DashboardMock />
          </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
