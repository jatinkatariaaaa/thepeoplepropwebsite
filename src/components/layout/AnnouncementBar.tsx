import { Sparkles } from "lucide-react";

/* Slim marquee strip — runs above the navbar on every public page. */
export function AnnouncementBar() {
  const items = [
    "Guaranteed free evaluation Prizes on 1 August 2026",
    "Use code FOUNDERS25 — 25% off launch pricing",
    "Up to $200,000 funded · 90% profit split",
    "Bi-weekly payouts · sub-24h processing",
    "Top 10 referrers get a $25K funded account",
  ];
  // Duplicate for seamless marquee
  const loop = [...items, ...items];

  return (
    <div
      className="relative bg-[var(--ink-950)] text-white border-b border-[var(--ink-900)] overflow-hidden"
      aria-label="Announcements"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-40 z-10"
        style={{
          background:
            "linear-gradient(90deg, var(--ink-950), rgba(15,23,42,0))",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-40 z-10"
        style={{
          background:
            "linear-gradient(-90deg, var(--ink-950), rgba(15,23,42,0))",
        }}
      />

      <div className="flex animate-marquee whitespace-nowrap py-2.5">
        {loop.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 px-6 text-[11.5px] tracking-[0.04em] text-white/75"
          >
            <Sparkles
              className="w-3 h-3 text-[var(--accent-400)]"
              strokeWidth={2.2}
              aria-hidden="true"
            />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}