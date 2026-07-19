'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Rules', href: '#rules' },
  { label: 'About', href: '#about' },
  { label: 'Affiliate', href: '#affiliate' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`font-heading text-lg font-bold uppercase tracking-tight ${className}`}
    >
      ThePeople<span className="text-primary">/</span>Prop
      <span className="align-super text-[9px] font-medium tracking-normal">
        {' '}
        &reg;
      </span>
    </span>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Top micro row */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-3 md:px-8">
        <Link href="/v2" className="text-foreground">
          <Logo />
        </Link>
        <p className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground md:block">
          Funded capital &mdash; up to $500K
        </p>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground">
          Rated 4.8 / 5
        </p>
      </div>

      {/* Nav row */}
      <div className="hidden border-t border-border lg:block">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 md:px-8">
          <nav aria-label="Main" className="flex items-center">
            <Link
              href="#pricing"
              className="border-r border-border py-3 pr-6 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-primary"
            >
              Start Challenge
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-6 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center">
            <Link
              href="#login"
              className="flex items-center gap-1.5 border-l border-border py-3 pl-6 text-[12px] font-bold uppercase tracking-[0.14em] text-foreground transition-colors hover:text-primary"
            >
              Log In
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="absolute right-4 top-2.5 flex size-9 items-center justify-center text-foreground lg:hidden"
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-border px-5 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex">
              <Link
                href="#login"
                onClick={() => setOpen(false)}
                className="flex-1 border-r border-border px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-foreground"
              >
                Log In
              </Link>
              <Link
                href="#pricing"
                onClick={() => setOpen(false)}
                className="flex-1 bg-foreground px-5 py-4 text-center text-sm font-bold uppercase tracking-[0.14em] text-background"
              >
                Start
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
