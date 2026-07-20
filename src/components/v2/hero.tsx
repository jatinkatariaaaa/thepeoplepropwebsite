'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight, CheckCircle2, ShieldCheck, Star } from 'lucide-react'
import { motion, Stagger, StaggerItem } from '@/components/v2/motion'

const stats = [
  { value: '$200K', label: 'Maximum allocation' },
  { value: '90%', label: 'Profit split' },
  { value: '<24h', label: 'Average payout' },
  { value: '0.0', label: 'Raw spreads' },
]

export function Hero() {
  return (
    <section className="relative min-h-[760px] overflow-hidden bg-navy px-4 pb-10 pt-28 text-primary-foreground md:pt-36">
      <Image src="/v2/images/hero-green.png" alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
      <div aria-hidden="true" className="absolute inset-0 bg-navy/80" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-40 h-64 opacity-50 [background:linear-gradient(135deg,transparent_0_8%,#2563eb_8.2%_8.5%,transparent_8.7%_19%,#2563eb_19.2%_19.5%,transparent_19.7%_31%,#2563eb_31.2%_31.5%,transparent_31.7%_48%,#2563eb_48.2%_48.5%,transparent_48.7%_61%,#2563eb_61.2%_61.5%,transparent_61.7%)] [clip-path:polygon(0_65%,12%_48%,23%_58%,35%_24%,47%_42%,58%_16%,70%_34%,82%_10%,100%_28%,100%_100%,0_100%)]" />
      <div className="relative mx-auto max-w-[1240px]">
        <div className="grid min-h-[620px] items-center gap-16 lg:grid-cols-[1.22fr_.78fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] backdrop-blur-md"><span className="size-2 rounded-full bg-highlight" />Built for the people who trade</motion.div>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1, duration: .7 }} className="mt-9 max-w-5xl text-balance font-heading text-6xl font-semibold leading-[.86] tracking-[-.065em] sm:text-7xl md:text-9xl">Capital for<br /><span className="text-primary">serious traders.</span></motion.h1>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2, duration: .7 }} className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/65 md:text-lg">Transparent rules. Real capital up to $200,000. Payouts in under 24 hours. A prop firm engineered to back disciplined traders—not work against them.</motion.p>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3, duration: .7 }} className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="#pricing" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-bold shadow-xl shadow-primary/20">Start my challenge <ArrowRight className="size-4" /></Link><Link href="#how-it-works" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-7 text-sm font-bold backdrop-blur-md">See how it works <ArrowDown className="size-4" /></Link></motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .45 }} className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-primary-foreground/65">{['No time limit', 'Free retry', '24/7 support'].map(item => <span key={item} className="flex items-center gap-2"><CheckCircle2 className="size-4 text-highlight" />{item}</span>)}</motion.div>
          </div>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .25, duration: .8 }} className="relative hidden lg:block">
            <div className="rotate-2 rounded-[2rem] border border-primary-foreground/10 bg-primary-foreground/5 p-5 shadow-2xl backdrop-blur-xl"><div className="rounded-[1.5rem] bg-card p-6 text-navy"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Funded account</p><p className="mt-2 font-heading text-3xl font-bold">$100,000</p></div><span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><ShieldCheck className="size-6" /></span></div><div className="mt-8 flex h-36 items-end gap-2">{[24,38,31,52,46,68,62,78,72,91,84,100].map((h,i)=><span key={i} className="flex-1 rounded-t bg-primary/20" style={{height:`${h}%`}}><span className="block h-1/3 rounded-t bg-primary" /></span>)}</div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-secondary p-4"><p className="text-xs text-muted-foreground">Today&apos;s profit</p><p className="mt-1 font-heading text-xl font-bold text-primary">+$2,482</p></div><div className="rounded-2xl bg-navy p-4 text-primary-foreground"><p className="text-xs text-primary-foreground/55">Profit split</p><p className="mt-1 font-heading text-xl font-bold">90%</p></div></div></div></div>
            <div className="absolute -bottom-6 -left-8 flex items-center gap-3 rounded-2xl bg-card p-4 text-navy shadow-2xl"><Star className="size-5 fill-highlight text-highlight" /><div><p className="text-sm font-bold">Trader-first conditions</p><p className="text-xs text-muted-foreground">No hidden catches</p></div></div>
          </motion.div>
        </div>
        <Stagger className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[2rem] border border-primary-foreground/10 bg-primary-foreground/10 lg:grid-cols-4">{stats.map(stat => <StaggerItem key={stat.label} className="bg-navy/80 p-6 backdrop-blur-md md:p-8"><p className="font-heading text-3xl font-bold text-primary-foreground md:text-4xl">{stat.value}</p><p className="mt-2 text-xs font-medium text-primary-foreground/50">{stat.label}</p></StaggerItem>)}</Stagger>
      </div>
    </section>
  )
}
