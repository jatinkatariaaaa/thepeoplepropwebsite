'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

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
      className={`font-heading text-xl font-bold tracking-tight ${className}`}
    >
      <span className="text-navy">ThePeople</span>
      <span className="text-primary">/Prop</span>
    </span>
  )
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <Link
          href="/v2"
          className="flex items-center rounded-2xl bg-card px-6 py-3.5 shadow-lg shadow-navy/5"
        >
          <Logo />
        </Link>

        <div className="hidden items-center gap-2 rounded-2xl bg-card py-2 pl-6 pr-2 shadow-lg shadow-navy/5 lg:flex">
          <nav aria-label="Main" className="flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-navy transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <span aria-hidden="true" className="mx-2 h-6 w-px bg-border" />
          <Link
            href="#login"
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-muted"
          >
            Log In
          </Link>
          <Link
            href="#pricing"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#0b8a5f]"
          >
            Start My Challenge
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex size-12 items-center justify-center rounded-2xl bg-card text-navy shadow-lg shadow-navy/5 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-[1400px] rounded-2xl bg-card p-4 shadow-lg shadow-navy/10 lg:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-navy hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                href="#login"
                className="rounded-xl border border-border px-5 py-2.5 text-center text-sm font-semibold text-navy"
              >
                Log In
              </Link>
              <Link
                href="#pricing"
                className="rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-semibold text-primary-foreground"
              >
                Start My Challenge
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
