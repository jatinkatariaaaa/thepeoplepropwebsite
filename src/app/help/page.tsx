import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Help Center",
  description:
    "Get help with The People Prop evaluations, funded accounts, payouts, and platforms. Browse support topics or contact our team for assistance.",
  path: "/help",
  keywords: ["The People Prop support", "prop firm help center", "TPP help"],
});

const topics = [
  {
    title: "Evaluations & rules",
    body: "Profit targets, drawdown limits, minimum trading days, and prohibited strategies.",
    href: "/rules",
  },
  {
    title: "Challenges & pricing",
    body: "Account sizes, fees, profit splits, and which program is right for you.",
    href: "/challenges",
  },
  {
    title: "Payouts",
    body: "Payout schedule, processing times, KYC requirements, and accepted methods.",
    href: "/faqs",
  },
  {
    title: "Frequently asked questions",
    body: "Quick answers to the most common questions about trading with TPP.",
    href: "/faqs",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Help Center", path: "/help" },
        ])}
      />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 mt-20">
        <p className="text-[#cbfb45] font-semibold uppercase tracking-widest text-sm mb-4">
          Help Center
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
          How can we help?
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed mb-12 text-pretty">
          Find answers about evaluations, funded accounts, payouts, and our
          trading platforms. Still stuck? Our support team is available around
          the clock.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 mb-12">
          {topics.map((t) => (
            <Link
              key={t.title}
              href={t.href}
              className="block rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-[#cbfb45]/40"
            >
              <h2 className="font-semibold text-lg mb-2">{t.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed">{t.body}</p>
            </Link>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Still need help?
        </h2>
        <p className="text-gray-400 leading-relaxed">
          Email{" "}
          <a
            href="mailto:support@thepeopleprop.live"
            className="text-[#cbfb45] underline"
          >
            support@thepeopleprop.live
          </a>{" "}
          or visit our{" "}
          <Link href="/contact" className="text-[#cbfb45] underline">
            contact page
          </Link>{" "}
          and we&apos;ll get back to you fast.
        </p>
      </main>
      <Footer />
    </div>
  );
}
