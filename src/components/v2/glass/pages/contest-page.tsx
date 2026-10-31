"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, CheckCircle2, Copy, Gift, Link2, Share2, Shield, Star, Trophy, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { usd, usePrograms } from "../data";
import { APP, href } from "../routes";

type Entry = { id: string; referral_code: string; referral_count: number; target: number; claimed: boolean };

const LOGIN = `${APP.login}?redirect=${href("contest")}`;

const STEPS = [
  { icon: Link2, title: "Sign up & get your link", body: "Create a free account on The People Prop. We'll instantly generate your unique contest referral link — ready to share in seconds." },
  { icon: Share2, title: "Share with 10 friends", body: "Send your link via WhatsApp, Telegram, Twitter, or any channel. When your friends sign up using your link, they count toward your total." },
  { icon: Gift, title: "Claim your free account", body: "Once 10 friends have signed up, you'll unlock a FREE 10K 3-Step Evaluation account. No payment needed — ever." },
];

const RULES = [
  "Friends must complete a full sign-up (email verified)",
  "Each friend must be a unique user (no duplicate accounts)",
  "Self-referrals are not allowed",
  "Contest is limited time — act fast!",
  "One free account per participant",
  "Account will be provisioned within 24 hours of claiming",
];

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.473-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** Same flow as the current contest page: check the session, join via /api/contest/join, then show the link. */
function useContest() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ entry: Entry; link: string } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => data.user && setUser({ id: data.user.id }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetch("/api/contest/join", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.success && d.entry) setResult({ entry: d.entry, link: d.link });
        else setFailed(true);
      })
      .catch((e) => {
        console.error("Failed to join contest:", e);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  return { user, loading, joining: Boolean(user) && !result && !failed, entry: result?.entry ?? null, link: result?.link ?? "" };
}

function Ring({ value, max }: { value: number; max: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, value / max);
  return (
    <div className="relative grid h-36 w-36 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--g-lime)" strokeWidth="10" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)} className="transition-[stroke-dashoffset] duration-1000" />
      </svg>
      <div className="text-center">
        <p className="g-num text-[30px] leading-none font-semibold text-white">
          {value}
          <span className="text-[16px] text-white/40">/{max}</span>
        </p>
        <p className="mt-1 text-[11.5px] text-white/50">friends joined</p>
      </div>
    </div>
  );
}

function LinkPanel() {
  const { user, loading, joining, entry, link } = useContest();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };
  const text = `Join The People Prop and get a funded trading account! Sign up with my link: ${link}`;
  const share = [
    { label: "WhatsApp", icon: <WhatsAppIcon />, url: `https://wa.me/?text=${encodeURIComponent(text)}` },
    { label: "Telegram", icon: <TelegramIcon />, url: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join The People Prop and get a funded trading account!")}` },
    { label: "X", icon: <XIcon />, url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}` },
  ];

  return (
    <Section id="your-link" shell={false} className="scroll-mt-24 pt-10 pb-24 sm:pb-32">
      <Container>
        <Reveal>
          <div className="g-glass-ink g-hair relative overflow-hidden rounded-[34px] p-6 sm:p-10">
            <div aria-hidden="true" className="absolute -top-28 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.16),transparent)]" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <Eyebrow icon={Link2}>Your referral link</Eyebrow>
                <h2 className="g-title g-shade-dark mt-5 text-[clamp(2rem,3.6vw,3.2rem)]">Start sharing now.</h2>
                <p className="mt-3 max-w-xl text-[15.5px] text-white/60">
                  {user ? "Copy your unique referral link and start sharing it with friends." : "Sign in to generate your unique referral link and start earning your free account."}
                </p>

                <div className="mt-7">
                  {loading || joining ? (
                    <p className="flex items-center gap-3 text-[14px] text-white/55">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[var(--g-lime)]" />
                      {loading ? "Checking your session…" : "Generating your referral link…"}
                    </p>
                  ) : !user ? (
                    <Link href={LOGIN} className="g-btn g-btn-lime group">
                      Get your referral link
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                    </Link>
                  ) : entry && link ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <p className="g-num min-w-0 flex-1 truncate rounded-[16px] bg-white/[0.05] px-4 py-3.5 text-[14.5px] text-white ring-1 ring-white/10">{link}</p>
                        <button type="button" onClick={copy} className="g-btn g-btn-lime h-[50px]">
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          {copied ? "Copied!" : "Copy link"}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] text-white/45">Share via</span>
                        {share.map((s) => (
                          <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" title={`Share on ${s.label}`} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] text-white/80 ring-1 ring-white/10 transition-colors hover:bg-[var(--g-lime)] hover:text-[var(--g-ink)]">
                            {s.icon}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[14px] text-white/55">We couldn&apos;t load your contest entry. Please refresh or contact support.</p>
                  )}
                </div>
              </div>
              <Ring value={entry?.referral_count ?? 0} max={entry?.target ?? 10} />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section shell={false} className="pb-24 sm:pb-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow icon={Users}>Simple process</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="How it" fade="works." />
          </Reveal>
          <Reveal delay={0.1} className="flex justify-center">
            <Lede className="mt-6 text-center">Three simple steps stand between you and a free funded account. No catches, no hidden fees.</Lede>
          </Reveal>
        </div>
        <Stagger className="mt-14 grid gap-4 lg:grid-cols-3" gap={0.1}>
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <StaggerItem key={title}>
              <article className="g-card-dark g-hair h-full rounded-[30px] p-7">
                <div className="flex items-center justify-between">
                  <span className="g-num g-shade-dark text-[56px] leading-none font-semibold">{i + 1}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[var(--g-lime)]/10 text-[var(--g-lime)] ring-1 ring-[var(--g-lime)]/25">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </span>
                </div>
                <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.02em] text-white">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/60">{body}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

function Prize() {
  const programs = usePrograms();
  const three = programs.find((p) => p.key === "3-step");
  const worth = three?.fees[10_000];
  const features = ["$10,000 Virtual Capital", "3-Step Evaluation Process", `${three?.profitSplit ?? 80}% Profit Split`, "No Time Limit", "Trade Forex, Crypto & More", "Full Dashboard Access"];
  return (
    <Section shell={false} className="pb-32 sm:pb-40">
      <Container>
        <Reveal>
          <div className="g-card-emerald g-hair relative grid gap-10 overflow-hidden rounded-[36px] p-7 sm:p-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div aria-hidden="true" className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.2),transparent)]" />
            <div className="relative">
              <Eyebrow icon={Star}>The prize</Eyebrow>
              <h2 className="g-display mt-6 text-[clamp(2.4rem,4.6vw,4rem)]">
                <span className="g-shade-dark block">10K 3-Step</span>
                <span className="g-shade-lime block">Evaluation account.</span>
              </h2>
              <p className="mt-6 flex items-center gap-3 text-[15px] text-white/75">
                {worth ? <span className="text-white/50 line-through">{usd(worth)} value</span> : null}
                <span className="rounded-full bg-[var(--g-lime)] px-3 py-1 text-[13px] font-semibold text-[var(--g-ink)]">FREE</span>
              </p>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/70">Refer 10 friends and unlock instant access to a real evaluation account — on us.</p>
            </div>
            <ul className="relative grid content-center gap-3 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 rounded-[18px] bg-black/20 px-4 py-3.5 text-[14.5px] font-medium text-white ring-1 ring-white/10">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--g-lime)]" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function Rules() {
  return (
    <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow tone="light" icon={Shield}>
              Fair &amp; transparent
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Contest" fade="rules." />
          </Reveal>
        </div>
        <Stagger className="mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2" gap={0.06}>
          {RULES.map((r) => (
            <StaggerItem key={r}>
              <div className="g-card-paper g-hair g-hair-ink flex h-full items-start gap-3 rounded-[22px] p-5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--g-ink)] text-[var(--g-lime)]">
                  <Shield className="h-4 w-4" />
                </span>
                <p className="text-[15px] leading-relaxed text-[var(--g-ink)]/85">{r}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

export function ContestPage() {
  return (
    <>
      <PageHero
        art="/art/page-contest.webp"
        crumb="Contest"
        eyebrow="Limited time contest"
        icon={Trophy}
        lead="Invite 10 friends."
        fade="Get funded for free."
        lede="Share your unique referral link with 10 friends. When they all sign up, you'll receive a FREE 10K 3-Step evaluation account — absolutely no cost."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#your-link">Get your link</Button>
          <Button href={href("challenges")} kind="glass" arrow={false}>
            View challenges
          </Button>
        </div>
      </PageHero>
      <LinkPanel />
      <HowItWorks />
      <Prize />
      <Rules />
      <Cta
        title={
          <>
            <span className="g-shade-dark">Ready to get funded </span>
            <span className="g-shade-lime">for free?</span>
          </>
        }
        lede="Join thousands of traders who are sharing their link and earning free evaluation accounts. The contest won't last forever — start today."
        primary={{ label: "Join the contest now", href: LOGIN }}
        secondary={{ label: "View challenges", href: href("challenges") }}
        size="md"
      />
    </>
  );
}
