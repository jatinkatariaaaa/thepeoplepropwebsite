"use client";

import { ArrowRight, Check, Route } from "lucide-react";
import type { ProgramKey } from "@/data/programs";
import { Container, Eyebrow, Lede, Section, Title } from "./ui";
import { Parallax, Reveal, Stagger, StaggerItem, Tilt } from "./motion";
import { entryPrice, usd, usePrograms, useSelectedProgram } from "./data";

function useJump() {
  const [, setProgram] = useSelectedProgram();
  return (k: ProgramKey) => {
    setProgram(k);
    document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
}

export function TwoWays() {
  const programs = usePrograms();
  const jump = useJump();
  const evals = programs.filter((p) => p.phases > 0);
  const instant = programs.find((p) => p.key === "instant");
  const evalFrom = Math.min(...evals.flatMap((p) => Object.values(p.fees).filter((f): f is number => typeof f === "number")));

  return (
    <Section shell={false} className="pt-8 pb-32 sm:pb-40">
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <Eyebrow icon={Route}>Two ways in</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title className="mt-6 text-[clamp(2.3rem,4.8vw,4.2rem)]" lead="Prove it first." fade="Or skip straight to funded." />
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <Lede className="lg:mb-2">Take an evaluation at your own pace, or trade an Instant Funded account with no evaluation at all.</Lede>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-5 lg:grid-cols-2" gap={0.12}>
          {/* evaluation */}
          <StaggerItem>
            <Tilt max={4} className="h-full">
              <article className="g-card-dark g-hair g-spot relative flex h-full min-h-[600px] flex-col overflow-hidden rounded-[36px] p-7 sm:p-10">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(ellipse_70%_60%_at_70%_0%,rgba(126,170,158,0.22),transparent)]" />
                <Parallax speed={0.1} className="pointer-events-none absolute -top-4 right-2 w-[44%] max-w-[260px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/v2/pt/prop-rules.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="w-full drop-shadow-[0_40px_40px_rgba(0,0,0,0.55)]" />
                </Parallax>
                <div className="relative mt-auto pt-48">
                  <p className="text-[13px] font-medium text-[var(--g-mint)]">Evaluation · from {usd(evalFrom)}</p>
                  <h3 className="g-title g-shade-dark mt-3 text-[clamp(2rem,3.4vw,2.9rem)]">Pass in 1, 2 or 3 steps.</h3>
                  <ul className="mt-7 flex flex-col gap-2">
                    {evals.map((p) => (
                      <li key={p.key}>
                        <button
                          type="button"
                          onClick={() => jump(p.key)}
                          className="group flex w-full items-center justify-between gap-4 rounded-[16px] bg-white/[0.04] px-4 py-3 text-left transition-colors duration-300 hover:bg-white/[0.08]"
                        >
                          <span className="text-[14.5px] font-semibold text-white">{p.shortLabel}</span>
                          <span className="flex-1 truncate text-[13px] text-white/45">Target {p.profitTarget}</span>
                          <span className="g-num text-[14px] font-semibold text-white/85">from {entryPrice(p).value}</span>
                          <ArrowRight className="h-4 w-4 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Tilt>
          </StaggerItem>

          {/* instant */}
          {instant ? (
            <StaggerItem>
              <Tilt max={4} className="h-full">
                <article className="g-card-emerald g-hair g-spot relative flex h-full min-h-[600px] flex-col overflow-hidden rounded-[36px] p-7 sm:p-10">
                  <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_20%_0%,rgba(203,251,69,0.16),transparent)]" />
                  <Parallax speed={0.14} className="pointer-events-none absolute -top-2 right-4 w-[40%] max-w-[240px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/v2/pt/prop-bolt.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="w-full drop-shadow-[0_40px_40px_rgba(2,30,24,0.6)]" />
                  </Parallax>
                  <div className="relative mt-auto pt-48">
                    <p className="text-[13px] font-medium text-[var(--g-lime-soft)]">
                      {instant.label} · from {entryPrice(instant).value}
                    </p>
                    <h3 className="g-title g-shade-dark mt-3 text-[clamp(2rem,3.4vw,2.9rem)]">Skip the evaluation.</h3>
                    <ul className="mt-7 flex flex-col gap-3">
                      {instant.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-3 text-[14.5px] text-white/85">
                          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15">
                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.6} />
                          </span>
                          {h}
                        </li>
                      ))}
                    </ul>
                    <button type="button" onClick={() => jump("instant")} className="g-btn g-btn-lime group mt-8">
                      Configure Instant
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" strokeWidth={2.2} />
                    </button>
                  </div>
                </article>
              </Tilt>
            </StaggerItem>
          ) : null}
        </Stagger>
      </Container>
    </Section>
  );
}
