"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Lightbulb, Newspaper, PenLine } from "lucide-react";
import { blogs, type BlogPost } from "@/lib/data/blogs";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

const PER_PAGE = 6;
const sorted = [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
const postHref = (slug: string) => `${href("blog")}/${slug}`;
const niceDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

function Cover({ post, className, sizes }: { post: BlogPost; className?: string; sizes: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-[#121615]", className)}>
      <Image src={post.image || "/placeholder.svg"} alt="" fill sizes={sizes} className="object-cover transition-transform duration-700 [transition-timing-function:var(--g-out)] group-hover:scale-[1.04]" />
    </div>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={postHref(post.slug)} className="group block h-full">
      <article className="g-card-dark g-hair flex h-full flex-col overflow-hidden rounded-[26px]">
        <Cover post={post} className="aspect-[16/10]" sizes="(min-width: 1024px) 400px, 100vw" />
        <div className="flex flex-1 flex-col p-6">
          <p className="flex items-center gap-3 text-[12px] text-white/45">
            <span className="rounded-full bg-[var(--g-lime)]/10 px-2.5 py-1 font-semibold text-[var(--g-lime)]">{post.category}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime}
            </span>
          </p>
          <h3 className="mt-4 text-[18.5px] leading-snug font-semibold tracking-[-0.02em] text-white transition-colors group-hover:text-[var(--g-lime-soft)]">{post.title}</h3>
          <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-white/55">{post.heroExcerpt}</p>
          <p className="mt-auto pt-5 text-[12.5px] text-white/40">
            {post.author} · {niceDate(post.date)}
          </p>
        </div>
      </article>
    </Link>
  );
}

export function BlogIndex() {
  const featured = sorted[0];
  const rest = sorted.slice(1);
  const cats = useMemo(() => ["All", ...Array.from(new Set(rest.map((p) => p.category)))], [rest]);
  const [cat, setCat] = useState("All");
  const [shown, setShown] = useState(PER_PAGE);
  const list = rest.filter((p) => cat === "All" || p.category === cat);

  return (
    <>
      <PageHero
        art="/v2/pt/page-blog.webp"
        crumb="Blog"
        eyebrow="Blog"
        icon={Newspaper}
        lead="Market notes"
        fade="& trading guides."
        lede="Strategy, risk management, psychology and platform guides from the TPP trading desk."
      />

      <Section shell={false} className="pt-10 pb-24 sm:pb-28">
        <Container>
          <Reveal>
            <Link href={postHref(featured.slug)} className="group block">
              <article className="g-hair grid overflow-hidden rounded-[32px] bg-[linear-gradient(160deg,#152320,#0e1110)] lg:grid-cols-[1.15fr_0.85fr]">
                <Cover post={featured} className="aspect-[16/10] lg:aspect-auto lg:min-h-[420px]" sizes="(min-width: 1024px) 760px, 100vw" />
                <div className="flex flex-col justify-center p-7 sm:p-10">
                  <Eyebrow icon={PenLine}>Latest · {featured.category}</Eyebrow>
                  <h2 className="g-title g-shade-dark mt-5 text-[clamp(1.8rem,3vw,2.6rem)]">{featured.title}</h2>
                  <p className="mt-4 text-[15.5px] leading-relaxed text-white/60">{featured.heroExcerpt}</p>
                  <p className="mt-6 flex items-center gap-2 text-[13px] text-white/45">
                    {featured.author} · {niceDate(featured.date)} · {featured.readTime}
                  </p>
                  <span className="mt-7 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--g-lime)]">
                    Read the guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </article>
            </Link>
          </Reveal>

          <div className="g-noscroll -mx-1 mt-14 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cat === c}
                onClick={() => {
                  setCat(c);
                  setShown(PER_PAGE);
                }}
                className={cn("shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors", cat === c ? "bg-white text-[var(--g-ink)]" : "bg-white/[0.05] text-white/60 hover:text-white")}
              >
                {c}
              </button>
            ))}
          </div>

          <Stagger key={cat} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
            {list.slice(0, shown).map((p) => (
              <StaggerItem key={p.slug}>
                <PostCard post={p} />
              </StaggerItem>
            ))}
          </Stagger>
          {shown < list.length ? (
            <div className="mt-10 flex justify-center">
              <button type="button" onClick={() => setShown((n) => n + PER_PAGE)} className="g-btn g-btn-glass">
                Show more articles
              </button>
            </div>
          ) : null}
        </Container>
      </Section>
      <Cta />
    </>
  );
}

export function BlogArticle({ post }: { post: BlogPost }) {
  const related = sorted.filter((b) => b.slug !== post.slug).slice(0, 3);
  return (
    <>
      <section className="relative isolate z-10 overflow-x-clip bg-[#06100d]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(48,120,100,0.35),transparent)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#0e1110,transparent)]" />
          <div className="g-grain" />
        </div>
        <Container className="pt-36 pb-14 sm:pt-40">
          <div className="mx-auto max-w-3xl">
            <Link href={href("blog")} className="inline-flex items-center gap-1.5 text-[13px] text-white/55 transition-colors hover:text-white">
              <ArrowLeft className="h-4 w-4" /> All articles
            </Link>
            <p className="mt-6 flex flex-wrap items-center gap-3 text-[12.5px] text-white/50">
              <span className="rounded-full bg-[var(--g-lime)]/10 px-3 py-1 font-semibold text-[var(--g-lime)]">{post.category}</span>
              {niceDate(post.date)} · {post.readTime}
            </p>
            <h1 className="g-display g-shade-dark mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]">{post.title}</h1>
            <p className="mt-5 text-[17.5px] leading-relaxed text-white/65">{post.heroExcerpt}</p>
            <p className="mt-6 text-[13.5px] text-white/45">By {post.author}</p>
          </div>
          <div className="g-hair relative mx-auto mt-12 aspect-[16/9] max-w-5xl overflow-hidden rounded-[30px]">
            <Image src={post.image || "/placeholder.svg"} alt={post.title} fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        </Container>
      </section>

      <Section shell={false} className="pt-8 pb-28">
        <Container>
          <div className="mx-auto max-w-3xl">
            {post.sections.map((s, i) => (
              <div key={i} className="mt-12 first:mt-4">
                {s.heading ? <h2 className="text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-[-0.03em] text-white">{s.heading}</h2> : null}
                {s.paragraphs.map((p, j) => (
                  <p key={j} className="mt-5 text-[17px] leading-[1.75] text-white/70">
                    {p}
                  </p>
                ))}
                {s.list?.length ? (
                  <ul className="mt-5 grid gap-2.5">
                    {s.list.map((li, k) => (
                      <li key={k} className="flex gap-3 text-[16px] leading-relaxed text-white/70">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--g-lime)]" />
                        {li}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {s.tip ? (
                  <aside className="g-hair mt-6 flex gap-4 rounded-[22px] bg-[var(--g-lime)]/[0.07] p-5 ring-1 ring-[var(--g-lime)]/20">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[var(--g-lime)]" />
                    <p className="text-[15.5px] leading-relaxed text-white/80">{s.tip}</p>
                  </aside>
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-28 sm:pb-48">
        <Container>
          <Title tone="light" className="text-[clamp(2rem,3.6vw,3rem)]" lead="Keep" fade="reading." />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.slug} href={postHref(r.slug)} className="group block">
                <article className="g-card-paper g-hair g-hair-ink h-full overflow-hidden rounded-[24px]">
                  <Cover post={r} className="aspect-[16/10]" sizes="(min-width: 768px) 33vw, 100vw" />
                  <div className="p-5">
                    <p className="text-[12px] font-semibold text-[var(--g-emerald)]">{r.category}</p>
                    <h3 className="mt-2 text-[17px] leading-snug font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{r.title}</h3>
                    <p className="mt-3 text-[12.5px] text-[var(--g-muted-ink)]">{r.readTime}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </Container>
      </section>
      <Cta />
    </>
  );
}
