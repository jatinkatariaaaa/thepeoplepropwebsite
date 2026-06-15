import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "System Status",
  description:
    "Live operational status for The People Prop trading platform, payouts, and website.",
  path: "/status",
  // Utility page that changes constantly and has no search value — keep out of the index.
  noindex: true,
});

const systems = [
  { name: "Trading platform", status: "Operational" },
  { name: "Dashboard & accounts", status: "Operational" },
  { name: "Payout processing", status: "Operational" },
  { name: "Checkout & payments", status: "Operational" },
  { name: "Website", status: "Operational" },
];

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-24 mt-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          System Status
        </h1>
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-[#cbfb45]/30 bg-[#cbfb45]/10 px-4 py-1.5 text-sm font-medium text-[#cbfb45]">
          <span className="h-2 w-2 rounded-full bg-[#cbfb45]" aria-hidden />
          All systems operational
        </div>

        <div className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
          {systems.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between px-6 py-4"
            >
              <span className="font-medium">{s.name}</span>
              <span className="inline-flex items-center gap-2 text-sm text-[#cbfb45]">
                <span className="h-2 w-2 rounded-full bg-[#cbfb45]" aria-hidden />
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
