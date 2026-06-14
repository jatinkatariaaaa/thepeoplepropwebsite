"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageLayout, PageHero, PageSection } from "@/components/layout";
import { Reveal, GsapWords, Magnetic, EASE } from "@/components/ui/Animations";
import {
  Mail,
  Send,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Check,
  MessageCircle,
} from "lucide-react";

const subjects = [
  "General inquiry",
  "Challenge support",
  "Funded account / payouts",
  "Partnerships & affiliates",
  "Press & media",
  "Other",
];

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.473-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden className={className}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.69 13.69 0 0 0-.608 1.249 18.27 18.27 0 0 0-5.487 0c-.165-.39-.4-.84-.617-1.25a.077.077 0 0 0-.079-.036 19.74 19.74 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.027 14.2 14.2 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: subjects[0],
    message: "",
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", subject: subjects[0], message: "" });
  }

  const channels = [
    {
      icon: Mail,
      label: "Email",
      primary: "support@thepeopleprop.com",
      detail: "All inquiries · 4h SLA",
      href: "mailto:support@thepeopleprop.com",
    },
    {
      icon: TelegramIcon,
      label: "Telegram",
      primary: "@thepeopleprop",
      detail: "Instant replies · 24/7",
      href: "#",
    },
    {
      icon: DiscordIcon,
      label: "Discord",
      primary: "discord.gg/peopleprop",
      detail: "Community · 12k members",
      href: "#",
    },
  ];

  return (
    <PageLayout>
      <PageHero
        eyebrow="Contact"
        title="Talk to a real TPP trader"
        titleHighlight={["real", "trader"]}
        description="The fastest way to reach us is Telegram or Discord — average reply under five minutes. For everything else, the form below routes directly to our team."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      {/* ═══ Contact Methods — cream ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            {/* Left: info cards */}
            <Reveal>
              <div className="space-y-5">
                {/* Response time card */}
                <div className="relative overflow-hidden rounded-2xl bg-[#0c0c0c] p-6 text-white">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-12 -right-10 h-48 w-48 rounded-full"
                    style={{
                      background:
                        "radial-gradient(closest-side, rgba(203,251,69,0.18), transparent)",
                    }}
                  />
                  <div className="mb-3 flex items-center gap-3">
                    <Clock className="h-4 w-4 text-[#cbfb45]" strokeWidth={2.2} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cbfb45]">
                      Avg. response time
                    </span>
                  </div>
                  <div className="text-[32px] font-bold tabular-nums tracking-tight">
                    &lt; 5 minutes
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">
                    Live support 24/7 on Telegram & Discord. Email tickets
                    answered within four hours, seven days a week.
                  </p>
                </div>

                {/* Channel cards */}
                {channels.map((c, i) => {
                  const Icon = c.icon as React.ComponentType<{ className?: string }>;
                  return (
                    <a
                      key={i}
                      href={c.href}
                      className="group flex items-start gap-4 rounded-2xl border border-[#0c0c0c]/10 bg-white/50 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0c0c0c]">
                        <Icon className="h-4 w-4 text-[#cbfb45]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6c6a68]">
                          {c.label}
                        </div>
                        <div className="mt-1 truncate text-[14px] font-medium text-[#0c0c0c]">
                          {c.primary}
                        </div>
                        <div className="mt-0.5 text-[12px] text-[#6c6a68]">
                          {c.detail}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#0c0c0c]/20 transition-all group-hover:translate-x-0.5 group-hover:text-[#cbfb45]" />
                    </a>
                  );
                })}

                {/* FAQ link */}
                <div className="rounded-2xl border border-[#0c0c0c]/10 bg-white/30 p-5">
                  <p className="text-[13.5px] leading-relaxed text-[#6c6a68]">
                    Looking for self-serve answers? Most questions are already
                    covered in the rulebook.
                  </p>
                  <Link
                    href="/rules"
                    className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#0c0c0c] transition-colors hover:text-[#cbfb45]"
                  >
                    Browse the FAQ
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Right: form */}
            <Reveal delay={0.1}>
              <div className="rounded-3xl border border-[#0c0c0c]/10 bg-white/60 p-7 shadow-sm md:backdrop-blur-sm md:p-9">
                <h2 className="mb-2 text-[24px] font-bold tracking-tight text-[#0c0c0c] md:text-[28px]">
                  Send us a message
                </h2>
                <p className="mb-8 text-[14px] text-[#6c6a68]">
                  Fill out the form and a TPP team member will respond within
                  four hours.
                </p>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6c6a68]"
                      >
                        Full name
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Marcus Adeyemi"
                        className="h-12 w-full rounded-xl border border-[#0c0c0c]/15 bg-white px-4 text-[14px] text-[#0c0c0c] outline-none transition-colors placeholder:text-[#0c0c0c]/30 focus:border-[#cbfb45] focus:ring-2 focus:ring-[#cbfb45]/30"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cemail"
                        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6c6a68]"
                      >
                        Email address
                      </label>
                      <input
                        id="cemail"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="you@domain.com"
                        className="h-12 w-full rounded-xl border border-[#0c0c0c]/15 bg-white px-4 text-[14px] text-[#0c0c0c] outline-none transition-colors placeholder:text-[#0c0c0c]/30 focus:border-[#cbfb45] focus:ring-2 focus:ring-[#cbfb45]/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6c6a68]"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className="h-12 w-full rounded-xl border border-[#0c0c0c]/15 bg-white px-4 text-[14px] text-[#0c0c0c] outline-none transition-colors focus:border-[#cbfb45] focus:ring-2 focus:ring-[#cbfb45]/30"
                    >
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6c6a68]"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Tell us what we can help with..."
                      className="w-full resize-none rounded-xl border border-[#0c0c0c]/15 bg-white px-4 py-3 text-[14px] text-[#0c0c0c] outline-none transition-colors placeholder:text-[#0c0c0c]/30 focus:border-[#cbfb45] focus:ring-2 focus:ring-[#cbfb45]/30"
                    />
                  </div>

                  <div className="flex flex-col items-start justify-between gap-4 pt-2 sm:flex-row sm:items-center">
                    <p className="text-[12px] text-[#6c6a68]">
                      By submitting, you accept our{" "}
                      <Link
                        href="#"
                        className="text-[#0c0c0c] underline underline-offset-2"
                      >
                        privacy policy
                      </Link>
                      .
                    </p>
                    <Magnetic>
                      <button
                        type="submit"
                        className="relative flex h-12 items-center gap-2 overflow-hidden rounded-full bg-[#cbfb45] px-7 text-[15px] font-semibold text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:shadow-lg active:scale-[0.97]"
                      >
                        <motion.span
                          animate={{ opacity: sent ? 0 : 1 }}
                          className="inline-flex items-center gap-2"
                        >
                          Send message
                          <Send className="h-4 w-4" />
                        </motion.span>
                        {sent && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center gap-2"
                          >
                            <Check className="h-4 w-4" /> Message sent
                          </motion.span>
                        )}
                      </button>
                    </Magnetic>
                  </div>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </PageSection>
    </PageLayout>
  );
}