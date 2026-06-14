"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Menu } from "lucide-react";
import { Magnetic } from "@/components/ui/Animations";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Challenges", path: "/challenges" },
  { name: "Rules", path: "/rules" },
  { name: "Referrals", path: "/referral" },
  { name: "Heatmap", path: "/heatmap" },
  { name: "Contact", path: "/contact" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 h-20 w-full px-[5px] lg:h-20 lg:px-[10px]">
        <div className="relative z-20 flex h-full w-full items-center px-[10px] lg:px-[25px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group outline-none">
            <img
              src="/images/logo.webp"
              alt="TPP Logo"
              className="h-10 w-auto object-contain md:h-12 rounded-lg transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-bold text-[16px] text-white tracking-[0.02em]">The People Prop</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="absolute left-1/2 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-white/10 bg-white/[0.03] p-1.5 shadow-2xl md:backdrop-blur-md lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="relative rounded-full px-4 py-1.5 text-[13px] font-medium tracking-wide text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="relative z-30 ml-auto flex items-center gap-4 lg:gap-6">
            <Magnetic>
              <Link
                href="/login"
                className="group inline-flex h-8 items-center gap-2 rounded-full border border-white/40 pl-1 pr-3 text-[15px] text-white transition-all duration-300 hover:rounded-lg hover:border-[#cbfb45]"
              >
                <span className="h-6 w-6 shrink-0 rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-sm" />
                Dashboard
              </Link>
            </Magnetic>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative z-30 flex h-8 w-8 items-center justify-center text-white lg:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Header background */}
        <div className="absolute inset-[5px] z-10 rounded-xl bg-black/90 md:backdrop-blur-sm lg:rounded-2xl" />
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[45] bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mx-[5px] mt-24 flex flex-col items-center gap-2 rounded-2xl bg-[#0c0c0c] p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setMenuOpen(false)}
                  className="w-full rounded-xl py-3 text-center text-lg font-medium text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#cbfb45] text-[15px] font-semibold text-[#0c0c0c] transition-all hover:rounded-xl"
              >
                Dashboard
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
