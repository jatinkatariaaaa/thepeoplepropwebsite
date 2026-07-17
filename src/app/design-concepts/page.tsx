import Image from "next/image"

export const metadata = {
  title: "Testimonial Design Concepts",
  description: "Pick a testimonial section design concept",
}

const concepts = [
  {
    id: 1,
    title: "1. Spotlight Carousel",
    description:
      "Ek bada featured testimonial center mein, side cards halke blurred, neeche stats strip aur carousel controls.",
    image: "/design-concepts/testimonial-concept-1-spotlight.png",
  },
  {
    id: 2,
    title: "2. Bento Grid",
    description:
      "Alag-alag size ke cards ka asymmetric grid — bada hero card, chhote quote cards, stat tiles aur ek dark contrast card.",
    image: "/design-concepts/testimonial-concept-2-bento.png",
  },
  {
    id: 3,
    title: "3. Split Stage",
    description:
      "Left mein dark editorial quote panel with verified payout badge, right mein scrollable trader list.",
    image: "/design-concepts/testimonial-concept-3-split.png",
  },
  {
    id: 4,
    title: "4. Payout Wall",
    description:
      "Masonry wall — X-style review posts aur payout receipt cards mixed, upar filter tabs.",
    image: "/design-concepts/testimonial-concept-4-wall.png",
  },
]

export default function DesignConceptsPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-balance text-3xl font-bold text-foreground md:text-4xl">
          Testimonial Design Concepts
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Neeche 4 design concepts hain. Jo pasand aaye uska number bata dein.
        </p>

        <div className="mt-10 flex flex-col gap-12">
          {concepts.map((concept) => (
            <section key={concept.id} aria-label={concept.title}>
              <h2 className="text-xl font-semibold text-foreground">{concept.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {concept.description}
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-border">
                <Image
                  src={concept.image || "/placeholder.svg"}
                  alt={`Design mockup: ${concept.title}`}
                  width={1440}
                  height={900}
                  className="h-auto w-full"
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
