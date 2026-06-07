"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "./Logo";

interface Props {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
}

export function MobileMenu({ open, onClose, links }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] md:hidden bg-white"
        >
          <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--border)]">
            <Logo />
            <button
              type="button"
              aria-label="Close menu"
              onClick={onClose}
              className="grid place-items-center w-10 h-10 rounded-full border border-[var(--border-strong)] bg-white text-[var(--ink-950)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
            }}
            className="px-6 py-8 flex flex-col gap-1"
          >
            {links.map((l) => (
              <motion.li
                key={l.href}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  show: { opacity: 1, x: 0 },
                }}
              >
                <Link
                  href={l.href}
                  onClick={onClose}
                  className="flex items-center justify-between py-5 text-[28px] font-medium tracking-tight text-[var(--ink-950)] border-b border-[var(--border)]"
                >
                  {l.label}
                  <ArrowUpRight className="w-5 h-5 text-[var(--ink-400)]" />
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          <div className="px-6 mt-6 flex flex-col gap-3">
            <Button variant="outline" size="lg" href="/login" fullWidth>
              Sign In
            </Button>
            <Button variant="primary" size="lg" href="/challenges" fullWidth>
              Get Funded
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}