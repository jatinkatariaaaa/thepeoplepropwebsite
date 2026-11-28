"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "@/components/IntentLink";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, Copy, Gift, Link2, MailCheck, Minus, Plus, Scale, Send, Share2, ShieldCheck, Sparkles, Trophy, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReferralSummary } from "@/lib/referral-link";
import type { AccountSize } from "@/data/programs";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { EASE, Reveal, Stagger, StaggerItem, Tilt } from "../motion";
import { Cta } from "../cta";
import { FaqItem } from "../faq";
import { TppMark } from "../logo";
import { compactUsd, targetRows, usd, usePrograms } from "../data";
import { APP, href } from "../routes";

export type ContestTerms = { target: number; program: string; size: number };

const SIGNUP = `${APP.login}?mode=signup`;
const LOGIN = `${APP.login}?redirect=/dashboard/contest`;
const DASHBOARD = "/dashboard/contest";
const SHARE_TEXT = "Join The People Prop and start your trading journey! Sign up with my link:";

type Me = { status: "loading" | "guest" | "error" } | { status: "ready"; data: ReferralSummary };

/** The visitor's own link and progress, when they're signed in. */
function useMe(): Me {
  const [me, setMe] = useState<Me>({ status: "loading" });
  useEffect(() => {
    let alive = true;
    fetch("/api/referrals", { cache: "no-store" })
      .then(async (res): Promise<Me> => {
        if (res.status === 401) return { status: "guest" };
        if (!res.ok) return { status: "error" };
        return { status: "ready", data: (await res.json()) as ReferralSummary };
      })
      .then((next) => alive && setMe(next))
      .catch(() => alive && setMe({ status: "error" }));
    return () => {
      alive = false;
    };
  }, []);
  return me;
}

/** "3-step" → the program's short label from the catalogue, plus the size: "$10K 3-Step". */
function useReward(terms: ContestTerms) {
  const programs = usePrograms();
  const program = programs.find((p) => p.key === terms.program);
  const name = program?.shortLabel ?? terms.program.replace(/(^|-)(\w)/g, (_, d: string, c: string) => `${d}${c.toUpperCase()}`);
  const fee = program?.fees[terms.size as AccountSize];
  // non-breaking hyphen: "3-Step" never splits across lines in the big headings
  const nb = (text: string) => text.replace(/-/g, "\u2011");
  return { program, name: nb(name), label: nb(`${compactUsd(terms.size)} ${name}`), fee: typeof fee === "number" ? fee : null };
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard blocked: the link stays selectable
    }
  };
  return { copied, copy };
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
  transition: { duration: 1.1, delay, ease: EASE },
});

/* ───────────────────────── hero ───────────────────────── */

function Hero({ terms, me }: { terms: ContestTerms; me: Me }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { label, fee } = useReward(terms);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <section ref={ref} id="top" className="relative isolate z-10 overflow-x-clip bg-[#040a08]">
      {/* path-traced plate: twenty glass tokens, one per friend, around the reward */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-0 h-[74svh] lg:inset-0 lg:h-auto"
          initial={reduce ? false : { opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
          style={reduce ? undefined : { y: artY }}
        >
          <picture>
            <source media="(max-width: 1023px)" srcSet="/art/contest-mobile.webp" width={1080} height={1920} />
            <img
              src="/art/contest-hero.webp"
              width={2560}
              height={1600}
              alt=""
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover object-[50%_0%] [mask-image:linear-gradient(180deg,#000_55%,transparent_96%)] lg:[mask-image:none]"
            />
          </picture>
        </motion.div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(4,10,8,0.92)_0%,rgba(4,10,8,0.6)_36%,rgba(4,10,8,0)_60%)] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-[linear-gradient(0deg,#040a08_12%,rgba(4,10,8,0)_100%)]" />
        <div className="g-grain" />
      </div>

      <Container className="relative pt-[46svh] pb-44 lg:flex lg:min-h-[calc(100svh-40px)] lg:items-center lg:pt-28 lg:pb-56">
        <div className="max-w-[720px]">
          <motion.p {...rise(0.1)} className="g-pill g-hair bg-white/[0.07] text-white/85 backdrop-blur-md">
            <Trophy className="h-3.5 w-3.5 text-[var(--g-lime)]" />
            Referral contest
          </motion.p>
          <motion.h1 {...rise(0.2)} className="g-display mt-7 text-[clamp(2.6rem,5.4vw,5.2rem)]">
            <span className="g-shade-dark block">Invite {terms.target} friends.</span>
            <span className="g-shade-lime block">Trade {compactUsd(terms.size)} on us.</span>
          </motion.h1>
          <motion.p {...rise(0.34)} className="mt-7 max-w-[34rem] text-[clamp(1.05rem,1.35vw,1.2rem)] leading-[1.6] text-white/70">
            Share your link. When {terms.target} different friends sign up through it, claim a free{" "}
            <span className="font-semibold text-white">{label}</span> challenge. No fee, one per person.
          </motion.p>
          <motion.div {...rise(0.46)} className="mt-9 flex flex-wrap items-center gap-3">
            {me.status === "ready" ? (
              <>
                <Button href="#your-link">Get my link</Button>
                <Button href={DASHBOARD} kind="glass" arrow={false}>
                  Open my contest
                </Button>
              </>
            ) : (
              <>
                <Button href={SIGNUP}>Get your link</Button>
                <Button href={LOGIN} kind="glass" arrow={false}>
                  I have an account
                </Button>
              </>
            )}
          </motion.div>
          {/* narrow enough to wrap before the glass seats on the right of the art */}
          <motion.ul {...rise(0.58)} className="mt-10 flex max-w-[30rem] flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-white/60">
            {fee != null ? (
              <li>
                Normally <span className="text-white/45 line-through">{usd(fee)}</span> <span className="font-semibold text-[var(--g-lime-soft)]">free</span>
              </li>
            ) : null}
            <li className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--g-lime)]" /> Claimed instantly
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-[var(--g-lime)]" /> Google sign-ups count straight away
            </li>
          </motion.ul>
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── your link ───────────────────────── */

function Ring({ value, target }: { value: number; target: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const done = Math.min(1, target > 0 ? value / target : 0);
  return (
    <div className="relative grid h-40 w-40 shrink-0 place-items-center">
      <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#contest-ring)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          whileInView={{ strokeDashoffset: c * (1 - done) }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease: EASE }}
        />
        <defs>
          <linearGradient id="contest-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8fc21d" />
            <stop offset="100%" stopColor="#cbfb45" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <p className="g-num text-[38px] leading-none font-semibold tracking-[-0.05em] text-white">
          {Math.min(value, target)}
          <span className="text-[18px] text-white/40">/{target}</span>
        </p>
        <p className="mt-1.5 text-[11.5px] text-white/50">count</p>
      </div>
    </div>
  );
}

function LinkSlab({ terms, me }: { terms: ContestTerms; me: Me }) {
  const { copied, copy } = useCopy();
  const { label } = useReward(terms);

  return (
    <div id="your-link" className="relative z-20 -mt-32 scroll-mt-28 sm:-mt-36">
      <Container>
        <Reveal y={40} amount={0.25}>
          <div className="g-glass-ink g-hair relative overflow-hidden rounded-[36px] p-6 shadow-[0_60px_120px_-50px_rgba(0,0,0,0.9)] sm:p-10">
            <div aria-hidden="true" className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.14),transparent)]" />
            {me.status === "ready" ? (
              <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr]">
                <Ring value={me.data.verified} target={me.data.reward.target} />
                <div className="min-w-0">
                  <Eyebrow icon={Link2}>Your link</Eyebrow>
                  <p className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-white">
                    {me.data.reward.claimed
                      ? `You've claimed your free ${label}.`
                      : me.data.verified >= me.data.reward.target
                        ? `Target reached: claim your ${label} in the dashboard.`
                        : `${Math.max(0, me.data.reward.target - me.data.verified)} more friends to go.`}
                  </p>
                  <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                    <input
                      readOnly
                      value={me.data.link}
                      aria-label="Your referral link"
                      onFocus={(e) => e.currentTarget.select()}
                      className="g-num h-[50px] min-w-0 shrink-0 rounded-[16px] sm:flex-1 sm:shrink bg-white/[0.05] px-4 text-[14.5px] text-white ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-[var(--g-lime)]/60"
                    />
                    <button type="button" onClick={() => copy(me.data.link)} className="g-btn g-btn-lime h-[50px]">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied" : "Copy link"}
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {[
                      { label: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${me.data.link}`)}` },
                      { label: "Telegram", url: `https://t.me/share/url?url=${encodeURIComponent(me.data.link)}&text=${encodeURIComponent(SHARE_TEXT)}` },
                      { label: "X", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${SHARE_TEXT} ${me.data.link}`)}` },
                    ].map((s) => (
                      <a
                        key={s.label}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2 text-[13px] font-semibold text-white/80 ring-1 ring-white/10 transition-colors hover:bg-[var(--g-lime)] hover:text-[var(--g-ink)]"
                      >
                        <Send className="h-3.5 w-3.5" /> {s.label}
                      </a>
                    ))}
                    <Link href={DASHBOARD} className="ml-auto inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--g-lime-soft)]">
                      Full progress <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <dl className="mt-6 grid max-w-md grid-cols-3 gap-2">
                    {[
                      { k: "Signed up", v: me.data.signups },
                      { k: "Count", v: me.data.verified },
                      { k: "Bought", v: me.data.paid },
                    ].map(({ k, v }) => (
                      <div key={k} className="rounded-[16px] bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/[0.07]">
                        <dd className="g-num text-[19px] font-semibold text-white">{v}</dd>
                        <dt className="text-[11.5px] text-white/45">{k}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : me.status === "loading" ? (
              <div className="relative flex items-center gap-4 py-6">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-[var(--g-lime)]" />
                <p className="text-[14.5px] text-white/60">Checking for your link…</p>
              </div>
            ) : (
              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <Eyebrow icon={Link2}>Your link</Eyebrow>
                  <h2 className="g-title g-shade-dark mt-5 text-[clamp(1.9rem,3.4vw,3rem)]">Every account comes with one.</h2>
                  <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-white/60">
                    Create a free account and your link is ready on your dashboard. It counts friends for this contest and earns you commission when they buy a challenge.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={SIGNUP} className="g-btn g-btn-lime group">
                    Create free account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link href={LOGIN} className="g-btn g-btn-glass">
                    Log in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </div>
  );
}

/* ───────────────────────── invite chain ───────────────────────── */

function CopyDemo() {
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setCopied((v) => !v), 1800);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/[0.06] p-1.5 pl-4 ring-1 ring-white/10">
      <span className="g-num min-w-0 flex-1 truncate text-[13px] text-white/70">thepeopleprop.live/ref/••••••••</span>
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors duration-500", copied ? "bg-[var(--g-lime)] text-[var(--g-ink)]" : "bg-white/10 text-white")}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </span>
    </div>
  );
}

function FriendsDemo() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(1);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setN((v) => (v % 3) + 1), 1500);
    return () => clearInterval(t);
  }, [reduce]);
  const rows = [
    { icon: UserPlus, text: "New sign-up", sub: "through your link" },
    { icon: MailCheck, text: "Own device and connection", sub: "counts toward 20" },
    { icon: UserPlus, text: "New sign-up", sub: "with Google" },
  ];
  const shown = reduce ? 3 : n;
  return (
    <div className="flex h-[132px] flex-col justify-end gap-2">
      <AnimatePresence initial={false}>
        {rows.slice(0, shown).map(({ icon: Icon, text, sub }, i) => (
          <motion.div
            key={`${text}-${i}`}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex items-center gap-3 rounded-[14px] bg-white/[0.06] px-3 py-2 ring-1 ring-white/10"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--g-lime)]/15 text-[var(--g-lime)]">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[12.5px] font-semibold text-white">{text}</span>
            <span className="ml-auto text-[11.5px] text-white/45">{sub}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ClaimDemo({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--g-lime)] px-4 py-2 text-[13px] font-semibold text-[var(--g-ink)] shadow-[0_12px_30px_-12px_rgba(203,251,69,0.7)]">
        <Gift className="h-4 w-4" /> Claim free account
      </span>
      <span className="inline-flex w-fit items-center gap-2 rounded-[14px] bg-white/[0.06] px-3 py-2 text-[12.5px] text-white/75 ring-1 ring-white/10">
        <CheckCircle2 className="h-4 w-4 text-[var(--g-lime)]" /> {label} created
      </span>
    </div>
  );
}

function InviteChain({ terms }: { terms: ContestTerms }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.3 });
  const { label } = useReward(terms);
  const stations: { n: string; title: string; body: string; demo: ReactNode }[] = [
    { n: "01", title: "Copy your link", body: "Every account has one. It's the same link for the contest and for affiliate commission.", demo: <CopyDemo /> },
    {
      n: "02",
      title: "Friends sign up",
      body: "A friend counts once they create an account through your link on their own device and internet connection. Accounts made from yours, or several from one connection, don't count.",
      demo: <FriendsDemo />,
    },
    { n: "03", title: `Claim at ${terms.target}`, body: `Claim from your dashboard and your free ${label} is created. No fee. If any sign-up fails our checks, our team reviews the claim first.`, demo: <ClaimDemo label={label} /> },
  ];

  return (
    <Section shell={false} className="pt-28 pb-28 sm:pt-36 sm:pb-36">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow icon={Share2}>How it works</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)]" lead="One link." fade={`${terms.target} friends. Done.`} />
          </Reveal>
        </div>

        <div ref={ref} className="relative mt-16">
          {/* the chain: a lime thread that runs through the three stations */}
          <svg aria-hidden="true" className="pointer-events-none absolute top-[38px] right-[16%] left-[16%] hidden h-[4px] w-[68%] lg:block" viewBox="0 0 100 4" preserveAspectRatio="none">
            <line x1="0" y1="2" x2="100" y2="2" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            <motion.line
              x1="0"
              y1="2"
              x2="100"
              y2="2"
              stroke="url(#chain)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: seen ? 1 : 0 }}
              transition={{ duration: 1.8, ease: EASE }}
            />
            <defs>
              <linearGradient id="chain" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#1d6656" />
                <stop offset="100%" stopColor="#cbfb45" />
              </linearGradient>
            </defs>
          </svg>
          <Stagger className="relative grid gap-5 lg:grid-cols-3" gap={0.14}>
            {stations.map((s) => (
              <StaggerItem key={s.n} className="h-full">
                <div className="flex h-full flex-col">
                  <span className="mx-auto grid h-[78px] w-[78px] place-items-center rounded-full bg-[#101614] text-[18px] font-semibold text-[var(--g-lime)] ring-1 ring-white/10 shadow-[0_0_0_8px_#0e1110]">
                    {s.n}
                  </span>
                  <article className="g-card-dark g-hair mt-6 flex flex-1 flex-col rounded-[30px] p-6 sm:p-7">
                    <div className="rounded-[22px] bg-black/25 p-4 ring-1 ring-white/[0.06]">{s.demo}</div>
                    <h3 className="mt-6 text-[21px] font-semibold tracking-[-0.03em] text-white">{s.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-white/60">{s.body}</p>
                  </article>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </Section>
  );
}

/* ───────────────────────── seats ───────────────────────── */

function Seats({ terms, me }: { terms: ContestTerms; me: Me }) {
  const { label } = useReward(terms);
  const target = terms.target;
  const own = me.status === "ready" ? Math.min(me.data.verified, target) : null;
  const [n, setN] = useState<number | null>(null);
  const filled = n ?? own ?? Math.round(target * 0.35);
  const done = filled >= target;
  const set = (v: number) => setN(Math.max(0, Math.min(target, v)));

  return (
    <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-28 pb-32 sm:rounded-t-[56px] sm:pt-36 sm:pb-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.55),transparent)]" />
      </div>
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <Eyebrow tone="light" icon={Users}>
                {own != null ? "Your seats" : "Try it"}
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)]" lead={`${target} seats.`} fade="Fill them." />
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <Lede tone="light" className="lg:mb-2">
              {own != null
                ? `This is your real count: ${own} of ${target} seats are filled by friends whose sign-ups count.`
                : `Each friend who signs up on their own device and connection fills a seat. Fill all ${target} and the account unlocks. Drag to try it.`}
            </Lede>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14">
          <div className="g-card-paper g-hair g-hair-ink grid gap-8 rounded-[36px] p-6 sm:p-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-10 sm:gap-3">
                {Array.from({ length: target }).map((_, i) => {
                  const on = i < filled;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Fill ${i + 1} seats`}
                      onClick={() => set(i + 1 === filled ? i : i + 1)}
                      className={cn(
                        "grid aspect-square place-items-center rounded-full transition-all duration-500 [transition-timing-function:var(--g-out)]",
                        on
                          ? "bg-[radial-gradient(circle_at_30%_25%,#ecffb8,#cbfb45_45%,#8fc21d)] text-[var(--g-ink)] shadow-[0_12px_24px_-12px_rgba(143,194,29,0.9)]"
                          : "bg-black/[0.04] text-black/25 ring-1 ring-black/[0.07] hover:bg-black/[0.07]",
                      )}
                    >
                      {on ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="g-num text-[12px] font-semibold">{i + 1}</span>}
                    </button>
                  );
                })}
              </div>
              <div className="mt-7 flex items-center gap-3">
                <button type="button" onClick={() => set(filled - 1)} aria-label="One fewer" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/[0.05] text-[var(--g-ink)] ring-1 ring-black/[0.08]">
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={target}
                  value={filled}
                  onChange={(e) => set(Number(e.target.value))}
                  aria-label="Friends who count"
                  className="h-2 w-full cursor-pointer accent-[#1d6656]"
                />
                <button type="button" onClick={() => set(filled + 1)} aria-label="One more" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--g-ink)] text-[var(--g-lime)]">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-[28px] bg-[var(--g-ink)] p-6 text-white">
              <div>
                <p className="text-[13px] font-medium text-white/50">Friends who count</p>
                <p className="g-num mt-2 text-[56px] leading-none font-semibold tracking-[-0.05em]">
                  {filled}
                  <span className="text-[24px] text-white/35">/{target}</span>
                </p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[linear-gradient(90deg,#8fc21d,#cbfb45)] transition-[width] duration-500" style={{ width: `${(filled / target) * 100}%` }} />
                </div>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {done ? (
                  <motion.div key="done" initial={{ opacity: 0, y: 12, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                    <p className="inline-flex items-center gap-2 rounded-full bg-[var(--g-lime)] px-3 py-1.5 text-[12.5px] font-semibold text-[var(--g-ink)]">
                      <Sparkles className="h-3.5 w-3.5" /> Unlocked
                    </p>
                    <p className="mt-3 text-[20px] font-semibold tracking-[-0.02em]">Your free {label} is ready to claim.</p>
                  </motion.div>
                ) : (
                  <motion.div key="todo" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                    <p className="text-[20px] font-semibold tracking-[-0.02em]">
                      {target - filled} more to unlock your free {label}.
                    </p>
                    <p className="mt-2 text-[13.5px] text-white/50">Accounts made from your device or connection, or several from one connection, don&apos;t fill a seat.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ───────────────────────── reward ───────────────────────── */

function Reward({ terms }: { terms: ContestTerms }) {
  const { program, label, fee } = useReward(terms);
  const specs = program
    ? [
        ...targetRows(program, terms.size).map((r) => ({ k: r.label, v: r.value })),
        { k: "Daily loss limit", v: program.dailyDrawdown },
        { k: "Overall loss limit", v: program.maxDrawdown },
        { k: "Min. trading days", v: `${program.minTradingDays} per phase` },
        { k: "Profit split", v: `${program.profitSplit}%` },
        { k: "Payout cycle", v: program.payoutCycle },
      ]
    : [];

  return (
    <Section className="z-10 -mt-12 rounded-t-[44px] pt-36 pb-28 sm:rounded-t-[56px] sm:pt-44 sm:pb-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-24 left-[30%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(29,102,86,0.35),transparent)]" />
        <div className="g-grain" />
      </div>
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <Reveal>
            <Tilt max={6} className="mx-auto w-full max-w-[520px]">
              <div className="g-spot relative aspect-[1.586] overflow-hidden rounded-[30px] bg-[linear-gradient(135deg,#0f3f35_0%,#145244_38%,#2f6f61_70%,#cbfb45_140%)] p-7 shadow-[0_70px_120px_-50px_rgba(0,0,0,0.95)] ring-1 ring-white/15 sm:p-9">
                <div aria-hidden="true" className="absolute -top-24 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.35),transparent)]" />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,rgba(255,255,255,0.12)_48%,transparent_60%)]" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <TppMark className="h-6 text-white" />
                    <span className="rounded-full bg-black/25 px-3 py-1 text-[12px] font-semibold text-white ring-1 ring-white/15">{program?.label ?? label}</span>
                  </div>
                  <div>
                    <p className="text-[12.5px] font-medium tracking-wide text-white/60 uppercase">Account size</p>
                    <p className="g-num g-shade-dark text-[clamp(3.2rem,7vw,4.8rem)] leading-none font-semibold tracking-[-0.05em]">{usd(terms.size)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-white/70">
                      {fee != null ? (
                        <>
                          Normally <span className="line-through">{usd(fee)}</span>
                        </>
                      ) : (
                        "Challenge fee"
                      )}
                    </span>
                    <span className="rounded-full bg-[var(--g-lime)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--g-ink)]">Free</span>
                  </div>
                </div>
              </div>
            </Tilt>
          </Reveal>

          <div>
            <Reveal>
              <Eyebrow icon={Gift}>The reward</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)]" lead={`A real ${label}.`} fade="On us." />
            </Reveal>
            <Reveal delay={0.12}>
              <Lede className="mt-6">The same challenge traders buy, with the same rules. It&apos;s created on your account the moment you claim.</Lede>
            </Reveal>
            {specs.length ? (
              <Reveal delay={0.18}>
                <dl className="g-glass g-hair mt-8 grid grid-cols-1 divide-y divide-white/[0.07] overflow-hidden rounded-[24px] sm:grid-cols-2 sm:divide-y-0">
                  {specs.map((s, i) => (
                    <div key={s.k} className={cn("flex items-center justify-between gap-4 px-5 py-4", i % 2 === 1 && "sm:border-l sm:border-white/[0.07]", i > 1 && "sm:border-t sm:border-white/[0.07]")}>
                      <dt className="text-[13px] text-white/55">{s.k}</dt>
                      <dd className="g-num text-[14.5px] font-semibold text-white">{s.v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ───────────────────────── one link, two rewards ───────────────────────── */

function OneLink({ terms, me }: { terms: ContestTerms; me: Me }) {
  const { label } = useReward(terms);
  const rate = me.status === "ready" ? me.data.earnings.ratePct : null;
  const sides = [
    {
      icon: Trophy,
      eyebrow: "Contest",
      title: "Sign-ups",
      body: `Every friend who signs up on their own device and connection counts toward your free ${label}.`,
      points: [`${terms.target} sign-ups that count`, "One reward per person", "Track it in Dashboard → Contest"],
    },
    {
      icon: Scale,
      eyebrow: "Affiliate",
      title: "Purchases",
      body: rate != null ? `When one of those friends buys a challenge, you earn ${rate}% of it.` : "When one of those friends buys a challenge, you earn commission on it.",
      points: ["Paid into your affiliate balance", "Every challenge they buy", "Track it in Dashboard → Affiliate"],
    },
  ];

  return (
    <Section shell={false} className="pt-8 pb-36 sm:pb-44">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow icon={Link2}>Two rewards</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)]" lead="One link." fade="Counted twice." />
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center">
            <Lede className="mt-6 text-center">You don&apos;t need separate contest and affiliate links anymore. The same link does both.</Lede>
          </Reveal>
        </div>

        <div className="relative mt-16 grid gap-4 lg:grid-cols-2 lg:gap-24">
          {/* the link in the middle, feeding both sides */}
          <div aria-hidden="true" className="absolute top-1/2 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-[var(--g-lime)] text-[var(--g-ink)] shadow-[0_0_0_10px_#0e1110,0_30px_60px_-20px_rgba(203,251,69,0.6)]">
              <Link2 className="h-8 w-8" strokeWidth={2.2} />
            </div>
          </div>
          {sides.map(({ icon: Icon, eyebrow, title, body, points }, i) => (
            <Reveal key={title} delay={i * 0.1}>
              <div className={cn("g-hair relative h-full overflow-hidden rounded-[32px] p-7 sm:p-9", i === 0 ? "g-card-emerald" : "g-card-dark")}>
                <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-black/25 text-[var(--g-lime)] ring-1 ring-white/10">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <p className="mt-6 text-[13px] font-semibold tracking-wide text-white/55 uppercase">{eyebrow}</p>
                <h3 className="g-display g-shade-dark mt-1 text-[clamp(2rem,3.4vw,2.8rem)]">{title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/70">{body}</p>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {points.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-[14px] text-white/80">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--g-lime)]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ───────────────────────── rules + FAQ ───────────────────────── */

function RulesAndFaq({ terms }: { terms: ContestTerms }) {
  const { label, name } = useReward(terms);
  const rules = [
    "A friend counts once they sign up through your link on their own device and internet connection.",
    "Friends must be new to The People Prop. Existing accounts can't be added to your count.",
    "You can't refer yourself: accounts made from your device or internet connection don't count, and only the first sign-up from any one device or connection counts.",
    "If any sign-up fails these checks, our team reviews the claim before the account is created. Fake or duplicate accounts void the reward.",
    `One free ${label} per person.`,
    `Your ${label} is created when you claim it, with the standard ${name} rules.`,
    "Old contest and affiliate links still work and count toward the same total.",
  ];
  const faq = [
    { q: "Do my friends need to buy anything?", a: "No. A friend counts once they create an account through your link on their own device and connection. If they later buy a challenge, you also earn affiliate commission on it." },
    { q: "Why doesn't one of my sign-ups count?", a: "Your dashboard shows the reason next to each friend: it came from your own connection or device, or another sign-up already used that connection or device. Making several accounts yourself doesn't count." },
    { q: "Where do I see my progress?", a: "In your dashboard under Contest. The Affiliate section shows the same sign-ups, plus purchases and commission." },
    { q: "Is my contest link different from my affiliate link?", a: "No. Every account has one link. It counts sign-ups for the contest and purchases for commission." },
    { q: "Can I win more than once?", a: `No. The free ${label} is one per person.` },
    { q: "What happens when I claim?", a: `Your ${label} challenge is created on your account with the standard rules, straight away when every sign-up passed our checks, or after a quick review by our team. No payment needed.` },
  ];
  const [open, setOpen] = useState<string | null>(faq[0].q);

  return (
    <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-28 pb-40 sm:rounded-t-[56px] sm:pt-36 sm:pb-48">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
          <div className="min-w-0">
            <Reveal>
              <Eyebrow tone="light" icon={ShieldCheck}>
                Fair play
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.2rem,3.9vw,3.6rem)]" lead="The rules," fade="in full." />
            </Reveal>
            <Stagger className="mt-10 flex flex-col gap-2.5" gap={0.06}>
              {rules.map((r, i) => (
                <StaggerItem key={r}>
                  <div className="flex items-start gap-4 rounded-[20px] bg-black/[0.03] p-4">
                    <span className="g-num grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--g-ink)] text-[12.5px] font-semibold text-[var(--g-lime)]">{i + 1}</span>
                    <p className="pt-1 text-[14.5px] leading-relaxed text-[var(--g-ink)]/85">{r}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
          <div className="min-w-0">
            <Reveal>
              <Eyebrow tone="light" icon={Sparkles}>
                Questions
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.2rem,3.9vw,3.6rem)]" lead="Asked" fade="and answered." />
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="mt-10 flex flex-col gap-2.5">
                {faq.map((f) => (
                  <FaqItem key={f.q} item={f} open={open === f.q} onToggle={() => setOpen(open === f.q ? null : f.q)} />
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ───────────────────────── page ───────────────────────── */

export function ContestPage({ terms }: { terms: ContestTerms }) {
  const me = useMe();
  const { label } = useReward(terms);
  return (
    <>
      <Hero terms={terms} me={me} />
      <LinkSlab terms={terms} me={me} />
      <InviteChain terms={terms} />
      <Seats terms={terms} me={me} />
      <Reward terms={terms} />
      <OneLink terms={terms} me={me} />
      <RulesAndFaq terms={terms} />
      <Cta
        title={
          <>
            <span className="g-shade-dark">{terms.target} friends. </span>
            <span className="g-shade-lime">One free {label}.</span>
          </>
        }
        lede="Your link is on your dashboard the moment you sign up. Share it anywhere."
        primary={me.status === "ready" ? { label: "Open my contest", href: DASHBOARD } : { label: "Get your link", href: SIGNUP }}
        secondary={{ label: "See the challenges", href: href("challenges") }}
        size="md"
      />
    </>
  );
}
