/* Temporary page to preview Why TPP redesign concepts. Delete after a design is finalized. */

const concepts = [
  {
    src: "/mockups/why-tpp-concept-7.png",
    title: "Concept D — VS Comparison + Stats",
    desc: "Header + 'Other Prop Firms vs The People's Prop' comparison cards with VS badge + 4 stat cards strip niche (0.0 / 90% / $200K / 24h).",
  },
  {
    src: "/mockups/why-tpp-concept-8.png",
    title: "Concept E — Rich Bento Grid",
    desc: "Asymmetric bento grid — icons, pill badges, mini charts, aur ek CTA card. Content-dense feature showcase.",
  },
  {
    src: "/mockups/why-tpp-concept-4.png",
    title: "Concept A — Simple VS Comparison",
    desc: "Black card (other firms, X marks) vs lime card (TPP, checkmarks) with round VS badge.",
  },
  {
    src: "/mockups/why-tpp-concept-5.png",
    title: "Concept B — Numbered Rows",
    desc: "Editorial style — 01 se 04 full-width pill rows alternating black/cream/lime with arrow buttons.",
  },
  {
    src: "/mockups/why-tpp-concept-6.png",
    title: "Concept C — Stat Billboard",
    desc: "Ek bada black billboard card with giant lime stats aur CTA buttons.",
  },
]

export default function MockupsPage() {
  return (
    <main className="min-h-screen bg-[#f0ece3] px-4 py-12 md:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
            Design Concepts
          </p>
          <h1 className="text-balance text-4xl font-bold text-neutral-900">
            {"Why TPP — Redesign Options"}
          </h1>
          <p className="text-neutral-600">
            Neeche saare concepts hain. Jo pasand aaye uska naam batao.
          </p>
        </header>

        {concepts.map((c) => (
          <section key={c.src} className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-neutral-900">{c.title}</h2>
            <p className="text-sm leading-relaxed text-neutral-600">{c.desc}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.src || "/placeholder.svg"}
              alt={c.title}
              className="w-full rounded-2xl border border-neutral-300 shadow-sm"
            />
          </section>
        ))}
      </div>
    </main>
  )
}
