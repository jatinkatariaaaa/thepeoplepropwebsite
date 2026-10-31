"use client";

import type { ReactNode } from "react";
import { CalendarClock, RotateCcw, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Lede, Title } from "./ui";
import { Reveal, Stagger, StaggerItem, Tilt } from "./motion";
import { ACCESS_UPFRONT, usePlatformNames } from "./data";

type Tone = "paper" | "emerald" | "ink";

function Card({
  tone = "paper",
  stat,
  unit,
  title,
  body,
  note,
  img,
  imgClass,
  icon: Icon,
  className,
  children,
}: {
  tone?: Tone;
  stat?: string;
  unit?: string;
  title: string;
  body: string;
  note?: string;
  img?: string;
  imgClass?: string;
  icon?: LucideIcon;
  className?: string;
  children?: ReactNode;
}) {
  const dark = tone !== "paper";
  return (
    <Tilt max={4} className={cn("h-full", className)}>
      <article
        className={cn(
          "g-spot group relative flex h-full flex-col overflow-hidden rounded-[32px] p-7 sm:p-8",
          img ? "min-h-[340px] sm:min-h-[360px]" : "min-h-[250px] sm:min-h-[360px]",
          tone === "paper" && "g-card-paper g-hair g-hair-ink text-[var(--g-ink)]",
          tone === "emerald" && "g-card-emerald g-hair text-white shadow-[0_40px_80px_-44px_rgba(6,58,49,0.9)]",
          tone === "ink" && "g-card-dark g-hair text-white shadow-[0_40px_80px_-44px_rgba(0,0,0,0.7)]",
        )}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className={cn(
              "pointer-events-none absolute transition-transform duration-700 [transition-timing-function:var(--g-out)] group-hover:scale-105",
              dark ? "drop-shadow-[0_34px_30px_rgba(0,0,0,0.5)]" : "drop-shadow-[0_34px_30px_rgba(16,40,34,0.22)]",
              imgClass ?? "-top-4 -right-4 w-48",
            )}
          />
        ) : null}
        {Icon ? (
          <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[var(--g-ink)] text-[var(--g-lime)] shadow-[0_20px_40px_-18px_rgba(0,0,0,0.6)]">
            <Icon className="h-6 w-6" strokeWidth={1.8} />
          </span>
        ) : null}
        <div className="relative mt-auto">
          {stat ? (
            <p className="flex items-baseline gap-2">
              <span className={cn("g-num text-[clamp(3rem,5vw,4.2rem)] leading-none font-semibold tracking-[-0.05em]", dark ? "g-shade-dark" : "g-shade-light")}>{stat}</span>
              {unit ? <span className={cn("text-[14px] font-medium", dark ? "text-white/55" : "text-[var(--g-muted-ink)]")}>{unit}</span> : null}
            </p>
          ) : null}
          <h3 className={cn("mt-4 text-[21px] font-semibold tracking-[-0.03em]", dark ? "text-white" : "text-[var(--g-ink)]")}>{title}</h3>
          <p className={cn("mt-2 max-w-[30rem] text-[15px] leading-relaxed", dark ? "text-white/65" : "text-[var(--g-muted-ink)]")}>{body}</p>
          {note ? <p className={cn("mt-4 text-[12.5px] font-medium", dark ? "text-[var(--g-lime-soft)]" : "text-[var(--g-emerald)]")}>{note}</p> : null}
          {children}
        </div>
      </article>
    </Tilt>
  );
}

export function Why() {
  const platforms = usePlatformNames();
  return (
    <section id="why" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-28 pb-24 sm:rounded-t-[56px] sm:pt-36 sm:pb-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-56 left-1/2 h-[520px] w-[1200px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.55),transparent)]" />
      </div>
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <Eyebrow tone="light" icon={ShieldCheck}>
                Why TPP
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.3rem,4.8vw,4.2rem)]" lead="Rules that work" fade="for the way you trade." />
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <Lede tone="light" className="lg:mb-2">
              Professional trading conditions, transparent rules, and a funding model built to keep serious traders moving forward.
            </Lede>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3" gap={0.07}>
          <StaggerItem className="md:col-span-2">
            <Card
              tone="ink"
              stat="0.0"
              unit="pips"
              title="Raw spreads"
              body="Tier-1 liquidity, zero markup. Your edge stays yours."
              img="/v2/pt/prop-candles.webp"
              imgClass="-top-10 right-0 w-[58%] max-w-[420px] sm:-top-16"
            />
          </StaggerItem>
          <StaggerItem>
            <Card stat="∞" unit="Unlimited period" title="No time limit" body="Pass in a day or a year — your pace, your rules." img="/v2/pt/prop-hourglass.webp" imgClass="top-2 right-3 w-36 sm:w-40" />
          </StaggerItem>
          <StaggerItem>
            <Card
              icon={RotateCcw}
              title="Free retry"
              body="Missed by a hair? Take one free re-attempt if you breach during evaluation."
              note="Included on 1-Step · add-on for 2-Step & 3-Step"
            />
          </StaggerItem>
          <StaggerItem>
            <Card
              tone="emerald"
              stat={`$${ACCESS_UPFRONT}`}
              unit="upfront"
              title="Pass first, pay later"
              body={`Start an Access account for $${ACCESS_UPFRONT}. The rest of the fee is only due after you pass.`}
            />
          </StaggerItem>
          <StaggerItem>
            <Card stat="NFP" unit="& FOMC" title="News trading allowed" body="Trade high-impact releases on evaluation and funded accounts." img="/v2/pt/prop-stopwatch.webp" imgClass="top-3 right-3 w-36 sm:w-40" />
          </StaggerItem>
          <StaggerItem>
            <Card icon={CalendarClock} title="Weekend & overnight holding" body="Keep positions open through the weekend — no forced flat at Friday's close." />
          </StaggerItem>
          <StaggerItem className="md:col-span-2 lg:col-span-2">
            <Card tone="ink" stat={String(platforms.length)} unit="platforms" title="Trade on the platform you trust" body="Pick your terminal at checkout. EAs and bots are welcome." img="/v2/pt/prop-tiles.webp" imgClass="-top-10 right-2 w-[46%] max-w-[340px]">
              <ul className="mt-6 flex flex-wrap gap-2">
                {platforms.map((p) => (
                  <li key={p} className="g-hair g-hair-ink inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13.5px] font-semibold text-[var(--g-ink)] shadow-[0_8px_20px_-14px_rgba(16,40,34,0.5)]">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--g-emerald)]" strokeWidth={2} />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}
