"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { GsapWords, Floating, EASE, LIME } from "./V3Animations";

export function V3PageHero({
  eyebrow,
  title,
  titleHighlight = [],
  description,
  breadcrumb,
}: {
  eyebrow?: string;
  title: string;
  titleHighlight?: string[];
  description?: string;
  breadcrumb?: { label: string; href: string }[];
}) {
  return (
    <section className="min-h-[55vh] px-[5px] pt-[5px]">
      <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-black px-6 pb-16 pt-32 lg:rounded-2xl lg:px-10 lg:pb-24 lg:pt-44">
        {/* Ambient orbs */}
        <Floating
          className="pointer-events-none absolute left-[10%] top-[20%] hidden h-[40vw] w-[40vw] rounded-full bg-[#cbfb45]/[0.06] blur-[120px] md:block"
          amplitude={20}
          duration={9}
        />
        <Floating
          className="pointer-events-none absolute bottom-[-10%] right-[10%] hidden h-[30vw] w-[30vw] rounded-full bg-[#cbfb45]/[0.08] blur-[100px] md:block"
          amplitude={25}
          duration={11}
          delay={1}
        />

        {/* Grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center">
          {/* Breadcrumb */}
          {breadcrumb && (
            <motion.nav
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 text-[13px] text-white/40"
            >
              {breadcrumb.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && <ChevronRight className="h-3 w-3" />}
                  {i === breadcrumb.length - 1 ? (
                    <span className="text-white/60">{b.label}</span>
                  ) : (
                    <Link
                      href={b.href}
                      className="transition-colors hover:text-white/70"
                    >
                      {b.label}
                    </Link>
                  )}
                </span>
              ))}
            </motion.nav>
          )}

          {/* Eyebrow */}
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 md:backdrop-blur-md">
                <span
                  className="relative flex h-2 w-2"
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#cbfb45] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#cbfb45]" />
                </span>
                <span className="text-[13px] font-medium tracking-wide text-white/80">
                  {eyebrow}
                </span>
              </div>
            </motion.div>
          )}

          {/* Title */}
          <GsapWords
            as="h1"
            text={title}
            highlight={titleHighlight}
            className="relative z-10 w-full max-w-[900px] text-center font-bold leading-[0.95] tracking-[-0.03em] text-white"
            style={{ fontSize: "clamp(2.4rem, 7vw, 6rem)" }}
          />

          {/* Description */}
          {description && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
              className="mt-6 max-w-[540px] text-center text-[15px] leading-relaxed text-white/50 lg:text-base"
            >
              {description}
            </motion.p>
          )}
        </div>
      </div>
    </section>
  );
}
