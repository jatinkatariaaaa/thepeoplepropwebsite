'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PageLayout, PageHero, PageSection } from '@/components/layout';
import { Reveal, GsapWords, Magnetic } from '@/components/ui/Animations';
import { blogs } from '@/lib/data/blogs';

export default function BlogPage() {
  return (
    <PageLayout>
      {/* ── Hero ── */}
      <PageHero
        eyebrow="Blog"
        title="Trader Insights & Guides"
        titleHighlight={['Insights', 'Guides']}
        description="Sharpen your edge with expert prop-firm knowledge — strategies, risk management breakdowns, and industry intel written by funded traders."
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Blog', href: '/blog' },
        ]}
      />

      {/* ── Blog Grid ── */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <Reveal>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-[#0c0c0c] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cbfb45]">
                Latest Articles
              </span>
              <GsapWords
                as="h2"
                text="Stay Ahead of the Market"
                highlight={["Market"]}
                className="mt-4 font-bold tracking-[-0.02em] text-[#0c0c0c]"
                style={{ fontSize: "clamp(2rem, 4.5vw, 2.75rem)" }}
              />
              <p className="mx-auto mt-3 max-w-xl text-[16px] leading-relaxed text-[#6c6a68]">
                Deep dives, quick tips, and everything in between — curated for
                serious traders.
              </p>
            </div>
          </Reveal>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog, index) => (
              <Reveal key={blog.slug} delay={index * 0.08}>
                <Link href={`/blog/${blog.slug}`} className="group block h-full">
                  <article className="flex h-full flex-col rounded-2xl border border-[#0c0c0c]/10 bg-white/50 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                    {/* Category badge */}
                    <div className="mb-4 flex items-center justify-between">
                      <span className="rounded-full bg-[#0c0c0c] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#cbfb45]">
                        {blog.category}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="mb-3 flex items-center gap-3 text-[12px] text-[#6c6a68]">
                      <span>{blog.date}</span>
                      <span className="h-1 w-1 rounded-full bg-[#6c6a68]/40" />
                      <span>{blog.readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="mb-3 text-[20px] font-bold leading-snug tracking-[-0.01em] text-[#0c0c0c] transition-colors duration-200 group-hover:text-[#0c0c0c]/80">
                      {blog.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="mb-6 flex-1 text-[14px] leading-relaxed text-[#6c6a68]">
                      {blog.heroExcerpt}
                    </p>

                    {/* Read link */}
                    <div className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0c0c0c] transition-colors duration-200 group-hover:text-[#cbfb45]">
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

      {/* ── CTA ── */}
      <PageSection variant="lime">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <GsapWords
              as="h2"
              text="Ready to Get Funded?"
              highlight={["Funded?"]}
              className="font-bold tracking-[-0.02em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}
            />
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-[#0c0c0c]/70">
              Stop reading about it — start living it. Take on a challenge with
              The&nbsp;People&nbsp;Prop and prove your strategy in real conditions.
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
