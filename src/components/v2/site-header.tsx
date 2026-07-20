'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Challenges', href: '#pricing' },
  { label: 'Rules', href: '#rules' },
  { label: 'Platforms', href: '#platforms' },
  { label: 'FAQ', href: '#faq' },
]

export function Logo({ className = '' }: { className?: string }) {
  return <span className={`font-heading text-xl font-bold tracking-tight text-foreground ${className}`}>ThePeople<span className="text-primary">/Prop</span></span>
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  useEffect(() => { if (!open) return; const close = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-4 md:pt-4">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between rounded-md border border-border/70 bg-card/85 px-3 py-2 shadow-2xl shadow-navy/40 backdrop-blur-xl md:px-4">
        <Link href="/v2" aria-label="The People Prop home" className="rounded-xl px-2 py-2"><Logo /></Link>
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">{navLinks.map(link => <Link key={link.label} href={link.href} className="rounded-xl px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-primary">{link.label}</Link>)}</nav>
        <div className="hidden items-center gap-2 sm:flex"><Link href="/login" className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-bold text-foreground hover:bg-secondary">Log in</Link><Link href="#pricing" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground">Get funded <ArrowUpRight className="size-4" /></Link></div>
        <button type="button" onClick={() => setOpen(value => !value)} className="flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground lg:hidden sm:ml-2" aria-expanded={open} aria-controls="v2-mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </div>
      {open && <div id="v2-mobile-menu" className="mx-auto mt-2 max-w-[1240px] rounded-2xl border border-border bg-card p-3 shadow-2xl lg:hidden"><nav aria-label="Mobile navigation" className="flex flex-col gap-1">{navLinks.map(link => <Link key={link.label} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-secondary">{link.label}</Link>)}<div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3"><Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border text-sm font-bold text-foreground">Log in</Link><Link href="#pricing" onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">Get funded</Link></div></nav></div>}
    </header>
  )
}
