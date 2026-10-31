"use client";

import { Check, Copy, Download, Mail, Mic, Newspaper, Palette, Type } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { TppMark } from "../logo";
import { compactUsd, findStat, prettyValue, useCatalogue, usePlatformNames, usePrograms, useStats } from "../data";
import { href } from "../routes";
import { SUPPORT } from "./channels";

const MEDIA = `mailto:${SUPPORT}?subject=${encodeURIComponent("Press & media")}`;
const list = new Intl.ListFormat("en", { type: "conjunction" });
const either = new Intl.ListFormat("en", { type: "disjunction" });

/** The palette the site is built from (glass.css tokens). */
const COLOURS = [
  { name: "Ink", hex: "#0E1110", dark: true },
  { name: "Volt", hex: "#CBFB45", dark: false },
  { name: "Emerald", hex: "#1D6656", dark: true },
  { name: "Deep green", hex: "#063A31", dark: true },
  { name: "Mint", hex: "#A9DCCF", dark: false },
  { name: "Pearl", hex: "#F3F5F4", dark: false },
];

function CopyButton({ text, label }: { text: string; label: string }) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <button type="button" onClick={() => copy(text)} className="g-btn g-btn-glass h-10 px-4 text-[13px]" aria-label={label}>
      {copied ? <Check className="h-4 w-4 text-[var(--g-lime)]" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Swatch({ name, hex, dark }: { name: string; hex: string; dark: boolean }) {
  const { copied, copy } = useCopyToClipboard();
  return (
    <button
      type="button"
      onClick={() => copy(hex)}
      aria-label={`Copy ${name} ${hex}`}
      className="group flex h-36 w-full flex-col justify-between rounded-[22px] p-4 text-left ring-1 ring-white/10 transition-transform duration-500 [transition-timing-function:var(--g-out)] hover:-translate-y-1"
      style={{ background: hex }}
    >
      <span className={dark ? "text-[13px] font-semibold text-white" : "text-[13px] font-semibold text-[var(--g-ink)]"}>{name}</span>
      <span className={dark ? "g-num text-[12.5px] text-white/70" : "g-num text-[12.5px] text-black/60"}>{copied ? "Copied" : hex}</span>
    </button>
  );
}

export function PressPage() {
  const programs = usePrograms();
  const { count, minSize, maxSize, maxSplit } = useCatalogue(programs);
  const platforms = usePlatformNames();
  const stats = useStats();
  const countries = findStat(stats, "countries");
  const payouts = findStat(stats, "payouts");
  const labels = programs.map((p) => p.shortLabel);

  const facts = [
    { label: "Account types", value: String(count), note: list.format(labels) },
    { label: "Account sizes", value: `${compactUsd(minSize)}–${compactUsd(maxSize)}`, note: "Simulated capital, one-time fee" },
    { label: "Profit split", value: `Up to ${maxSplit}%`, note: "Depends on the account and add-ons" },
    { label: "Platforms", value: String(platforms.length), note: list.format(platforms) },
    ...(countries ? [{ label: countries.label, value: prettyValue(countries.value), note: "Where our traders are" }] : []),
    ...(payouts ? [{ label: payouts.label, value: prettyValue(payouts.value), note: "Paid to funded traders" }] : []),
  ];

  const boilerplate = `The People Prop (TPP) is a proprietary trading firm built by traders, for traders. Traders choose a ${either.format(labels)} account from ${compactUsd(minSize)} to ${compactUsd(maxSize)}, trade it on simulated capital under published rules, and earn profit splits of up to ${maxSplit}%. The People Prop is not a broker and does not accept deposits.`;

  return (
    <>
      <PageHero
        art="/art/page-press.webp"
        crumb="Press"
        eyebrow="Press & brand"
        icon={Mic}
        lead="Writing about"
        fade="The People Prop?"
        lede="The facts, a ready-to-use description, the logo and the colours, all in one place. For anything else, email the team."
        mobileFocus="72%"
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#brand">Get the logo</Button>
          <Button href={MEDIA} kind="glass" arrow={false}>
            Media enquiries
          </Button>
        </div>
      </PageHero>

      <Section className="py-24 sm:py-32">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow icon={Newspaper}>At a glance</Eyebrow>
            <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="The facts," fade="from the source." />
            <Lede className="mt-5">Pulled live from the same catalogue and stats as the rest of the site, so they are current whenever you read them.</Lede>
          </Reveal>
          <Stagger className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((f) => (
              <StaggerItem key={f.label} className="h-full">
                <div className="g-glass g-hair flex h-full flex-col rounded-[28px] p-7">
                  <p className="text-[13px] font-medium text-white/50">{f.label}</p>
                  <p className="g-num g-shade-dark mt-4 text-[44px] leading-none font-semibold tracking-[-0.04em]">{f.value}</p>
                  <p className="mt-4 text-[14px] leading-relaxed text-white/55">{f.note}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section shell={false} className="py-24 sm:py-28">
        <Container>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
            <Reveal>
              <Eyebrow>Boilerplate</Eyebrow>
              <Title className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="TPP in" fade="one paragraph." />
              <Lede className="mt-5">Free to use as written in articles and listings.</Lede>
            </Reveal>
            <Reveal delay={0.08} className="min-w-0">
              <div className="g-glass-ink g-hair rounded-[32px] p-7 sm:p-9">
                <p className="text-[17px] leading-[1.7] text-white/80">{boilerplate}</p>
                <div className="mt-7 flex justify-end">
                  <CopyButton text={boilerplate} label="Copy the boilerplate" />
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section id="brand" className="py-24 sm:py-32">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow icon={Palette}>Brand kit</Eyebrow>
            <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Logo, colours" fade="and type." />
          </Reveal>

          <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Reveal>
              <div className="g-hair relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[32px] bg-[#0b0d0c] p-7 sm:p-9">
                <div aria-hidden="true" className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.12),transparent)]" />
                <p className="relative text-[13px] font-medium text-white/50">Primary logo · for dark backgrounds</p>
                <div className="relative grid flex-1 place-items-center py-10">
                  <TppMark className="h-16 text-white sm:h-20" />
                </div>
                <div className="relative flex flex-wrap gap-2">
                  <a href="/brand/tpp-logo.svg" download className="g-btn g-btn-lime h-10 px-4 text-[13px]">
                    <Download className="h-4 w-4" /> SVG
                  </a>
                  <a href="/images/logo.webp" download="tpp-logo-square.webp" className="g-btn g-btn-glass h-10 px-4 text-[13px]">
                    <Download className="h-4 w-4" /> Square image
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="g-glass g-hair flex h-full flex-col rounded-[32px] p-7 sm:p-9">
                <p className="flex items-center gap-2 text-[13px] font-medium text-white/50">
                  <Type className="h-4 w-4 text-[var(--g-lime)]" /> Typeface
                </p>
                <p className="mt-6 text-[88px] leading-none font-semibold tracking-[-0.05em] text-white">Aa</p>
                <p className="mt-6 text-[22px] font-semibold tracking-[-0.02em] text-white">Inter</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/55">Headlines and text are set in Inter, and in SF Pro on Apple devices.</p>
              </div>
            </Reveal>
          </div>

          <Stagger className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {COLOURS.map((c) => (
              <StaggerItem key={c.hex}>
                <Swatch {...c} />
              </StaggerItem>
            ))}
          </Stagger>
          <p className="mt-4 text-[12.5px] text-white/40">Click a colour to copy its hex value.</p>
        </Container>
      </Section>

      <Section shell={false} className="pt-24 pb-40 sm:pb-48">
        <Container>
          <Reveal>
            <div className="g-card-emerald g-hair relative overflow-hidden rounded-[36px] p-8 sm:p-12">
              <div aria-hidden="true" className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.2),transparent)]" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <Eyebrow icon={Mail}>Media enquiries</Eyebrow>
                  <Title className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="Interviews, quotes" fade="and anything else." />
                  <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/70">
                    Email <span className="font-semibold text-white">{SUPPORT}</span>{" "}
                    with “Press &amp; media” in the subject and the team will route it.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button href={MEDIA}>Email the team</Button>
                  <Button href={href("contact")} kind="glass" arrow={false}>
                    Contact page
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Cta />
    </>
  );
}
