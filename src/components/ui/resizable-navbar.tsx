"use client";
import React, { useState, useEffect } from "react";
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function Navbar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isScrolledOrMobile = scrolled || isMobile;

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  });

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full pointer-events-none"
      initial={false}
      animate={{
        paddingTop: isScrolledOrMobile ? 16 : 0,
      }}
      transition={{ type: "spring", stiffness: 180, damping: 22 }}
    >
      <motion.div
        initial={false}
        animate={{
          width: isScrolledOrMobile ? "calc(100% - 32px)" : "100%",
          maxWidth: isScrolledOrMobile ? "1024px" : "100%",
          borderRadius: isScrolledOrMobile ? "24px" : "0px",
          paddingLeft: isScrolledOrMobile ? "20px" : "32px",
          paddingRight: isScrolledOrMobile ? "20px" : "32px",
          paddingTop: isScrolledOrMobile ? "10px" : "16px",
          paddingBottom: isScrolledOrMobile ? "10px" : "16px",
          borderTopColor: isScrolledOrMobile ? "var(--border)" : "transparent",
          borderLeftColor: isScrolledOrMobile ? "var(--border)" : "transparent",
          borderRightColor: isScrolledOrMobile ? "var(--border)" : "transparent",
          borderBottomColor: isScrolledOrMobile ? "var(--border)" : "transparent",
          boxShadow: isScrolledOrMobile ? "0 10px 30px -10px rgba(0,0,0,0.03)" : "0 0px 0px rgba(0,0,0,0)",
          backgroundColor: isScrolledOrMobile ? "rgba(255,255,255,0.9)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
        className={cn(
          "flex flex-col w-full pointer-events-auto border-t border-l border-r border-b",
          isScrolledOrMobile ? "backdrop-blur-md" : ""
        )}
        style={{
          borderStyle: "solid",
        }}
      >
        {children}
      </motion.div>
    </motion.header>
  );
}

export function NavBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("hidden md:flex items-center justify-between w-full", className)}>
      {children}
    </div>
  );
}

export function NavbarLogo({ className }: { className?: string }) {
  return <Logo className={className} />;
}

export function NavItems({
  items,
  className,
}: {
  items: { name: string; link: string }[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <ul className={cn("flex items-center gap-1.5 bg-neutral-100/60 border border-[var(--border-strong)]/30 rounded-full px-2 py-1.5", className)}>
      {items.map((item) => {
        const active = pathname === item.link;
        return (
          <li key={item.link}>
            <Link
              href={item.link}
              className={cn(
                "relative px-4.5 py-1.5 text-[13.5px] font-medium transition-all duration-200 rounded-full block",
                active
                  ? "text-[var(--ink-950)] bg-white shadow-sm border border-[var(--border)]/40"
                  : "text-[var(--ink-500)] hover:text-[var(--ink-950)]"
              )}
            >
              {item.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavbarButton({
  children,
  variant = "primary",
  className,
  href,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
  href?: string;
  onClick?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}) {
  return (
    <Button
      variant={variant === "primary" ? "dark" : "ghost"}
      size="sm"
      href={href}
      onClick={onClick}
      className={cn("rounded-full font-medium transition-all duration-200", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

export function MobileNav({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col w-full md:hidden", className)}>
      {children}
    </div>
  );
}

export function MobileNavHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between w-full", className)}>
      {children}
    </div>
  );
}

export function MobileNavToggle({
  isOpen,
  onClick,
  className,
}: {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "grid place-items-center w-9 h-9 rounded-full border border-[var(--border-strong)] bg-white text-[var(--ink-950)] hover:bg-neutral-50 transition-colors",
        className
      )}
    >
      {isOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
    </button>
  );
}

export function MobileNavMenu({
  isOpen,
  onClose,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={cn("overflow-hidden flex flex-col gap-4 pt-4 pb-2 border-t border-[var(--border)] mt-3", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
