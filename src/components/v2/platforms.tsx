import Link from 'next/link'
import { ArrowRight, CandlestickChart } from 'lucide-react'

export function Platforms() {
  return (
    <section className="px-4 py-24">
      <div className="mx-auto max-w-[1180px]">
        <h2 className="text-balance text-center font-heading text-5xl font-bold text-navy md:text-6xl">
          Available <span className="text-primary">Trading</span> Platforms
        </h2>

        <div className="mx-auto mt-14 flex max-w-[720px] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-navy/10 sm:flex-row">
          <div className="flex items-center justify-center bg-primary p-10 sm:w-44">
            <span className="flex size-24 items-center justify-center rounded-full bg-white/15">
              <CandlestickChart className="size-12 text-white" />
            </span>
          </div>
          <div className="p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Platform
            </p>
            <h3 className="mt-2 font-heading text-3xl font-bold text-navy">
              MetaTrader 5
            </h3>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              A trusted industry-standard platform with advanced charting,
              technical analysis tools, and support for automated trading.
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="#pricing"
            className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-bold text-primary-foreground shadow-xl shadow-primary/30 transition-transform hover:scale-105"
          >
            Buy Challenge
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
