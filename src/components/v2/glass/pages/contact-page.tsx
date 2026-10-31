"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Clock, MessageCircle, Send } from "lucide-react";
import { Container, Section } from "../ui";
import { Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";
import { SUPPORT, SupportChannels } from "./channels";

const SUBJECTS = ["General inquiry", "Challenge support", "Funded account / payouts", "Partnerships & affiliates", "Press & media", "Other"];

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
        art="/art/page-contact.webp"
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
                <SupportChannels />
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
