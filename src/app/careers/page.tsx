import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Careers",
  description:
    "Join The People Prop. We are building the most trader-first proprietary trading firm in the world and are hiring across engineering, trading operations, risk, and support.",
  path: "/careers",
  keywords: ["The People Prop careers", "prop firm jobs", "trading firm careers"],
});

const roles = [
  {
    team: "Engineering",
    title: "Senior Full-Stack Engineer",
    location: "Remote",
    type: "Full-time",
  },
  {
    team: "Trading Operations",
    title: "Risk & Trade Surveillance Analyst",
    location: "Remote",
    type: "Full-time",
  },
  {
    team: "Customer Success",
    title: "Trader Support Specialist",
    location: "Remote",
    type: "Full-time",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/careers" },
        ])}
      />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-24 mt-20">
        <p className="text-[#cbfb45] font-semibold uppercase tracking-widest text-sm mb-4">
          Careers
        </p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
          Help us fund the next generation of traders
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed mb-12 text-pretty">
          The People Prop is a fully remote, globally distributed team building
          the most transparent proprietary trading firm in the industry. If you
          care about traders and ship great work, we want to hear from you.
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mb-6">Open roles</h2>
        <div className="grid gap-4 mb-12">
          {roles.map((r) => (
            <div
              key={r.title}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-xs uppercase tracking-widest text-[#cbfb45] mb-1">
                  {r.team}
                </div>
                <div className="text-lg font-semibold">{r.title}</div>
                <div className="text-sm text-gray-500">
                  {r.location} · {r.type}
                </div>
              </div>
              <a
                href="mailto:careers@thepeopleprop.live?subject=Application"
                className="inline-flex w-fit items-center rounded-full bg-[#cbfb45] px-5 py-2 text-sm font-semibold text-[#0c0c0c]"
              >
                Apply
              </a>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Don&apos;t see your role?
        </h2>
        <p className="text-gray-400 leading-relaxed">
          We are always looking for exceptional people. Send your resume and a
          short note to{" "}
          <a
            href="mailto:careers@thepeopleprop.live"
            className="text-[#cbfb45] underline"
          >
            careers@thepeopleprop.live
          </a>
          .
        </p>
      </main>
      <Footer />
    </div>
  );
}
