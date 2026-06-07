"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

export function Navbar() {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Challenges", link: "/challenges" },
    { name: "Rules", link: "/rules" },
    { name: "Referrals", link: "/referral" },
    { name: "Heatmap", link: "/heatmap" },
    { name: "Contact", link: "/contact" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-white/10 backdrop-blur-md md:hidden"
          />
        )}
      </AnimatePresence>
      <ResizableNavbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-2">
          <NavbarButton variant="secondary" href="/login">
            Sign In
          </NavbarButton>
          <NavbarButton variant="primary" href="/challenges">
            Get Funded
            <ArrowUpRight className="w-3.5 h-3.5 ml-1 inline-block" />
          </NavbarButton>
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-[15px] font-medium text-[var(--ink-500)] hover:text-[var(--ink-950)] py-1.5 px-2 transition-colors block"
            >
              <span>{item.name}</span>
            </a>
          ))}
          <div className="flex w-full flex-col gap-2 mt-4">
            <NavbarButton
              onClick={() => setIsMobileMenuOpen(false)}
              variant="secondary"
              href="/login"
              className="w-full justify-center"
            >
              Sign In
            </NavbarButton>
            <NavbarButton
              onClick={() => setIsMobileMenuOpen(false)}
              variant="primary"
              href="/challenges"
              className="w-full justify-center"
            >
              Get Funded
              <ArrowUpRight className="w-3.5 h-3.5 ml-1 inline-block" />
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
    </>
  );
}