"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, FileText, Lock, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container } from "../ui";
import { Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";
import { LEGAL, type LegalBlock, type LegalKey } from "./legal-content";

const META: Record<LegalKey, { crumb: string; eyebrow: string; icon: LucideIcon; lead: string; fade: string; lede: string }> = {
  terms: { crumb: "Terms", eyebrow: "Legal", icon: FileText, lead: "Terms of", fade: "service.", lede: "The agreement that governs your use of The People Prop's website, evaluations and services." },
  privacy: { crumb: "Privacy", eyebrow: "Legal", icon: Lock, lead: "Privacy", fade: "policy.", lede: "What we collect, why we collect it, and how your personal information is protected." },
  cookie: { crumb: "Cookies", eyebrow: "Legal", icon: Cookie, lead: "Cookie", fade: "policy.", lede: "How we use cookies and similar technologies, and how you can control them." },
  "aml-policy": { crumb: "AML policy", eyebrow: "Compliance", icon: ShieldCheck, lead: "Anti-money", fade: "laundering policy.", lede: "How we verify identities and monitor activity to keep the platform clean." },
  "risk-disclosure": { crumb: "Risk disclosure", eyebrow: "Compliance", icon: TriangleAlert, lead: "Risk", fade: "disclosure.", lede: "Trading involves significant risk. Please read this before using our services." },
};

const ORDER: LegalKey[] = ["terms", "privacy", "cookie", "aml-policy", "risk-disclosure"];
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Renders the original **bold** spans as <strong>. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-[var(--g-ink)]">
            {p}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i} className="mt-4 text-[16px] leading-[1.75] text-[var(--g-muted-ink)]">
            <Rich text={b.text} />
          </p>
        ) : (
          <ul key={i} className="mt-4 grid gap-2.5">
            {b.items.map((it, j) => (
              <li key={j} className="flex gap-3 text-[16px] leading-[1.7] text-[var(--g-muted-ink)]">
                <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--g-emerald)]" />
                <span>
                  <Rich text={it} />
                </span>
              </li>
            ))}
          </ul>
        ),
      )}
    </>
  );
}

export function LegalPage({ doc }: { doc: LegalKey }) {
  const d = LEGAL[doc];
  const m = META[doc];
  const [active, setActive] = useState(slug(d.sections[0]?.heading ?? ""));
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-30% 0px -60% 0px" });
    d.sections.forEach((s) => {
      const el = document.getElementById(slug(s.heading));
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [d]);

  return (
    <>
      <PageHero art={`/v2/pt/page-${doc}.webp`} crumb={m.crumb} eyebrow={m.eyebrow} icon={m.icon} lead={m.lead} fade={m.fade} lede={m.lede}>
        <p className="g-pill g-hair bg-white/[0.06] text-white/70 backdrop-blur-md">{d.updated}</p>
      </PageHero>

      <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-20 pb-32 sm:rounded-t-[56px] sm:pt-28 sm:pb-40">
        <Container>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[12px] font-semibold tracking-wide text-[var(--g-muted-ink)] uppercase">On this page</p>
              <nav aria-label="Sections" className="mt-4 flex flex-col gap-0.5 border-l border-black/[0.08]">
                {d.sections.map((s) => {
                  const id = slug(s.heading);
                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={cn(
                        "-ml-px border-l-2 py-1.5 pl-4 text-[13.5px] transition-colors",
                        active === id ? "border-[var(--g-emerald)] font-semibold text-[var(--g-ink)]" : "border-transparent text-[var(--g-muted-ink)] hover:text-[var(--g-ink)]",
                      )}
                    >
                      {s.heading}
                    </a>
                  );
                })}
              </nav>
              <p className="mt-10 text-[12px] font-semibold tracking-wide text-[var(--g-muted-ink)] uppercase">Other policies</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {ORDER.filter((k) => k !== doc).map((k) => (
                  <li key={k}>
                    <Link href={href(k)} className="text-[13.5px] text-[var(--g-emerald)] hover:underline">
                      {LEGAL[k].title}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>

            <Reveal>
              <article className="g-card-paper g-hair g-hair-ink rounded-[32px] p-7 sm:p-12">
                <h2 className="g-title g-shade-light text-[clamp(2rem,3.4vw,2.8rem)]">{d.title}</h2>
                <Blocks blocks={d.intro} />
                {d.sections.map((s) => (
                  <section key={s.heading} id={slug(s.heading)} className="mt-10 scroll-mt-28 border-t border-black/[0.06] pt-8">
                    <h3 className="text-[21px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{s.heading}</h3>
                    <Blocks blocks={s.blocks} />
                  </section>
                ))}
                <p className="mt-12 rounded-[18px] bg-black/[0.03] p-5 text-[14px] text-[var(--g-muted-ink)]">
                  Questions about this policy? Email{" "}
                  <a href="mailto:support@thepeopleprop.com" className="font-semibold text-[var(--g-emerald)]">
                    support@thepeopleprop.com
                  </a>{" "}
                  or visit the{" "}
                  <Link href={href("contact")} className="font-semibold text-[var(--g-emerald)]">
                    contact page
                  </Link>
                  .
                </p>
              </article>
            </Reveal>
          </div>
        </Container>
      </section>
      <Cta
        title={
          <>
            <span className="g-shade-dark">Questions about </span>
            <span className="g-shade-lime">our policies?</span>
          </>
        }
        lede="Our support team is happy to walk you through any of them."
        primary={{ label: "Contact support", href: href("contact") }}
        secondary={{ label: "Read the rules", href: href("rules") }}
        size="md"
      />
    </>
  );
}
