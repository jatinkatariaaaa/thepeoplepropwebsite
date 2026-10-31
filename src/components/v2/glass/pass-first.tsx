"use client";

import Link from "next/link";
import { ArrowRight, Check, KeyRound } from "lucide-react";
import { Container, Eyebrow } from "./ui";
import { Parallax, Reveal } from "./motion";
import { ACCESS_UPFRONT, usd, usePrograms, useSelectedProgram } from "./data";

/** The Access offer, set as a slab that bridges the light "How it works" sheet and the dark section below. */
export function PassFirst() {
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

  return (
    <div className="relative z-20 -mt-28 -mb-28 sm:-mt-32 sm:-mb-32">
      <Container>
        <Reveal y={50} amount={0.3}>
          <div className="relative">
            <div className="g-hair relative overflow-hidden rounded-[40px] bg-[linear-gradient(125deg,#06362d_0%,#0b4b3e_42%,#1d6656_78%,#3d8572_100%)] shadow-[0_60px_120px_-50px_rgba(4,40,33,0.85)]">
              <div aria-hidden="true" className="absolute inset-0">
                <div className="absolute -top-1/2 -left-1/4 h-[160%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.13),transparent)]" />
                <div className="absolute right-0 bottom-0 h-[80%] w-[55%] bg-[radial-gradient(ellipse_at_80%_100%,rgba(169,220,207,0.28),transparent_70%)]" />
                <div className="g-grain" />
              </div>

              <div className="relative grid gap-10 p-7 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:p-16">
                <div>
                  <Eyebrow icon={KeyRound}>{access.label}</Eyebrow>
                  <h2 className="g-display mt-6 text-[clamp(2.6rem,5.6vw,5rem)]">
                    <span className="g-shade-dark block">Pass first.</span>
                    <span className="g-shade-lime block">Pay later.</span>
                  </h2>
                  <p className="mt-6 max-w-[30rem] text-[16.5px] leading-[1.6] text-white/75">
                    Start an Access account for ${ACCESS_UPFRONT}. The rest of the fee is only due after you pass — within 48 hours of passing.
                  </p>
                  <ul className="mt-7 flex flex-wrap gap-2">
                    {access.highlights.map((h) => (
                      <li key={h} className="inline-flex items-center gap-2 rounded-full bg-white/[0.09] px-3.5 py-2 text-[13px] font-medium text-white/85 ring-1 ring-white/10">
                        <Check className="h-3.5 w-3.5 text-[var(--g-lime)]" strokeWidth={2.6} />
                        {h}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <Link href="/dashboard/new-challenge" className="g-btn g-btn-lime group">
                      Start for ${ACCESS_UPFRONT}
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" strokeWidth={2.2} />
                    </Link>
                    <button type="button" onClick={configure} className="g-btn g-btn-glass">
                      Configure Access
                    </button>
                  </div>
                </div>

                {/* price ledger, bottom-right, under the floating card */}
                <div className="flex items-end lg:justify-end">
                  <dl className="g-glass g-hair grid w-full max-w-[360px] grid-cols-2 overflow-hidden rounded-[24px]">
                    <div className="p-5">
                      <dt className="text-[12px] text-white/55">Due today</dt>
                      <dd className="g-num mt-1 text-[34px] leading-none font-semibold text-white">{usd(ACCESS_UPFRONT)}</dd>
                    </div>
                    <div className="border-l border-white/10 p-5">
                      <dt className="text-[12px] text-white/55">After you pass</dt>
                      <dd className="g-num mt-1 text-[34px] leading-none font-semibold text-[var(--g-lime-soft)]">
                        <span className="mr-1 align-middle text-[13px] font-medium text-white/50">from</span>
                        {after != null ? usd(after) : "—"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* the card itself breaks out of the slab */}
            <Parallax speed={0.18} rotate={4} className="pointer-events-none absolute -top-24 right-[4%] hidden w-[38%] max-w-[470px] lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/prop-card5.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="g-float w-full drop-shadow-[0_50px_40px_rgba(2,26,21,0.55)]" style={{ ["--g-amp" as string]: "-10px" }} />
            </Parallax>
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
