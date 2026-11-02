"use client";

import { useState } from "react";
import { Award, Check, CircleDollarSign, Download, Share2, Trophy, type LucideIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { certificateImagePath, certificateTitle, type Certificate, type CertificateKind } from "@/lib/certificates/types";
import { Empty, Panel, Prop, btn } from "@/components/dashboard/glass";

const ICON: Record<CertificateKind, LucideIcon> = { funded: Award, payout: CircleDollarSign, highest: Trophy };

const keyOf = (c: Certificate) => `${c.kind}:${c.id}`;

/** The headline figure and the line under it in the list. */
function summary(c: Certificate) {
  if (c.kind === "funded") return { figure: `${c.accountSize} Account`, meta: c.status === "funded" ? "Funded" : "Passed" };
  if (c.kind === "highest") return { figure: c.amount ?? "", meta: c.period ?? "" };
  return { figure: c.amount ?? "", meta: "Paid" };
}

export function CertificatesClient({ certificates }: { certificates: Certificate[] }) {
  const [selectedKey, setSelectedKey] = useState(certificates[0] ? keyOf(certificates[0]) : null);
  const [copied, setCopied] = useState(false);

  const selected = certificates.find((c) => keyOf(c) === selectedKey);

  const handleCopyLink = () => {
    if (!selected) return;
    navigator.clipboard.writeText(`${window.location.origin}/verify/${selected.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (certificates.length === 0) {
    return (
      <Panel className="flex min-h-[300px] flex-col items-center justify-center">
        <Empty
          visual={<Prop src="/art/prop-rules.webp" width={733} height={810} className="mb-5 h-auto w-24 drop-shadow-[0_24px_22px_rgba(16,40,34,0.22)]" />}
          title="No Certificates Yet"
        >
          Pass your evaluation or receive a payout to unlock your first certificate. Keep trading!
        </Empty>
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
      {/* Sidebar List */}
      <div className="space-y-3 lg:col-span-1">
        <h3 className="mb-4 text-[12px] font-medium tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">Your Achievements</h3>
        {certificates.map((c) => {
          const Icon = ICON[c.kind];
          const active = keyOf(c) === selectedKey;
          const { figure, meta } = summary(c);
          return (
            <button
              key={keyOf(c)}
              onClick={() => setSelectedKey(keyOf(c))}
              className={cn(
                "w-full cursor-pointer rounded-[18px] p-4 text-left ring-1 transition-all",
                active
                  ? "bg-white ring-[var(--g-ink)] shadow-[0_16px_32px_-20px_rgba(16,40,34,0.5)]"
                  : "bg-white/55 ring-black/[0.06] hover:bg-white/80"
              )}
            >
              <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--g-muted-ink)]">
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                    c.kind === "highest" ? "bg-[var(--g-ink)] text-[var(--g-lime)]" : "bg-[var(--g-emerald)]/10 text-[var(--g-emerald)]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {certificateTitle[c.kind]}
              </div>
              <div className="g-num mt-2 text-[17px] font-semibold text-[var(--g-ink)]">{figure}</div>
              <div className="mt-1 flex items-center justify-between gap-3 text-xs text-[var(--g-muted-ink)]">
                <span>{meta}</span>
                <span>{c.issuedOn}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main View */}
      <div className="lg:col-span-3">
        {selected && (
          <Panel className="overflow-hidden p-3">
            <div className="relative aspect-[1.6] w-full overflow-hidden rounded-[20px] bg-[#0b0f0e]">
              {/* Fallback loading state while image loads */}
              <div className="absolute inset-0 flex items-center justify-center text-white/45">
                Loading certificate...
              </div>
              <Image
                key={keyOf(selected)}
                src={certificateImagePath(selected.kind, selected.id)}
                alt={`${certificateTitle[selected.kind]} for ${selected.traderName}`}
                fill
                className="relative z-10 object-contain"
                unoptimized
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] p-4 sm:p-6">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{certificateTitle[selected.kind]}</h3>
                <p className="text-sm text-[var(--g-muted-ink)]">No. {selected.number}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={handleCopyLink} className={cn(btn.light, btn.sm)}>
                  {copied ? <Check className="h-4 w-4 text-[var(--g-emerald)]" /> : <Share2 className="h-4 w-4" />}
                  {copied ? "Link copied" : "Share Link"}
                </button>
                <a
                  href={certificateImagePath(selected.kind, selected.id)}
                  download={`TPP_${certificateTitle[selected.kind].replace(/ /g, "_")}_${selected.number}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(btn.ink, btn.sm)}
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </a>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
