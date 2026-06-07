import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import { faq } from "@/data/faq";

export function FAQPreview() {
  const items = faq.slice(0, 6);
  return (
    <section className="relative py-24 md:py-32 border-y border-[var(--border)]">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Frequently Asked"
          title={
            <>
              The questions{" "}
              <span className="word-serif">traders</span> ask first.
            </>
          }
          description="Everything you need to know before buying. For the full list, see the FAQ page."
          align="center"
          className="mb-12"
        />

        <Accordion items={items} />

        <div className="mt-8 text-center">
          <Button href="/rules" variant="ghost">
            See all 12 questions
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}