import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from '@/components/v2/site-header'

const groups = [
  { title: 'Discover', links: [['Challenges', '#pricing'], ['How it works', '#how-it-works'], ['Trading rules', '/rules'], ['Reviews', '/reviews']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Press', '/press'], ['Careers', '/careers']] },
  { title: 'Legal', links: [['Terms', '/terms'], ['Privacy', '/privacy'], ['Cookie policy', '/cookie'], ['Risk disclosure', '/risk-disclosure']] },
]

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-background px-4">
      <div className="mx-auto max-w-[1240px] py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div><Link href="/v2" aria-label="The People Prop home"><Logo /></Link><p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">A trader-first prop firm built around transparent rules, flexible evaluation models and fast payouts.</p><Link href="/contact" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-navy px-6 text-sm font-bold text-primary-foreground">Talk to support <ArrowUpRight className="size-4" /></Link></div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{groups.map(group => <div key={group.title}><h2 className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-navy">{group.title}</h2><ul className="mt-5 flex flex-col gap-3">{group.links.map(([label, href]) => <li key={label}><Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-primary">{label}</Link></li>)}</ul></div>)}</div>
        </div>
        <div className="mt-14 border-t border-border pt-8">
          <p className="text-xs font-semibold text-navy">© 2026 The People Prop. All rights reserved.</p>
          <div className="mt-5 grid gap-4 text-[11px] leading-relaxed text-muted-foreground/80 md:grid-cols-2"><p>Clients are provided with demo accounts containing simulated funds. All trading operations are conducted in a simulated environment. The People Prop is not a financial institution and does not promote or sell financial products or services.</p><p>Simulated trading carries substantial risk. Past performance is not indicative of future results. All website content is educational and should not be construed as investment advice. BLUEWAVE DIGITAL EDUCATION - FZCO, Dubai, UAE, acts solely as the technology and platform provider.</p></div>
        </div>
      </div>
    </footer>
  )
}
