"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Check, Rocket } from "lucide-react";
import { Button, Container, Eyebrow } from "./ui";
import { Reveal } from "./motion";
import { ACCESS_UPFRONT } from "./data";
import { APP, href } from "./routes";

type Action = { label: string; href: string };

/** The closing showroom. Inner pages pass their own line and actions; the landing page uses the defaults. */
export function Cta({
  title,
  lede = "Your first payout is available 14 days after your first funded trade.",
  primary = { label: "Start your challenge", href: APP.newChallenge },
  secondary = { label: "Read the rules", href: href("rules") },
  size = "lg",
}: {
  title?: ReactNode;
  /** "md" for longer lines */
  size?: "lg" | "md";
  lede?: string;
  primary?: Action;
  secondary?: Action;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.55, 1], [1.16, 1.02, 1]);
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section ref={ref} id="get-funded" className="relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] bg-[#0b1110] sm:rounded-t-[56px]">
      <motion.div aria-hidden="true" className="absolute inset-0 -z-20" style={reduce ? undefined : { scale, y }}>
        <picture>
          <source media="(max-width: 1023px)" srcSet="/v2/pt/cta-mobile.webp" width={1080} height={1600} />
          <img src="/v2/pt/cta-desktop.webp" width={2400} height={1350} alt="" loading="lazy" decoding="async" className="absolute bottom-0 left-0 h-auto w-full [mask-image:linear-gradient(180deg,transparent,#000_30%)]" />
        </picture>
      </motion.div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#0b1110,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(0deg,#0b1110,transparent)]" />
        <div className="g-grain" />
      </div>

      <Container className="flex min-h-[820px] flex-col items-center pt-32 pb-[340px] text-center sm:min-h-[940px] sm:pt-40 sm:pb-[420px]">
        <Reveal className="flex justify-center">
          <Eyebrow icon={Rocket}>Get started</Eyebrow>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className={size === "md" ? "g-display mx-auto mt-7 max-w-[15ch] text-[clamp(2.6rem,5.6vw,5.2rem)]" : "g-display mt-7 text-[clamp(3rem,7.4vw,7rem)]"}>
            {title ?? (
              <>
                <span className="g-shade-dark">Ready to get </span>
                <span className="g-shade-lime">funded?</span>
              </>
            )}
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-6 max-w-[34rem] text-[17px] leading-relaxed text-white/70">{lede}</p>
        </Reveal>
        <Reveal delay={0.22} className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href={primary.href}>{primary.label}</Button>
          <Button href={secondary.href} kind="glass" arrow={false}>
            {secondary.label}
          </Button>
        </Reveal>
        <Reveal delay={0.3}>
          <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13.5px] text-white/60">
            {[`Start from $${ACCESS_UPFRONT} with Access`, "One-time fee", "No time limit"].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-[var(--g-lime)]" strokeWidth={2.6} />
                {t}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
