/* Temporary page to preview design concepts — safe to delete after selection */
export default function DesignConceptsPage() {
  return (
    <main className="min-h-screen bg-[#0c0c0c] px-6 py-12">
      <div className="mx-auto max-w-5xl flex flex-col gap-12">
        <h1 className="text-white text-2xl font-semibold">
          {"How it works — Design Concepts"}
        </h1>

        <section>
          <h2 className="text-[#bcff2e] text-lg font-semibold mb-4">Concept A</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/redesign-concepts/steps-concept-a-dark.png"
            alt="Concept A — Atlas-style how it works section, pills above timeline"
            className="w-full rounded-2xl border border-white/10"
          />
        </section>

        <section>
          <h2 className="text-[#bcff2e] text-lg font-semibold mb-4">Concept B</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/redesign-concepts/steps-concept-b-dark.png"
            alt="Concept B — Atlas-style how it works section, dotted timeline"
            className="w-full rounded-2xl border border-white/10"
          />
        </section>
      </div>
    </main>
  );
}
