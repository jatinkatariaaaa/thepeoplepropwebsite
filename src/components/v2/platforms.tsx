import Link from 'next/link'
import { ArrowRight, CandlestickChart } from 'lucide-react'

export function Platforms() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8 md:py-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          08 &mdash; Platforms
        </p>
        <h2 className="mt-6 max-w-3xl text-balance font-heading text-4xl font-bold uppercase leading-[1.02] tracking-tight text-foreground md:text-6xl">
          Available trading platforms<span className="text-primary">.</span>
        </h2>

        <div className="mt-12 flex max-w-[860px] flex-col border border-foreground bg-card sm:flex-row">
          <div className="flex items-center justify-center bg-primary p-10 sm:w-48">
            <CandlestickChart
              className="size-16 text-primary-foreground"
              strokeWidth={1.5}
            />
          </div>
          <div className="flex-1 p-8">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Platform 01
            </p>
            <h3 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground">
              MetaTrader 5
            </h3>
            <p className="mt-3 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground">
              A trusted industry-standard platform with advanced charting,
              technical analysis tools, and support for automated trading.
            </p>
          </div>
        </div>

        <div className="mt-12 flex">
          <Link
            href="#pricing"
            className="group inline-flex items-center gap-2 border-b-2 border-foreground pb-1 text-sm font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Buy Challenge
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
