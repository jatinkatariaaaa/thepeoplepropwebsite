import type { Metadata } from "next";
import { CertificateStudioClient } from "./CertificateStudioClient";

export const metadata: Metadata = {
  title: "Certificate Studio | The People Prop",
  description:
    "Generate and preview official The People Prop trader certificates — phase passes, funding, payouts and leaderboard awards.",
};

export default function CertificateStudioPage() {
  return (
    <main className="min-h-screen bg-[#f4f6f8] text-[#12151a]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <header className="mb-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-lg bg-[#12151a] px-3 py-1.5 text-sm font-extrabold tracking-tight text-[#c9f24b]">
              TPP
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#5a8a00]">
              The People Prop
            </p>
          </div>
          <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-balance">
            Certificate Studio
          </h1>
          <p className="mt-3 max-w-2xl text-[#7b8494] leading-relaxed">
            Six official certificate designs rendered in the TPP brand world —
            phase passes, funding, payouts, weekly awards and lifetime
            milestones. Each one is generated on demand from a single API, so it
            can be allotted to any trader through code.
          </p>
        </header>

        <CertificateStudioClient />
      </div>
    </main>
  );
}
