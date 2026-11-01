"use client";

import Link from "next/link";
import { ArrowRight, Check, KeyRound } from "lucide-react";
import { Container, Eyebrow } from "../ui";
import { Parallax, Reveal } from "../motion";
import { ACCESS_UPFRONT, usd, usePrograms, useSelectedProgram } from "../data";
import { APP } from "../routes";

/** The Access offer as its own scene: the price is the headline. */
export function Access() {
  const programs = usePrograms();
  const [, setProgram] = useSelectedProgram();
  const access = programs.find((p) => p.key === "access");
  if (!access) return null;
  const fees = Object.values(access.fees).filter((f): f is number => typeof f === "number");
  const after = fees.length ? Math.min(...fees) : null;
  const configure = () => {
    setProgram("access");
    document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const timeline = [
    { when: "Today", what: "Start your Access account", value: usd(ACCESS_UPFRONT) },
    { when: "Your pace", what: "Pass the evaluation", value: "No deadline" },
    { when: "Within 48 hours of passing", what: "Pay the rest of the fee", value: after != null ? `from ${usd(after)}` : "—" },
  ];

  return (
    <section id="access" className="relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] bg-[#03231d] text-white sm:rounded-t-[56px]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(125deg,#021612_0%,#063a31_45%,#0d4f42_75%,#1d6656_100%)]" />
        <div className="absolute -top-1/3 -left-1/4 h-[140%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.1),transparent)]" />
        <div className="absolute right-0 bottom-0 h-[70%] w-[60%] bg-[radial-gradient(ellipse_at_80%_100%,rgba(169,220,207,0.22),transparent_70%)]" />
        <div className="g-grain" />
      </div>

      <Container className="grid items-center gap-14 pt-28 pb-36 sm:pt-36 sm:pb-44 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <Eyebrow icon={KeyRound}>{access.label}</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <p className="mt-8 flex items-start gap-3" aria-label={`${usd(ACCESS_UPFRONT)} to start`}>
              <span className="g-num g-shade-lime text-[clamp(7rem,16vw,12.5rem)] leading-[0.8] font-semibold tracking-[-0.07em]">${ACCESS_UPFRONT}</span>
              <span className="mt-4 text-[15px] font-semibold text-white/60">to start</span>
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <h2 className="g-display mt-8 text-[clamp(2.4rem,4.6vw,4rem)]">
              <span className="g-shade-dark">Pass first.</span> <span className="text-[#6c7874]">Pay later.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.18}>
            <p className="mt-6 max-w-[30rem] text-[16.5px] leading-[1.6] text-white/70">
              Start an Access account for ${ACCESS_UPFRONT}. The rest of the fee is only due after you pass — within 48 hours of passing.
            </p>
          </Reveal>
          <Reveal delay={0.22}>
            <ul className="mt-7 flex flex-wrap gap-2">
              {access.highlights.map((h) => (
                <li key={h} className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3.5 py-2 text-[13px] font-medium text-white/85 ring-1 ring-white/10">
                  <Check className="h-3.5 w-3.5 text-[var(--g-lime)]" strokeWidth={2.6} />
                  {h}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href={APP.newChallenge} className="g-btn g-btn-lime group">
                Start for ${ACCESS_UPFRONT}
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" strokeWidth={2.2} />
              </Link>
              <button type="button" onClick={configure} className="g-btn g-btn-glass">
                Configure Access
              </button>
            </div>
          </Reveal>
        </div>

        <div className="relative">
          <Parallax speed={0.2} rotate={5} className="pointer-events-none relative z-10 mx-auto -mb-24 w-[82%] max-w-[480px] sm:-mb-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/prop-card5.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="g-float w-full drop-shadow-[0_50px_40px_rgba(2,26,21,0.6)]" style={{ ["--g-amp" as string]: "-10px" }} />
          </Parallax>
          <Reveal delay={0.1} className="g-glass g-hair relative overflow-hidden rounded-[30px] px-6 pt-24 pb-6 sm:px-8 sm:pt-28">
            <ol className="relative">
              <span aria-hidden="true" className="absolute top-3 bottom-3 left-[11px] w-px bg-gradient-to-b from-[var(--g-lime)] via-white/25 to-white/10" />
              {timeline.map((t, i) => (
                <li key={t.what} className="relative flex items-start justify-between gap-6 py-4 pl-10">
                  <span className={`absolute top-[22px] left-0 grid h-[23px] w-[23px] place-items-center rounded-full ring-4 ring-[#0a3a31] ${i === 0 ? "bg-[var(--g-lime)]" : "bg-white/20"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-[var(--g-ink)]" : "bg-white/70"}`} />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium tracking-wide text-white/45 uppercase">{t.when}</p>
                    <p className="mt-1 text-[16px] font-semibold text-white">{t.what}</p>
                  </div>
                  <p className="g-num mt-5 shrink-0 text-[17px] font-semibold text-[var(--g-lime-soft)]">{t.value}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
