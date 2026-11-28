"use client";

import { useRef, type ReactNode } from "react";
import Link from "@/components/IntentLink";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Eyebrow } from "./ui";
import { href } from "./routes";

/**
 * Inner-page hero. Each page passes its own path-traced plate (a 2:1 render with
 * the sculpture on the right third), so every page opens on a different object
 * in the same showroom.
 */
export function PageHero({
  art,
  crumb,
  eyebrow,
  icon,
  lead,
  fade,
  lede,
  children,
  mobileFocus = "72%",
  className,
}: {
  art: string;
  crumb: string;
  eyebrow: string;
  icon?: LucideIcon;
  lead: ReactNode;
  fade?: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  /** horizontal focus of the plate on phones, where it is cropped to a banner */
  mobileFocus?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  return (
    <section ref={ref} className={cn("relative isolate z-10 overflow-x-clip bg-[#06100d]", className)}>
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        <motion.div className="absolute inset-x-0 top-0 h-[360px] sm:h-[440px] lg:inset-0 lg:h-auto" style={reduce ? undefined : { y, scale }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art}
            width={2200}
            height={1100}
            alt=""
            fetchPriority="high"
            decoding="async"
            style={{ objectPosition: `${mobileFocus} 50%` }}
            className="h-full w-full object-cover [mask-image:linear-gradient(180deg,#000_55%,transparent_98%)] lg:h-auto lg:[mask-image:none]"
          />
        </motion.div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(6,16,13,0.82)_0%,rgba(6,16,13,0.45)_40%,rgba(6,16,13,0)_62%)] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(0deg,#0e1110_6%,rgba(14,17,16,0)_100%)]" />
        <div className="g-grain" />
      </div>

      <Container className="pt-[300px] pb-16 sm:pt-[380px] lg:flex lg:min-h-[min(760px,100svh)] lg:flex-col lg:justify-center lg:pt-36 lg:pb-24">
        <div className="max-w-[620px]">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[12.5px] text-white/45">
            <Link href={href("home")} className="transition-colors hover:text-white">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white/75" aria-current="page">
              {crumb}
            </span>
          </nav>
          <div>
            <Eyebrow icon={icon}>{eyebrow}</Eyebrow>
          </div>
          <h1 className="g-display mt-6 text-[clamp(2.6rem,5vw,4.6rem)]">
            <span className="g-shade-dark">{lead}</span>
            {fade ? (
              <>
                {" "}
                <span className="text-[#6c7874]">{fade}</span>
              </>
            ) : null}
          </h1>
          {lede ? (
            <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.6] text-white/65">
              {lede}
            </p>
          ) : null}
          {children ? (
            <div className="mt-9">
              {children}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
