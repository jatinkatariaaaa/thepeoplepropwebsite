import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Press & Media",
  description:
    "Press resources for The People Prop. Download our brand assets, read company facts, and contact our media team for interviews, partnerships, and coverage.",
  path: "/press",
  keywords: ["The People Prop press", "prop firm media kit", "TPP newsroom"],
});

const facts = [
  { label: "Founded", value: "2025" },
  { label: "Headquarters", value: "Remote-first, global" },
  { label: "Max funding", value: "$200,000 per trader" },
  { label: "Markets served", value: "142+ countries" },
];

export default function PressPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Press", path: "/press" },
        ])}
      />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 mt-20">
        <p className="text-[#cbfb45] font-semibold uppercase tracking-widest text-sm mb-4">
          Press & Media
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
          Newsroom
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed mb-12 text-pretty">
          Resources for journalists, creators, and partners covering The People
          Prop. For interviews, data requests, or partnership enquiries, reach
          our media team at{" "}
          <a
            href="mailto:press@thepeopleprop.live"
            className="text-[#cbfb45] underline"
          >
            press@thepeopleprop.live
          </a>
          .
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mb-6">Company facts</h2>
        <div className="grid grid-cols-2 gap-4 mb-12">
          {facts.map((f) => (
            <div
              key={f.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="text-sm text-gray-500">{f.label}</div>
              <div className="text-lg font-semibold mt-1">{f.value}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">Brand assets</h2>
        <p className="text-gray-400 leading-relaxed">
          Logos, colour values, and usage guidelines are available on request.
          Please email{" "}
          <a
            href="mailto:press@thepeopleprop.live"
            className="text-[#cbfb45] underline"
          >
            press@thepeopleprop.live
          </a>{" "}
          and our team will share the latest media kit.
        </p>
      </main>
      <Footer />
    </div>
  );
}
