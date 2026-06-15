import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About The People Prop",
  description:
    "The People Prop is a trader-first proprietary trading firm funding skilled traders with up to $200,000 in capital. Learn our mission, how we operate, and why traders trust TPP.",
  path: "/about",
  keywords: [
    "about The People Prop",
    "prop firm company",
    "funded trading firm",
    "trader first prop firm",
  ],
});

const stats = [
  { value: "$200K", label: "Max funded capital" },
  { value: "90%", label: "Profit split" },
  { value: "142+", label: "Countries served" },
  { value: "<24h", label: "Payout processing" },
];

const values = [
  {
    title: "Trader-first, always",
    body: "Every rule we write is designed to help disciplined traders succeed — not to trip them up. One fair evaluation, no hidden phases, no moving goalposts.",
  },
  {
    title: "Radical transparency",
    body: "Our rules, pricing, and payout policies are published in full. What you read is exactly what you get when you trade with our capital.",
  },
  {
    title: "Real capital scaling",
    body: "Consistent, profitable traders scale up to 4x their starting balance. We grow when our traders grow.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 mt-20">
        <p className="text-[#cbfb45] font-semibold uppercase tracking-widest text-sm mb-4">
          About Us
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
          Built by traders, for traders
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed mb-12 text-pretty">
          The People Prop (TPP) is a next-generation proprietary trading firm on
          a mission to fund the world&apos;s most disciplined retail traders. We
          give skilled traders access to up to $200,000 in evaluation capital,
          a single fair evaluation, and up to a 90% profit split — so talent,
          not bankroll, decides who gets funded.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="text-2xl md:text-3xl font-bold text-[#cbfb45]">
                {s.value}
              </div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">Our mission</h2>
        <p className="text-gray-400 leading-relaxed mb-10">
          Most aspiring traders never get a fair shot — they have the skill but
          not the capital, and legacy prop firms bury them in punitive rules and
          two- or three-phase challenges designed to fail. We built TPP to flip
          that model. Prove your edge once, get funded fast, and keep the
          majority of what you earn, with bi-weekly payouts processed in under
          24 hours.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mb-6">What we stand for</h2>
        <div className="grid gap-4 md:grid-cols-3 mb-12">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">How TPP works</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          Traders purchase a one-time evaluation, hit a 10% profit target while
          respecting a 4% daily and 8% maximum drawdown, and trade for a minimum
          of three days with no time limit. Pass, and you receive a funded
          account — up to $200,000 — typically within 24 hours.
        </p>
        <p className="text-gray-400 leading-relaxed">
          <strong className="text-white">Important:</strong> all accounts
          provided by The People Prop are simulated trading environments. We are
          not a broker and do not accept deposits. Trading involves a high
          degree of risk — please read our{" "}
          <a href="/risk-disclosure" className="text-[#cbfb45] underline">
            Risk Disclosure
          </a>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}
