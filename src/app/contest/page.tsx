"use client";

import { PageLayout, PageHero, PageSection } from "@/components/layout";
import { Reveal, GsapWords, Magnetic, Floating } from "@/components/ui/Animations";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Link2,
  Gift,
  Shield,
  Clock,
  Star,
  CheckCircle,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

/* ─── Social share icons ─── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.473-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/* ─── Types ─── */
interface ContestEntry {
  id: string;
  referral_code: string;
  referral_count: number;
  target: number;
  claimed: boolean;
}

/* ─── Step data ─── */
const steps = [
  {
    icon: Link2,
    title: "Sign Up & Get Your Link",
    description:
      "Create a free account on The People Prop. We'll instantly generate your unique contest referral link — ready to share in seconds.",
  },
  {
    icon: Share2,
    title: "Share With 10 Friends",
    description:
      "Send your link via WhatsApp, Telegram, Twitter, or any channel. When your friends sign up using your link, they count toward your total.",
  },
  {
    icon: Gift,
    title: "Claim Your Free Account",
    description:
      "Once 10 friends have signed up, you'll unlock a FREE 10K 3-Step Evaluation account. No payment needed — ever.",
  },
];

/* ─── Prize features ─── */
const prizeFeatures = [
  "$10,000 Virtual Capital",
  "3-Step Evaluation Process",
  "Up to 90% Profit Split",
  "No Time Limit",
  "Trade Forex, Crypto & More",
  "Full Dashboard Access",
];

/* ─── Contest rules ─── */
const contestRules = [
  "Friends must complete a full sign-up (email verified)",
  "Each friend must be a unique user (no duplicate accounts)",
  "Self-referrals are not allowed",
  "Contest is limited time — act fast!",
  "One free account per participant",
  "Account will be provisioned within 24 hours of claiming",
];

export default function ContestPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<ContestEntry | null>(null);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);

  /* Auth check */
  useEffect(() => {
    async function checkAuth() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          setUser({ id: authUser.id, email: authUser.email ?? undefined });
        }
      } catch {
        // not logged in
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  /* Auto-join contest when logged in */
  useEffect(() => {
    if (!user) return;
    async function joinContest() {
      setJoining(true);
      try {
        const res = await fetch("/api/contest/join", { method: "POST" });
        const data = await res.json();
        if (data.success && data.entry) {
          setEntry(data.entry);
          setLink(data.link);
        }
      } catch (err) {
        console.error("Failed to join contest:", err);
      } finally {
        setJoining(false);
      }
    }
    joinContest();
  }, [user]);

  /* Copy link */
  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  /* Share URLs */
  const shareText = `Join The People Prop and get a funded trading account! Sign up with my link: ${link}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join The People Prop and get a funded trading account!")}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <PageLayout>
      {/* ═══ Hero ═══ */}
      <PageHero
        eyebrow="Limited Time Contest"
        title="Invite 10 Friends. Get Funded for Free."
        titleHighlight={["10 Friends", "Free"]}
        description="Share your unique referral link with 10 friends. When they all sign up, you'll receive a FREE 10K 3-Step evaluation account — absolutely no cost."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Contest", href: "/contest" },
        ]}
      />

      {/* ═══ How It Works — cream ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-14 text-center">
              <div className="mb-4 flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
                <span className="h-px w-8 bg-[#0c0c0c]/20" />
                Simple process
                <span className="h-px w-8 bg-[#0c0c0c]/20" />
              </div>
              <GsapWords
                text="How it works"
                highlight={["works"]}
                as="h2"
                className="mb-4 font-bold tracking-[-0.03em] text-[#0c0c0c]"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  lineHeight: 1.05,
                }}
              />
              <p className="mx-auto max-w-lg text-[15px] leading-relaxed text-[#6c6a68]">
                Three simple steps stand between you and a free funded account.
                No catches, no hidden fees.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal key={index} delay={index * 0.1}>
                  <div className="group rounded-2xl border border-[#0c0c0c]/10 bg-white/60 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:backdrop-blur-sm">
                    {/* Step number */}
                    <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#0c0c0c] text-sm font-bold text-[#cbfb45]">
                      {index + 1}
                    </div>

                    {/* Icon */}
                    <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#cbfb45]/15 transition-colors duration-300 group-hover:bg-[#cbfb45]/25">
                      <Icon className="h-6 w-6 text-[#0c0c0c]" strokeWidth={1.8} />
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 text-lg font-bold tracking-tight text-[#0c0c0c]">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[14px] leading-relaxed text-[#6c6a68]">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </PageSection>

      {/* ═══ Prize Details — dark ═══ */}
      <PageSection variant="dark">
        <div className="relative mx-auto max-w-4xl">
          {/* Ambient orbs */}
          <Floating
            className="pointer-events-none absolute -left-[15%] top-[10%] hidden h-[30vw] w-[30vw] rounded-full bg-[#cbfb45]/[0.06] blur-[120px] md:block"
            amplitude={20}
            duration={9}
          />
          <Floating
            className="pointer-events-none absolute -right-[10%] bottom-[5%] hidden h-[25vw] w-[25vw] rounded-full bg-[#cbfb45]/[0.08] blur-[100px] md:block"
            amplitude={25}
            duration={11}
            delay={1}
          />

          <Reveal>
            <div className="mb-12 text-center">
              <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#cbfb45]">
                The prize
              </div>
              <GsapWords
                text="What you'll get"
                highlight={["get"]}
                className="font-bold tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              />
              <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/50">
                Refer 10 friends and unlock instant access to a real evaluation
                account — on us.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-8 md:p-12 md:backdrop-blur-sm">
              {/* Glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
                style={{
                  background:
                    "radial-gradient(closest-side, rgba(203,251,69,0.15), transparent)",
                }}
              />

              <div className="relative z-10 grid gap-10 md:grid-cols-2 md:items-center">
                {/* Left — prize name */}
                <div>
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#cbfb45]/20 bg-[#cbfb45]/10 px-3 py-1.5">
                    <Star className="h-3.5 w-3.5 text-[#cbfb45]" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#cbfb45]">
                      Free reward
                    </span>
                  </div>
                  <h3 className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
                    10K 3-Step
                    <br />
                    Evaluation Account
                  </h3>
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg text-white/40 line-through">
                      Worth $99
                    </span>
                    <span className="text-3xl font-black tracking-tight text-[#cbfb45]">
                      FREE
                    </span>
                  </div>
                </div>

                {/* Right — features */}
                <div className="space-y-3.5">
                  {prizeFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 shrink-0 text-[#cbfb45]" />
                      <span className="text-[15px] text-white/80">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </PageSection>

      {/* ═══ Contest Rules — cream ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="mb-12 text-center">
              <div className="mb-4 flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
                <span className="h-px w-8 bg-[#0c0c0c]/20" />
                Fair &amp; transparent
                <span className="h-px w-8 bg-[#0c0c0c]/20" />
              </div>
              <GsapWords
                text="Contest Rules"
                highlight={["Rules"]}
                as="h2"
                className="font-bold tracking-[-0.03em] text-[#0c0c0c]"
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  lineHeight: 1.05,
                }}
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-[#0c0c0c]/10 bg-white/60 p-6 md:p-8 md:backdrop-blur-sm">
              <div className="space-y-4">
                {contestRules.map((rule, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl p-3 transition-colors duration-200 hover:bg-[#0c0c0c]/[0.03]"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#0c0c0c]">
                      <Shield className="h-4 w-4 text-[#cbfb45]" />
                    </div>
                    <p className="pt-1.5 text-[15px] leading-relaxed text-[#0c0c0c]">
                      {rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </PageSection>

      {/* ═══ Get Your Link — cream ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <div className="mb-4 flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
              <span className="h-px w-8 bg-[#0c0c0c]/20" />
              Your referral link
              <span className="h-px w-8 bg-[#0c0c0c]/20" />
            </div>
            <GsapWords
              text="Start sharing now"
              highlight={["sharing"]}
              as="h2"
              className="mb-4 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                lineHeight: 1.05,
              }}
            />
            <p className="mx-auto mb-10 max-w-md text-[15px] leading-relaxed text-[#6c6a68]">
              {user
                ? "Copy your unique referral link and start sharing it with friends."
                : "Sign in to generate your unique referral link and start earning your free account."}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            {loading ? (
              /* Loading state */
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0c0c0c]/20 border-t-[#cbfb45]" />
                <p className="text-[13px] text-[#6c6a68]">Checking your session…</p>
              </div>
            ) : !user ? (
              /* Not logged in */
              <Magnetic>
                <Link
                  href="/login?redirect=/contest"
                  className="group inline-flex h-14 items-center gap-2 rounded-full bg-[#0c0c0c] pl-3 pr-6 text-[15px] font-semibold text-[#f1eade] shadow-xl transition-all duration-300 hover:scale-[1.04] hover:rounded-xl"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                  Get Your Referral Link
                </Link>
              </Magnetic>
            ) : joining ? (
              /* Joining contest */
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0c0c0c]/20 border-t-[#cbfb45]" />
                <p className="text-[13px] text-[#6c6a68]">Generating your referral link…</p>
              </div>
            ) : entry && link ? (
              /* Logged in — show link & share */
              <div className="space-y-6">
                {/* Progress indicator */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[#cbfb45]/30 bg-[#cbfb45]/10 px-4 py-2">
                  <Users className="h-4 w-4 text-[#0c0c0c]" />
                  <span className="text-[13px] font-semibold text-[#0c0c0c]">
                    {entry.referral_count} / 10 friends referred
                  </span>
                </div>

                {/* Link box */}
                <div className="rounded-xl border-2 border-dashed border-[#cbfb45] bg-[#0c0c0c] p-4">
                  <p className="break-all font-mono text-[14px] text-white md:text-[15px]">
                    {link}
                  </p>
                </div>

                {/* Copy button */}
                <button
                  onClick={copyLink}
                  className="mx-auto flex h-11 items-center gap-2 rounded-full bg-[#cbfb45] px-6 text-[14px] font-semibold text-[#0c0c0c] transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </button>

                {/* Share buttons */}
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[13px] text-[#6c6a68]">Share via:</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-xl bg-[#25D366] text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    title="Share on WhatsApp"
                  >
                    <WhatsAppIcon />
                  </a>
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-xl bg-[#0088cc] text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    title="Share on Telegram"
                  >
                    <TelegramIcon />
                  </a>
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-10 w-10 place-items-center rounded-xl bg-[#0c0c0c] text-white transition-all duration-200 hover:scale-110 hover:shadow-lg"
                    title="Share on X (Twitter)"
                  >
                    <XIcon />
                  </a>
                </div>

                {/* Eligible notice */}
                {entry.referral_count >= 10 && !entry.claimed && (
                  <Reveal>
                    <div className="mt-4 rounded-2xl border border-[#cbfb45]/30 bg-[#cbfb45]/10 p-5">
                      <div className="flex items-center justify-center gap-2 text-lg font-bold text-[#0c0c0c]">
                        <Gift className="h-5 w-5" />
                        You&apos;re eligible! Claim your free account.
                      </div>
                      <p className="mt-2 text-[14px] text-[#6c6a68]">
                        Your account will be provisioned within 24 hours.
                      </p>
                    </div>
                  </Reveal>
                )}
              </div>
            ) : (
              /* Fallback — show login button */
              <Magnetic>
                <Link
                  href="/login?redirect=/contest"
                  className="group inline-flex h-14 items-center gap-2 rounded-full bg-[#0c0c0c] pl-3 pr-6 text-[15px] font-semibold text-[#f1eade] shadow-xl transition-all duration-300 hover:scale-[1.04] hover:rounded-xl"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                  Get Your Referral Link
                </Link>
              </Magnetic>
            )}
          </Reveal>
        </div>
      </PageSection>

      {/* ═══ Final CTA — lime ═══ */}
      <PageSection variant="lime">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <GsapWords
              text="Ready to get funded for free?"
              highlight={["free?"]}
              as="h2"
              className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mb-10 text-lg leading-relaxed text-[#0c0c0c]/60">
              Join thousands of traders who are sharing their link and earning
              free evaluation accounts. The contest won&apos;t last forever — start
              today.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Magnetic>
                <Link
                  href="/login?redirect=/contest"
                  className="group inline-flex h-14 items-center gap-2 rounded-full bg-[#0c0c0c] pl-3 pr-6 text-[15px] font-semibold text-[#f1eade] shadow-xl transition-all duration-300 hover:scale-[1.04] hover:rounded-xl"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                  Join the Contest Now
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/challenges"
                  className="inline-flex h-14 items-center rounded-full border border-[#0c0c0c]/30 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5"
                >
                  View challenges
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </PageSection>
    </PageLayout>
  );
}
