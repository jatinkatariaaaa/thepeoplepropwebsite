"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, Copy, Mail, MessageCircle, Send } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Container, Section } from "../ui";
import { Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

const SUPPORT = "support@thepeopleprop.com";
const SUBJECTS = ["General inquiry", "Challenge support", "Funded account / payouts", "Partnerships & affiliates", "Press & media", "Other"];

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.473-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.69 13.69 0 0 0-.608 1.249 18.27 18.27 0 0 0-5.487 0c-.165-.39-.4-.84-.617-1.25a.077.077 0 0 0-.079-.036 19.74 19.74 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.027 14.2 14.2 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

/** A channel card. Handles without a confirmed URL are copyable instead of linked. */
function Channel({ icon, label, primary, detail, link }: { icon: ReactNode; label: string; primary: string; detail: string; link?: string }) {
  const { copied, copy } = useCopyToClipboard();
  const inner = (
    <>
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-white/[0.07] text-[var(--g-lime)] ring-1 ring-white/10">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12.5px] text-white/45">{label}</span>
        <span className="block truncate text-[16px] font-semibold text-white">{primary}</span>
        <span className="block text-[12.5px] text-white/45">{detail}</span>
      </span>
    </>
  );
  if (link)
    return (
      <a href={link} className="g-glass g-hair group flex items-center gap-4 rounded-[24px] p-4 transition-colors hover:bg-white/[0.06]">
        {inner}
        <ArrowRight className="h-4 w-4 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
      </a>
    );
  return (
    <div className="g-glass g-hair flex items-center gap-4 rounded-[24px] p-4">
      {inner}
      <button type="button" onClick={() => copy(primary)} aria-label={`Copy ${label} handle`} className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] text-white/70 transition-colors hover:text-white">
        {copied ? <Check className="h-4 w-4 text-[var(--g-lime)]" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

const field =
  "w-full rounded-[16px] bg-white/[0.05] px-4 py-3.5 text-[15px] text-white ring-1 ring-white/10 outline-none transition-shadow placeholder:text-white/30 focus:ring-2 focus:ring-[var(--g-lime)]/70";

/** There is no public contact API, so the form hands a ready-written email to the visitor's mail app. */
function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: SUBJECTS[0], message: "" });
  const [opened, setOpened] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const body = `${form.message}\n\n— ${form.name} (${form.email})`;
    window.location.href = `mailto:${SUPPORT}?subject=${encodeURIComponent(`[${form.subject}] ${form.name}`)}&body=${encodeURIComponent(body)}`;
    setOpened(true);
  };
  return (
    <div className="g-glass-ink g-hair rounded-[32px] p-6 sm:p-9">
      <h2 className="text-[26px] font-semibold tracking-[-0.03em] text-white">Send us a message</h2>
      <p className="mt-2 text-[14.5px] text-white/55">Fill out the form and your email app opens with the message ready to send to our team.</p>
      <form onSubmit={submit} className="mt-8 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-[13px] font-medium text-white/70">
            Full name
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className={field} />
          </label>
          <label className="grid gap-2 text-[13px] font-medium text-white/70">
            Email address
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@domain.com" className={field} />
          </label>
        </div>
        <label className="grid gap-2 text-[13px] font-medium text-white/70">
          Subject
          <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={`${field} appearance-none`}>
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-[#161a19]">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-[13px] font-medium text-white/70">
          Message
          <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us what we can help with..." className={`${field} resize-y`} />
        </label>
        <div className="mt-2 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-white/45">
            By sending, you accept our{" "}
            <Link href={href("privacy")} className="underline decoration-white/25 underline-offset-4 hover:text-white">
              privacy policy
            </Link>
            .
          </p>
          <button type="submit" className="g-btn g-btn-lime group">
            {opened ? "Opened in your email app" : "Send message"}
            {opened ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ContactPage() {
  return (
    <>
      <PageHero
        art="/v2/pt/page-contact.webp"
        crumb="Contact"
        eyebrow="Contact"
        icon={MessageCircle}
        lead="Talk to a real"
        fade="TPP trader."
        lede="The fastest way to reach us is Telegram or Discord — average reply under five minutes. For everything else, the form below routes directly to our team."
      />
      <Section shell={false} className="pt-10 pb-40 sm:pb-48">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-8">
            <Reveal>
              <div className="flex flex-col gap-3">
                <div className="g-card-emerald g-hair relative overflow-hidden rounded-[28px] p-7">
                  <div aria-hidden="true" className="absolute -top-20 -right-16 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.22),transparent)]" />
                  <p className="relative flex items-center gap-2 text-[13px] font-medium text-white/70">
                    <Clock className="h-4 w-4 text-[var(--g-lime)]" /> Avg. response time
                  </p>
                  <p className="g-num g-shade-dark relative mt-3 text-[56px] leading-none font-semibold tracking-[-0.05em]">&lt; 5 min</p>
                  <p className="relative mt-4 text-[14.5px] leading-relaxed text-white/70">
                    Live support 24/7 on Telegram &amp; Discord. Email tickets answered within four hours, seven days a week.
                  </p>
                </div>
                <Channel icon={<Mail className="h-[18px] w-[18px]" />} label="Email" primary={SUPPORT} detail="All inquiries · 4h SLA" link={`mailto:${SUPPORT}`} />
                <Channel icon={<TelegramIcon />} label="Telegram" primary="@thepeopleprop" detail="Instant replies · 24/7" />
                <Channel icon={<DiscordIcon />} label="Discord" primary="discord.gg/peopleprop" detail="Community · 12k members" />
                <div className="rounded-[24px] bg-white/[0.03] p-5">
                  <p className="text-[14px] leading-relaxed text-white/60">Looking for self-serve answers? Most questions are already covered in the rulebook and FAQ.</p>
                  <Link href={href("faqs")} className="group mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--g-lime)]">
                    Browse the FAQ <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <ContactForm />
            </Reveal>
          </div>
        </Container>
      </Section>
      <Cta />
    </>
  );
}
