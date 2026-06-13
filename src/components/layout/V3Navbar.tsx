"use client";

import Link from "next/link";
import { Magnetic } from "@/components/ui/Magnetic"; // Adjust import path if needed

export function V3Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 h-20 w-full px-[5px] lg:h-[7.5rem] lg:px-[10px]">
      <div className="relative z-20 flex h-full w-full items-center px-[10px] lg:px-[25px]">
        <Link href="/" className="relative z-30 flex items-center transition-opacity hover:opacity-80">
          <img src="/images/logo-v2.png" alt="TPP Logo" className="h-6 w-auto object-contain md:h-8" />
        </Link>
        <nav className="absolute left-1/2 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-white/10 bg-white/[0.03] p-1.5 shadow-2xl md:backdrop-blur-md lg:flex">
          {[
            { name: "Home", path: "/" },
            { name: "Challenges", path: "/challenges" },
            { name: "Rules", path: "/rules" },
            { name: "Referrals", path: "/referral" },
            { name: "Heatmap", path: "/heatmap" },
            { name: "Contact", path: "/contact" },
          ].map((link) => (
            <Link
              key={link.name}
              href={link.path}
              className="relative rounded-full px-4 py-1.5 text-[13px] font-medium tracking-wide text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="relative z-30 ml-auto flex items-center gap-4 lg:gap-6">
          <Magnetic>
            <Link
              href="/login"
              className="group inline-flex h-8 items-center gap-2 rounded-full border border-white/40 pl-1 pr-3 text-[15px] text-white transition-all duration-300 hover:rounded-lg hover:border-[#cbfb45]"
            >
              <span className="h-6 w-6 shrink-0 rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-sm" />
              Let&apos;s trade
            </Link>
          </Magnetic>
        </div>
      </div>
      <div className="absolute inset-[5px] z-10 rounded-xl bg-black/90 md:backdrop-blur-sm lg:rounded-2xl" />
    </header>
  );
}
