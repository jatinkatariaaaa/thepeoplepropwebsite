import Link from 'next/link'
import { ArrowUpRight, Check, CircleDollarSign, Gauge, Headphones, Infinity, LineChart, ShieldCheck, Sparkles, Target, Timer, TrendingUp } from 'lucide-react'
import { Reveal, Stagger, StaggerItem } from '@/components/v2/motion'

const steps = [
  { number: '01', title: 'Choose your path', copy: 'Pick Instant, 1-Step, 2-Step or 3-Step and select the account size that matches your strategy.', icon: Target },
  { number: '02', title: 'Prove your edge', copy: 'Trade with transparent targets, clear drawdown limits and no hidden time pressure.', icon: LineChart },
  { number: '03', title: 'Get funded. Get paid.', copy: 'Trade funded capital and keep up to 90% of the profit, with payouts processed in under 24 hours.', icon: CircleDollarSign },
]

const advantages = [
  { icon: Gauge, title: 'Raw execution', value: '0.0 pip', copy: 'Institutional-grade conditions designed to keep your strategy intact.' },
  { icon: Infinity, title: 'Trade your timeline', value: 'No limit', copy: 'No artificial 30-day deadline. Take the trades that fit your plan.' },
  { icon: Timer, title: 'Payout speed', value: '<24h', copy: 'Request your payout on demand instead of waiting for a fixed window.' },
  { icon: TrendingUp, title: 'Built to scale', value: '$200K', copy: 'Grow your allocation with free retries and a trader-first scaling path.' },
]

const faqs = [
  ['What is The People Prop?', 'The People Prop is a proprietary trading firm that gives skilled traders access to funded accounts after they meet the objectives of their selected evaluation.'],
  ['Which challenge should I choose?', 'Choose based on your trading style and preferred evaluation structure. Instant, 1-Step, 2-Step and 3-Step options are available, with the full targets and drawdown rules shown before purchase.'],
  ['Is there a time limit?', 'No. You can work toward your target without a 30-day deadline, so your process does not have to change to fit an arbitrary clock.'],
  ['How much profit can I keep?', 'Funded traders can keep up to 90% of their profits. The exact conditions for your selected account are shown in the challenge details.'],
  ['Which platforms can I use?', 'The current platform lineup includes MetaTrader 5, DXtrade and the TPP Terminal. Platform availability may vary by challenge.'],
  ['Can I trade news, weekends or use EAs?', 'The available programs support flexible trading, including news, weekends, EAs and algorithmic strategies where stated in the selected challenge rules.'],
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <Reveal className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">A clearer route to capital</p>
            <h2 className="mt-4 text-balance font-heading text-4xl font-bold tracking-tight text-navy md:text-6xl">Your skill. Our capital.<br />One fair process.</h2>
          </div>
          <p className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground">No maze of fine print. Choose a model, demonstrate disciplined trading, and move into a funded account.</p>
        </Reveal>
        <Stagger className="mt-12 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <StaggerItem key={step.number} className={`group flex min-h-80 flex-col rounded-[2rem] border border-border bg-card p-7 shadow-lg shadow-navy/5 transition-transform hover:-translate-y-1 md:p-9 ${index === 1 ? 'lg:translate-y-8' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-primary">{step.number}</span>
                <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary"><step.icon className="size-5" aria-hidden="true" /></span>
              </div>
              <div className="mt-auto pt-16">
                <h3 className="font-heading text-2xl font-bold text-navy">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

export function TraderAdvantage() {
  return (
    <section id="rules" className="bg-navy px-4 py-24 text-primary-foreground md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <Reveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-highlight">The TPP standard</p>
            <h2 className="mt-4 text-balance font-heading text-4xl font-bold tracking-tight md:text-6xl">Rules that protect discipline, not punish it.</h2>
          </div>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/65 lg:justify-self-end">Built as the alternative to marked-up spreads, rushed deadlines, fixed payout windows and paid resets.</p>
        </Reveal>
        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((item) => (
            <StaggerItem key={item.title} className="flex min-h-72 flex-col rounded-[2rem] border border-primary-foreground/10 bg-navy-soft p-7">
              <item.icon className="size-6 text-highlight" aria-hidden="true" />
              <p className="mt-10 font-heading text-4xl font-bold text-primary-foreground">{item.value}</p>
              <h3 className="mt-4 font-heading text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/55">{item.copy}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-8 flex flex-col items-start justify-between gap-6 rounded-[2rem] bg-primary p-7 text-primary-foreground md:flex-row md:items-center md:p-10">
          <div className="flex items-start gap-4"><ShieldCheck className="mt-1 size-7 shrink-0" aria-hidden="true" /><div><h3 className="font-heading text-2xl font-bold">Every rule, visible before you trade.</h3><p className="mt-2 text-sm text-primary-foreground/75">Review the complete trading parameters and choose with confidence.</p></div></div>
          <Link href="/rules" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-bold text-primary-foreground">Explore all rules <ArrowUpRight className="size-4" aria-hidden="true" /></Link>
        </Reveal>
      </div>
    </section>
  )
}

export function ProofAndFaq() {
  return (
    <>
      <section id="proof" className="px-4 py-24 md:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-4 lg:grid-cols-12">
          <Reveal className="flex min-h-96 flex-col rounded-[2rem] bg-primary p-8 text-primary-foreground lg:col-span-7 md:p-12">
            <Sparkles className="size-7" aria-hidden="true" />
            <p className="mt-auto font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/70">Trader-first by design</p>
            <h2 className="mt-4 max-w-2xl text-balance font-heading text-4xl font-bold tracking-tight md:text-6xl">Keep more of what your skill creates.</h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/75">Up to 90% profit split, transparent evaluation rules and payouts built around the trader—not the calendar.</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            {[['90%', 'Profit split'], ['24h', 'Average payout'], ['$200K', 'Max allocation']].map(([value, label], index) => (
              <Reveal key={label} delay={index * 0.08} className="flex min-h-36 items-end justify-between rounded-[2rem] border border-border bg-card p-7 shadow-lg shadow-navy/5">
                <p className="text-sm font-semibold text-muted-foreground">{label}</p><p className="font-heading text-4xl font-bold text-navy md:text-5xl">{value}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section id="faq" className="bg-secondary px-4 py-24 md:py-32">
        <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <Reveal><p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">FAQ</p><h2 className="mt-4 text-balance font-heading text-4xl font-bold tracking-tight text-navy md:text-6xl">Straight answers.<br />No small print.</h2><p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">Still need help? Our support team is available around the clock.</p><Link href="/contact" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-bold text-primary-foreground"><Headphones className="size-4" aria-hidden="true" /> Contact support</Link></Reveal>
          <Reveal className="flex flex-col gap-3">
            {faqs.map(([question, answer], index) => (
              <details key={question} open={index === 0} className="group rounded-2xl border border-border bg-card px-6 py-1 shadow-sm">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-4 font-heading text-base font-bold text-navy focus-visible:outline-none">{question}<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-transform group-open:rotate-45">+</span></summary>
                <p className="pb-6 pr-10 text-sm leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}

export function FinalCta() {
  return <section id="contact" className="px-4 py-8"><Reveal className="mx-auto flex max-w-[1240px] flex-col items-center overflow-hidden rounded-[2.5rem] bg-navy px-6 py-20 text-center text-primary-foreground md:py-28"><span className="flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-4 py-2 text-xs font-bold uppercase tracking-widest"><Check className="size-4 text-highlight" /> Transparent. Flexible. Trader-first.</span><h2 className="mt-7 max-w-4xl text-balance font-heading text-5xl font-bold tracking-tight md:text-7xl">Your next funded account starts here.</h2><p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/65">Choose your challenge, trade your strategy and build the track record your skill deserves.</p><div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row"><Link href="#pricing" className="inline-flex min-h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-bold">Start my challenge <ArrowUpRight className="size-4" /></Link><Link href="/rules" className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full border border-primary-foreground/20 px-7 text-sm font-bold">Read the rules</Link></div></Reveal></section>
}
