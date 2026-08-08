import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container, Eyebrow, GhostButton } from "./primitives";
import { Reveal } from "@/components/v2/motion";

export function Cta() {
  return (
    <section
      id="cta"
      className="v2-grain relative isolate overflow-hidden pt-28 pb-28 sm:pt-32 sm:pb-32"
    >
      {/* Light shaft rising from the footer edge */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/images/v2r/beam-horizon.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-bottom opacity-70"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,transparent_35%,transparent_70%,color-mix(in_oklab,var(--background)_55%,transparent)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_60%,transparent,var(--background))]" />
        <div className="v2-stars opacity-60" />
      </div>

      <Container>
        <Reveal>
          <div className="flex flex-col items-center gap-6 text-center">
            <Eyebrow>Your move</Eyebrow>
            <h2 className="v2-fadetext font-heading max-w-3xl text-4xl leading-[1.02] text-balance sm:text-5xl lg:text-6xl">
              The capital is already waiting. All that is missing is your first
              trade.
            </h2>
            <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground text-pretty">
              Set up an account in under three minutes. If you pass, your fee
              comes back at 150% and every dollar after that is yours.
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#pricing"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_16px_50px_-10px_color-mix(in_oklab,var(--primary)_85%,transparent)] transition-transform duration-300 hover:-translate-y-0.5"
              >
                Start your challenge
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <GhostButton href="#faq" className="px-7 py-3.5">
                Read the rules first
              </GhostButton>
            </div>
            <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
              No subscription — one-time fee
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
