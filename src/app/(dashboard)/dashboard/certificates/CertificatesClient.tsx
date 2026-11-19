"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, BadgeCheck, Check, CircleDollarSign, Copy, Download, Medal, Trophy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { certificateImagePath, certificateTitle, verifyUrl, type Certificate, type CertificateKind } from "@/lib/certificates/types";
import { Empty, Panel, Prop, btn } from "@/components/dashboard/glass";

const ICON: Record<CertificateKind, LucideIcon> = { phase_pass: BadgeCheck, funded: Award, payout: CircleDollarSign, highest_payout: Trophy, award: Medal };

/** The headline and the line under it in the list. */
function summary(c: Certificate) {
  switch (c.kind) {
    case "phase_pass":
      return { figure: c.accountSize ? `${c.accountSize} account` : "Evaluation", meta: c.program ?? "Phase passed" };
    case "funded":
      return { figure: c.accountSize ? `${c.accountSize} funded` : "Funded", meta: c.program ?? "Funded trader" };
    case "payout":
      return { figure: c.amount ?? "", meta: "Paid" };
    case "highest_payout":
      return { figure: c.amount ?? "", meta: c.period ?? "Highest payout" };
    case "award":
      return { figure: c.highlightValue ?? c.title ?? "Award", meta: c.highlightValue ? (c.highlightLabel ?? "") : "Award" };
  }
}

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

export function CertificatesClient({ certificates }: { certificates: Certificate[] }) {
  const [selectedId, setSelectedId] = useState(certificates[0]?.id ?? null);
  const [copied, setCopied] = useState(false);
  const selected = certificates.find((c) => c.id === selectedId);

  if (certificates.length === 0) {
    return (
      <Panel className="flex min-h-[300px] flex-col items-center justify-center">
        <Empty visual={<Prop src="/art/prop-rules.webp" width={733} height={810} className="mb-5 h-auto w-24 drop-shadow-[0_24px_22px_rgba(16,40,34,0.22)]" />} title="No certificates yet">
          Pass a phase, get funded or receive a payout, and your certificate appears here with its own verification link.
        </Empty>
      </Panel>
    );
  }

  const link = selected ? verifyUrl(selected.id) : "";
  const title = selected ? certificateTitle(selected) : "";

  const copyLink = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
      <div className="space-y-3 lg:col-span-1">
        <h3 className="mb-4 text-[12px] font-medium tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">Your certificates · {certificates.length}</h3>
        {certificates.map((c) => {
          const Icon = ICON[c.kind];
          const active = c.id === selectedId;
          const { figure, meta } = summary(c);
          const award = c.kind === "highest_payout" || c.kind === "award";
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "w-full cursor-pointer rounded-[18px] p-4 text-left ring-1 transition-all",
                active ? "bg-white shadow-[0_16px_32px_-20px_rgba(16,40,34,0.5)] ring-[var(--g-ink)]" : "bg-white/55 ring-black/[0.06] hover:bg-white/80",
              )}
            >
              <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--g-muted-ink)]">
                <span className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full", award ? "bg-[var(--g-ink)] text-[var(--g-lime)]" : "bg-[var(--g-emerald)]/10 text-[var(--g-emerald)]")}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="truncate">{certificateTitle(c)}</span>
              </div>
              <div className="g-num mt-2 truncate text-[17px] font-semibold text-[var(--g-ink)]">{figure}</div>
              <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[var(--g-muted-ink)]">
                <span className="truncate">{meta}</span>
                <span className="shrink-0">{c.issuedOn}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <Panel className="overflow-hidden p-3">
            <div className="relative aspect-[1.6] w-full overflow-hidden rounded-[20px] bg-[#0b0f0e]">
              <div className="absolute inset-0 flex items-center justify-center text-white/45">Loading certificate…</div>
              <Image key={selected.id} src={certificateImagePath(selected.id)} alt={`${title} for ${selected.traderName}`} fill className="relative z-10 object-contain" unoptimized />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] p-4 sm:p-6">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{title}</h3>
                <p className="text-sm text-[var(--g-muted-ink)]">
                  No. {selected.number} · issued {selected.issuedOn}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} from The People Prop`)}&url=${encodeURIComponent(link)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on X"
                  className={cn(btn.light, btn.sm, "w-10! px-0!")}
                >
                  <XIcon />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className={cn(btn.light, btn.sm, "w-10! px-0!")}>
                  <LinkedInIcon />
                </a>
                <button type="button" onClick={copyLink} className={cn(btn.light, btn.sm)}>
                  {copied ? <Check className="h-4 w-4 text-[var(--g-emerald)]" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Link copied" : "Copy verify link"}
                </button>
                <a href={certificateImagePath(selected.id)} download={`TPP_${title.replace(/[^A-Za-z0-9]+/g, "_")}_${selected.number}.png`} target="_blank" rel="noreferrer" className={cn(btn.ink, btn.sm)}>
                  <Download className="h-4 w-4" />
                  Download PNG
                </a>
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
