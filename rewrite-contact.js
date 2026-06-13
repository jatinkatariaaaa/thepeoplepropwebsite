const fs = require('fs');

const contactContent = `"use client";

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
  const [form, setForm] = useState({ name: "", email: "", subject: subjects[0], message: "" });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", email: "", subject: subjects[0], message: "" });
  }

  const inputCls = "w-full h-12 px-4 rounded-xl bg-white border border-[#0c0c0c]/10 text-[14px] text-[#0c0c0c] placeholder:text-[#0c0c0c]/40 focus:border-[#0c0c0c]/30 focus:outline-none transition-colors";

  return (
    <div className="v3-page min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased">
      <V3Navbar />
      
      {/* 1. Hero wrapped in Black card */}
      <section className="pt-24 lg:pt-32 px-[5px] pb-[5px]">
        <div className="rounded-2xl bg-[#0c0c0c] text-white py-16 md:py-24 px-6 md:px-10 relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 mb-8 text-[13px] font-medium text-white/80">Contact</span>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white mb-6">
              Talk to a real<br/>
              <span className="font-serif italic text-[#0c0c0c] px-2 bg-[#cbfb45] rounded-xl rotate-1 inline-block">TPP trader</span>.
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-white/60">
              The fastest way to reach us is Telegram or Discord — average reply under five minutes. For everything else, the form below routes directly to our team.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Contact form in Creme card */}
      <section className="px-[5px] pb-[5px]">
        <div className="rounded-2xl bg-[#f1eade] border border-[#0c0c0c]/10 py-16 md:py-24 px-6 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16">
              {/* Left: contact methods */}
              <aside className="space-y-5">
                <div className="rounded-2xl bg-[#0c0c0c] text-white p-6 relative overflow-hidden">
                  <div aria-hidden="true" className="absolute -bottom-12 -right-10 w-48 h-48 rounded-full" style={{ background: "radial-gradient(closest-side, rgba(203,251,69,0.18), transparent)" }} />
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-4 h-4 text-[#cbfb45]" strokeWidth={2.2} />
                    <span className="text-[11px] uppercase tracking-widest font-bold text-[#cbfb45]">Avg. response time</span>
                  </div>
                  <div className="font-medium text-[32px] tabular-nums tracking-tight">&lt; 5 minutes</div>
                  <p className="text-[13px] text-white/60 mt-1">on Discord & Telegram</p>
                </div>

                <div className="space-y-3">
                  <a href="#" className="flex items-center justify-between p-4 rounded-2xl border border-[#0c0c0c]/10 bg-white/50 hover:bg-white transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc]">
                        <TelegramIcon />
                      </div>
                      <div className="text-[14px] font-medium text-[#0c0c0c]">Telegram Support</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0c0c0c]/40 group-hover:text-[#0c0c0c] transition-colors" />
                  </a>

                  <a href="#" className="flex items-center justify-between p-4 rounded-2xl border border-[#0c0c0c]/10 bg-white/50 hover:bg-white transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2]">
                        <DiscordIcon />
                      </div>
                      <div className="text-[14px] font-medium text-[#0c0c0c]">Discord Community</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0c0c0c]/40 group-hover:text-[#0c0c0c] transition-colors" />
                  </a>

                  <a href="mailto:support@thepeopleprop.com" className="flex items-center justify-between p-4 rounded-2xl border border-[#0c0c0c]/10 bg-white/50 hover:bg-white transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0c0c0c]/5 flex items-center justify-center text-[#0c0c0c]">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="text-[14px] font-medium text-[#0c0c0c]">support@thepeopleprop.com</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0c0c0c]/40 group-hover:text-[#0c0c0c] transition-colors" />
                  </a>
                </div>
              </aside>

              {/* Right: form */}
              <div className="rounded-2xl border border-[#0c0c0c]/10 bg-white/50 p-6 md:p-8 lg:p-10">
                <h2 className="text-[20px] font-bold tracking-tight text-[#0c0c0c] mb-6">Send us a message</h2>
                {sent ? (
                  <div className="rounded-xl bg-[#cbfb45]/10 border border-[#cbfb45]/30 p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#cbfb45] text-[#0c0c0c] flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6" strokeWidth={3} />
                    </div>
                    <h3 className="text-[17px] font-bold text-[#0c0c0c] mb-2">Message sent</h3>
                    <p className="text-[14px] text-[#0c0c0c]/60">We'll get back to you at {form.email} as soon as possible.</p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-[#0c0c0c]/80 ml-1">Your name</label>
                        <input required type="text" placeholder="Jane Doe" className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-medium text-[#0c0c0c]/80 ml-1">Email address</label>
                        <input required type="email" placeholder="jane@example.com" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#0c0c0c]/80 ml-1">Topic</label>
                      <select className={cn(inputCls, "appearance-none bg-no-repeat")} style={{ backgroundImage: \`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9' /%3E%3C/svg%3E")\`, backgroundPosition: "right 16px center", backgroundSize: "16px" }} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                        {subjects.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[12px] font-medium text-[#0c0c0c]/80 ml-1">Message</label>
                      <textarea required placeholder="How can we help?" rows={5} className={cn(inputCls, "h-auto py-3 resize-none")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                    </div>

                    <div className="pt-2">
                      <Button type="submit" className="w-full h-12 bg-[#cbfb45] hover:bg-[#b5e530] text-[#0c0c0c] font-bold rounded-xl flex items-center justify-center gap-2">
                        Send message <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <V3Footer />
    </div>
  );
}
`;

fs.writeFileSync('src/app/contact/page.tsx', contactContent, 'utf8');
console.log('Contact page rewritten');
