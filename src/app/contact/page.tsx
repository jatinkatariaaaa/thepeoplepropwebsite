"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, Clock, ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { V3Navbar } from "@/components/layout/V3Navbar";
import { V3Footer } from "@/components/layout/V3Footer";

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
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.473-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true" className={className}>
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

  const inputCls =
    "w-full h-12 px-4 rounded-xl bg-white border border-[var(--border-strong)] text-[14px] text-[var(--ink-950)] placeholder:text-[var(--ink-400)] focus:border-[var(--accent)] focus:outline-none transition-colors";

  return (
    <div className="v3-page min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased">
      <V3Navbar />
      <div className="pt-24 lg:pt-32 pb-16">
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Talk to a real
            <br />
            <span className="font-serif italic text-[#cbfb45] px-2 bg-[#0c0c0c] rounded-xl rotate-1 inline-block">TPP trader</span>.
          </>
        }
        description="The fastest way to reach us is Telegram or Discord — average reply under five minutes. For everything else, the form below routes directly to our team."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />

      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
            {/* Left: contact methods */}
            <aside className="space-y-5">
              <div className="rounded-2xl bg-[var(--ink-950)] text-white p-6 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute -bottom-12 -right-10 w-48 h-48 rounded-full"
                  style={{
                    background:
                      "radial-gradient(closest-side, rgba(216,242,107,0.18), transparent)",
                  }}
                />
                <div className="flex items-center gap-3 mb-3">
                  <Clock
                    className="w-4 h-4 text-[#D8F26B]"
                    strokeWidth={2.2}
                  />
                  <span className="text-[11px] tracking-eyebrow text-[#D8F26B]">
                    Avg. response time
                  </span>
                </div>
                <div className="font-medium text-[32px] tabular-nums tracking-tight">
                  &lt; 5 minutes
                </div>
                <p className="mt-2 text-[13.5px] text-white/65 leading-relaxed">
                  Live support 24/7 on Telegram & Discord. Email tickets
                  answered within four hours, seven days a week.
                </p>
              </div>

              {[
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
              ].map((c, i) => {
                const Icon = c.icon as React.ComponentType<{ className?: string }>;
                return (
                  <a
                    key={i}
                    href={c.href}
                    className="group flex items-start gap-4 surface-card p-5 hover:border-[var(--border-strong)] hover:shadow-[0_18px_36px_-22px_rgba(11,15,26,0.12)] transition-all"
                  >
                    <div className="grid place-items-center w-10 h-10 rounded-xl bg-[var(--accent-50)] text-[var(--accent-700)] border border-[rgba(14,124,92,0.18)] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] tracking-eyebrow text-[var(--ink-400)]">
                        {c.label}
                      </div>
                      <div className="text-[14px] text-[var(--ink-950)] mt-1 truncate font-medium">
                        {c.primary}
                      </div>
                      <div className="text-[12px] text-[var(--ink-500)] mt-0.5">
                        {c.detail}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--ink-300)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                  </a>
                );
              })}

              <div className="surface-quiet p-5">
                <p className="text-[13.5px] text-[var(--ink-700)] leading-relaxed">
                  Looking for self-serve answers? Most questions are already
                  covered in the rulebook.
                </p>
                <Link
                  href="/rules"
                  className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] text-[var(--accent-700)] hover:text-[var(--ink-950)] font-medium"
                >
                  Browse the FAQ <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </aside>

            {/* Right: form */}
            <div>
              <div className="surface-elevated p-7 md:p-9">
                <h2 className="font-medium text-[24px] md:text-[28px] tracking-tight text-[var(--ink-950)] mb-2">
                  Send us a message
                </h2>
                <p className="text-[14px] text-[var(--ink-500)] mb-8">
                  Fill out the form and a TPP team member will respond within
                  four hours.
                </p>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="name"
                        className="text-[11px] tracking-eyebrow text-[var(--ink-500)] mb-2 block"
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
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cemail"
                        className="text-[11px] tracking-eyebrow text-[var(--ink-500)] mb-2 block"
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
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="text-[11px] tracking-eyebrow text-[var(--ink-500)] mb-2 block"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) =>
                        setForm({ ...form, subject: e.target.value })
                      }
                      className={inputCls}
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
                      className="text-[11px] tracking-eyebrow text-[var(--ink-500)] mb-2 block"
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
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[var(--border-strong)] text-[14px] text-[var(--ink-950)] placeholder:text-[var(--ink-400)] focus:border-[var(--accent)] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <p className="text-[12px] text-[var(--ink-400)]">
                      By submitting, you accept our{" "}
                      <Link
                        href="#"
                        className="text-[var(--ink-950)] underline underline-offset-2"
                      >
                        privacy policy
                      </Link>
                      .
                    </p>
                    <Button type="submit" variant="primary" size="md">
                      <span
                        className={cn(
                          "inline-flex items-center gap-2 transition-opacity",
                          sent && "opacity-0",
                        )}
                      >
                        Send message
                        <Send className="w-4 h-4" />
                      </span>
                      {sent && (
                        <span className="absolute inline-flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Message sent
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
      <V3Footer />
    </div>
  );
}