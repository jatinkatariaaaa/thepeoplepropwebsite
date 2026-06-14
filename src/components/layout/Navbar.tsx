"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Challenges", path: "/challenges" },
    { name: "Rules", path: "/rules" },
    { name: "Referrals", path: "/referral" },
    { name: "Heatmap", path: "/heatmap" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed left-0 top-0 z-50 h-20 w-full px-[5px] lg:h-[7.5rem] lg:px-[10px]">
      <div className="relative z-20 flex h-full w-full items-center justify-between px-[10px] lg:px-[25px]">
        {/* Logo */}
        <Link href="/" className="relative z-30 flex items-center transition-opacity hover:opacity-80">
          <img src="/images/logo-v2.png" alt="TPP Logo" className="h-6 w-auto object-contain md:h-8" />
        </Link>

        {/* Desktop Nav */}
        <nav className="absolute left-1/2 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-white/10 bg-white/[0.03] p-1.5 shadow-2xl md:backdrop-blur-md lg:flex">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="relative rounded-full px-4 py-1.5 text-[13px] font-medium tracking-wide text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA & Mobile Menu Toggle */}
        <div className="relative z-30 flex items-center gap-4">
          <Link
            href="/login"
            className="group hidden sm:inline-flex h-8 items-center gap-2 rounded-full border border-white/40 pl-1 pr-3 text-[15px] text-white transition-all duration-300 hover:rounded-lg hover:border-[#cbfb45]"
          >
            <span className="h-6 w-6 shrink-0 rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-sm" />
            Dashboard
          </Link>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white lg:hidden"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Background layer */}
      <div className="absolute inset-[5px] z-10 rounded-xl bg-black/90 md:backdrop-blur-sm lg:rounded-2xl" />

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute left-[5px] right-[5px] top-[calc(100%-10px)] z-0 rounded-b-xl border-t border-white/10 bg-black/95 px-6 py-8 shadow-2xl backdrop-blur-md lg:hidden"
          >
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-white/80 transition-colors hover:text-[#cbfb45]"
                >
                  {link.name}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t border-white/10">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="group inline-flex h-12 w-full justify-center items-center gap-2 rounded-full border border-white/40 pl-1 pr-3 text-[15px] text-white transition-all duration-300 hover:border-[#cbfb45] hover:text-[#cbfb45]"
                >
                  <span className="h-8 w-8 shrink-0 rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-sm" />
                  Dashboard
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}