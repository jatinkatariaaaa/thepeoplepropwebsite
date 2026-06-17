'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  Calendar,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import { PageLayout, PageSection } from '@/components/layout';
import { Reveal, GsapWords, Magnetic, Floating } from '@/components/ui/Animations';
import { blogs, type BlogPost } from '@/lib/data/blogs';

interface BlogPostContentProps {
  blog: BlogPost;
}

export default function BlogPostContent({ blog }: BlogPostContentProps) {
  /* ── Related articles (up to 3, excluding current) ── */
  const related = blogs
    .filter((b) => b.slug !== blog.slug)
    .slice(0, 3);

  return (
    <PageLayout>
      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#0c0c0c] px-4 pb-20 pt-32 md:px-8 md:pb-28 md:pt-40">
        {/* Ambient floating orbs */}
        <div className="pointer-events-none absolute inset-0">
          <Floating duration={9} amplitude={30}>
            <div className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-[#cbfb45]/[0.06] blur-[100px]" />
          </Floating>
          <Floating duration={11} amplitude={20}>
            <div className="absolute bottom-[10%] right-[15%] h-96 w-96 rounded-full bg-[#cbfb45]/[0.04] blur-[120px]" />
          </Floating>
          <Floating duration={8} amplitude={15}>
            <div className="absolute right-[40%] top-[60%] h-48 w-48 rounded-full bg-white/[0.03] blur-[80px]" />
          </Floating>
        </div>

        <div className="relative z-10 mx-auto max-w-4xl">
          {/* Back link */}
          <Reveal>
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-[13px] font-medium text-[#f1eade]/60 transition-colors duration-200 hover:text-[#cbfb45]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Blog
            </Link>
          </Reveal>

          {/* Breadcrumb */}
          <Reveal delay={0.05}>
            <nav className="mb-8 flex items-center gap-1.5 text-[12px] text-[#f1eade]/40">
              <Link
                href="/"
                className="transition-colors duration-200 hover:text-[#cbfb45]"
              >
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link
                href="/blog"
                className="transition-colors duration-200 hover:text-[#cbfb45]"
              >
                Blog
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="max-w-[200px] truncate text-[#f1eade]/60">
                {blog.title}
              </span>
            </nav>
          </Reveal>

          {/* Category badge */}
          <Reveal delay={0.1}>
            <span className="mb-6 inline-block rounded-full bg-[#cbfb45] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0c0c0c]">
              {blog.category}
            </span>
          </Reveal>

          {/* Title */}
          <Reveal delay={0.15}>
            <GsapWords
              as="h1"
              text={blog.title}
              className="mb-6 font-bold leading-[1.1] tracking-[-0.03em] text-[#f1eade]"
              style={{ fontSize: "clamp(2.2rem, 6vw, 3.75rem)" }}
            />
          </Reveal>

          {/* Excerpt */}
          <Reveal delay={0.2}>
            <p className="mb-8 max-w-2xl text-[17px] leading-relaxed text-[#f1eade]/60">
              {blog.heroExcerpt}
            </p>
          </Reveal>

          {/* Meta row */}
          <Reveal delay={0.25}>
            <div className="flex flex-wrap items-center gap-6 border-t border-[#f1eade]/10 pt-6">
              <div className="flex items-center gap-2 text-[13px] text-[#f1eade]/50">
                <User className="h-3.5 w-3.5 text-[#cbfb45]" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#f1eade]/50">
                <Calendar className="h-3.5 w-3.5 text-[#cbfb45]" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] text-[#f1eade]/50">
                <Clock className="h-3.5 w-3.5 text-[#cbfb45]" />
                <span>{blog.readTime}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ARTICLE BODY
      ══════════════════════════════════════════════════════ */}
      <PageSection variant="cream">
        <article className="mx-auto max-w-3xl font-serif">
          {blog.sections.map((section, idx) => (
            <Reveal key={idx} delay={idx * 0.04}>
              <div className="mb-8">
                {/* Section heading */}
                {section.heading && (
                  <h2 className="mb-4 mt-12 border-l-4 border-[#cbfb45] pl-4 font-sans text-[28px] font-bold tracking-[-0.02em] text-[#0c0c0c]">
                    {section.heading}
                  </h2>
                )}

                {/* Paragraphs */}
                {section.paragraphs.map((para, pIdx) => (
                  <p
                    key={pIdx}
                    className="mb-4 text-[16px] leading-[1.8] text-[#0c0c0c]/80"
                  >
                    {para}
                  </p>
                ))}

                {/* List */}
                {section.list && section.list.length > 0 && (
                  <ul className="my-6 space-y-3 pl-1">
                    {section.list.map((item, lIdx) => (
                      <li key={lIdx} className="flex items-start gap-3">
                        <span className="mt-[9px] h-2 w-2 flex-shrink-0 rounded-full bg-[#cbfb45]" />
                        <span className="text-[15px] leading-[1.7] text-[#0c0c0c]/75">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Tip callout */}
                {section.tip && (
                  <div className="my-8 flex gap-4 rounded-2xl border border-[#cbfb45]/30 bg-[#cbfb45]/10 p-5">
                    <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#cbfb45]" />
                    <p className="text-[15px] leading-[1.7] text-[#0c0c0c]/80">
                      {section.tip}
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </article>
      </PageSection>

      {/* ══════════════════════════════════════════════════════
          RELATED ARTICLES
      ══════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <PageSection variant="cream">
          <div className="mx-auto max-w-7xl">
            <Reveal>
              <div className="mb-10 text-center">
                <span className="mb-3 inline-block rounded-full bg-[#0c0c0c] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cbfb45]">
                  Keep Reading
                </span>
                <GsapWords
                  as="h2"
                  text="Related Articles"
                  className="mt-4 font-sans font-bold tracking-[-0.02em] text-[#0c0c0c]"
                  style={{ fontSize: "clamp(2rem, 4vw, 2.5rem)" }}
                />
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {related.map((post, index) => (
                <Reveal key={post.slug} delay={index * 0.08}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block h-full"
                  >
                    <article className="flex h-full flex-col rounded-2xl border border-[#0c0c0c]/10 bg-white/50 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                      {/* Category */}
                      <div className="mb-4">
                        <span className="rounded-full bg-[#0c0c0c] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cbfb45]">
                          {post.category}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="mb-3 flex items-center gap-3 text-[12px] text-[#6c6a68]">
                        <span>{post.date}</span>
                        <span className="h-1 w-1 rounded-full bg-[#6c6a68]/40" />
                        <span>{post.readTime}</span>
                      </div>

                      {/* Title */}
                      <h3 className="mb-3 font-sans text-[20px] font-bold leading-snug tracking-[-0.01em] text-[#0c0c0c] transition-colors duration-200 group-hover:text-[#0c0c0c]/80">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="mb-6 flex-1 text-[14px] leading-relaxed text-[#6c6a68]">
                        {post.heroExcerpt}
                      </p>

                      {/* Read link */}
                      <div className="flex items-center gap-1.5 font-sans text-[13px] font-semibold text-[#0c0c0c] transition-colors duration-200 group-hover:text-[#cbfb45]">
                        Read Article
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </PageSection>
      )}

      {/* ══════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════ */}
      <PageSection variant="lime">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <GsapWords
              as="h2"
              text="Start Your Challenge Today"
              className="font-sans font-bold tracking-[-0.02em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}
            />
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#0c0c0c]/70">
              You&apos;ve got the knowledge — now put it to work. Join
              The&nbsp;People&nbsp;Prop and trade with real capital, real
              conditions, and real payouts.
            </p>
            <div className="mt-8">
              <Magnetic>
                <Link
                  href="/challenge"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0c0c0c] px-8 py-4 text-[14px] font-semibold text-[#f1eade] transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
                >
                  Start Your Challenge
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </PageSection>
    </PageLayout>
  );
}
