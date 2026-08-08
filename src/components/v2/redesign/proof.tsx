import { Star } from "lucide-react";
import { Container, Eyebrow, SectionHeading } from "./primitives";
import { Reveal, Stagger, StaggerItem } from "@/components/v2/motion";

const QUOTES = [
  {
    quote:
      "I cleared the $200K evaluation in nine days and had the money in my account before the week was out. No interview, no spreadsheet of excuses.",
    name: "Daniel Okonkwo",
    role: "Funded $200,000 — Gold",
  },
  {
    quote:
      "The static drawdown is the whole reason I moved. My breach level does not creep up every time I have a good session.",
    name: "Priya Raghunathan",
    role: "Funded $100,000 — Indices",
  },
  {
    quote:
      "Third firm I have traded with and the first where support answered on a Sunday. That tells you who they actually built this for.",
    name: "Marek Zielinski",
    role: "Funded $50,000 — FX majors",
  },
];

const NUMBERS = [
  { value: "$4.2M", label: "Paid out to date" },
  { value: "31,400", label: "Funded traders" },
  { value: "128", label: "Countries served" },
  { value: "12h", label: "Median payout" },
];

export function Proof() {
  return (
    <section
      id="proof"
      className="v2-grain relative isolate overflow-hidden py-24 sm:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="v2-fog v2-drift top-[-100px] left-1/2 h-[380px] w-[760px] -translate-x-1/2 opacity-[0.14]" />
      </div>

      <Container>
        <Reveal>
          <div className="flex flex-col gap-5">
            <Eyebrow>Receipts</Eyebrow>
            <SectionHeading className="max-w-2xl">
              Thirty-one thousand traders. Not one delayed payout.
            </SectionHeading>
          </div>
        </Reveal>

        {/* Numbers as a lit band */}
        <Reveal delay={0.08}>
          <dl className="mt-14 grid grid-cols-2 gap-y-10 border-y border-border py-10 lg:grid-cols-4">
            {NUMBERS.map((n) => (
              <div key={n.label} className="flex flex-col gap-2 px-2">
                <dt className="font-heading text-3xl text-foreground sm:text-4xl">
                  {n.value}
                </dt>
                <dd className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                  {n.label}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 lg:grid-cols-3" staggerDelay={0.12}>
          {QUOTES.map((q) => (
            <StaggerItem key={q.name}>
              <figure className="v2-glass v2-litedge relative flex h-full flex-col gap-6 overflow-hidden rounded-[24px] p-7">
                <div
                  aria-hidden="true"
                  className="v2-fog bottom-[-170px] left-1/2 h-[250px] w-[85%] -translate-x-1/2 opacity-45"
                />
                <div
                  className="relative flex gap-0.5"
                  aria-label="Rated 5 out of 5"
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star
                      key={i}
                      aria-hidden="true"
                      className="h-3.5 w-3.5 fill-highlight text-highlight"
                    />
                  ))}
                </div>
                <blockquote className="relative text-[14px] leading-relaxed text-foreground/85 text-pretty">
                  {q.quote}
                </blockquote>
                <figcaption className="relative mt-auto flex flex-col gap-1 border-t border-border pt-5">
                  <span className="text-[13.5px] text-foreground">{q.name}</span>
                  <span className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                    {q.role}
                  </span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
