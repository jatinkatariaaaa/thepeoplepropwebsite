"use client";

import type { ReactNode } from "react";
import { ArrowRight, Check, Copy, Mail } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export const SUPPORT = "support@thepeopleprop.com";

export function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.473-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.69 13.69 0 0 0-.608 1.249 18.27 18.27 0 0 0-5.487 0c-.165-.39-.4-.84-.617-1.25a.077.077 0 0 0-.079-.036 19.74 19.74 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.027 14.2 14.2 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.075.075 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

/** A channel card. Handles without a confirmed URL are copyable instead of linked. */
export function Channel({ icon, label, primary, detail, link }: { icon: ReactNode; label: string; primary: string; detail: string; link?: string }) {
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

/** The three ways to reach the team, as the contact page lists them. */
export function SupportChannels() {
  return (
    <>
      <Channel icon={<Mail className="h-[18px] w-[18px]" />} label="Email" primary={SUPPORT} detail="All inquiries · 4h SLA" link={`mailto:${SUPPORT}`} />
      <Channel icon={<TelegramIcon />} label="Telegram" primary="@thepeopleprop" detail="Instant replies · 24/7" />
      <Channel icon={<DiscordIcon />} label="Discord" primary="discord.gg/peopleprop" detail="Community · 12k members" />
    </>
  );
}
