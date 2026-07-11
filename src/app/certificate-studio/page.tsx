import type { Metadata } from "next";
import { CertificateStudioClient } from "./CertificateStudioClient";

export const metadata: Metadata = {
  title: "Certificate Studio | The People Prop",
  description:
    "Generate and preview official The People Prop trader certificates — phase passes, funding, payouts and leaderboard awards.",
};

export default function CertificateStudioPage() {
  return (
    <main className="min-h-screen bg-[#06080c] text-white">
      <div className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#c9f24b]">
            The People Prop
          </p>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-balance">
            Certificate Studio
          </h1>
          <p className="mt-3 max-w-2xl text-[#8a93a6] leading-relaxed">
            Six official certificate designs with AI-generated artwork — phase
            passes, funding, payouts, weekly awards and lifetime milestones. Each
            one is rendered on demand from a single API, so it can be allotted to
            any trader through code.
          </p>
        </header>

        <CertificateStudioClient />
      </div>
    </main>
  );
}
