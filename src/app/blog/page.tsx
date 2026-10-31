'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { PageLayout, PageSection } from '@/components/layout';
import { Reveal, Magnetic } from '@/components/ui/Animations';
import { blogs } from '@/lib/data/blogs';

const POSTS_PER_PAGE = 6;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  /* Sort newest first */
  const sorted = [...blogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const featured = sorted[0];
  const rest = sorted.slice(1);
  const totalPages = Math.ceil(rest.length / POSTS_PER_PAGE);
  const pagePosts = rest.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );
  const popular = sorted.slice(1, 5);

  return (
    <PageLayout>
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl pt-16 md:pt-20">
          {/* ── Page header ── */}
          <Reveal>
            <h1 className="text-[40px] font-bold tracking-[-0.03em] text-[#0c0c0c] md:text-[52px]">
              Blog
            </h1>
            <p className="mt-2 text-[15px] text-[#6c6a68]">
              Trading insights, strategies, and platform updates from The People Prop
            </p>
          </Reveal>

          {/* ── Featured post ── */}
          <Reveal delay={0.1}>
            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2"
            >
              <div className="overflow-hidden rounded-2xl border border-[#0c0c0c]/10">
                <Image
                  src={featured.image || '/placeholder.svg'}
                  alt={featured.title}
                  width={800}
                  height={450}
                  priority
                  className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div>
                <span className="text-[13px] font-semibold text-[#5a7a10]">
                  {featured.category}
                </span>
                <h2 className="mt-3 text-[26px] font-bold leading-[1.2] tracking-[-0.02em] text-[#0c0c0c] transition-colors duration-200 group-hover:text-[#0c0c0c]/70 md:text-[32px]">
                  {featured.title}
                </h2>
                <div className="mt-4 flex items-center gap-3 text-[13px] text-[#6c6a68]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0c0c0c] text-[9px] font-bold text-[#cbfb45]">
                    TPP
                  </span>
                  <span className="font-medium text-[#0c0c0c]">{featured.author}</span>
                  <span className="h-1 w-1 rounded-full bg-[#6c6a68]/40" />
                  <span>{formatDate(featured.date)}</span>
                  <span className="h-1 w-1 rounded-full bg-[#6c6a68]/40" />
                  <span>{featured.readTime}</span>
                </div>
              </div>
            </Link>
          </Reveal>

          {/* ── Main layout: latest posts + sidebar ── */}
          <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px]">
            {/* ── Latest posts ── */}
            <div>
              <Reveal>
                <h3 className="mb-8 text-[20px] font-bold tracking-[-0.01em] text-[#0c0c0c]">
                  Latest posts
                </h3>
              </Reveal>

              <div className="flex flex-col divide-y divide-[#0c0c0c]/10">
                {pagePosts.map((post, index) => (
                  <Reveal key={post.slug} delay={index * 0.06}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group grid grid-cols-1 gap-5 py-6 first:pt-0 sm:grid-cols-[220px_1fr] sm:items-center"
                    >
                      <div className="overflow-hidden rounded-xl border border-[#0c0c0c]/10">
                        <Image
                          src={post.image || '/placeholder.svg'}
                          alt={post.title}
                          width={440}
                          height={248}
                          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                        />
                      </div>
                      <div>
                        <span className="text-[12px] font-semibold text-[#5a7a10]">
                          {post.category}
                        </span>
                        <h4 className="mt-1.5 text-[18px] font-bold leading-snug tracking-[-0.01em] text-[#0c0c0c] transition-colors duration-200 group-hover:text-[#0c0c0c]/70">
                          {post.title}
                        </h4>
                        <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[12px] text-[#6c6a68]">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0c0c0c] text-[8px] font-bold text-[#cbfb45]">
                            TPP
                          </span>
                          <span className="font-medium text-[#0c0c0c]">
                            {post.author}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-[#6c6a68]/40" />
                          <span>{formatDate(post.date)}</span>
                          <span className="h-1 w-1 rounded-full bg-[#6c6a68]/40" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>

              {/* ── Pagination ── */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between border-t border-[#0c0c0c]/10 pt-6">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-[#0c0c0c] transition-opacity disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev page
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          aria-current={page === n ? 'page' : undefined}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
                            page === n
                              ? 'bg-[#0c0c0c] text-[#cbfb45]'
                              : 'text-[#6c6a68] hover:bg-[#0c0c0c]/5'
                          }`}
                        >
                          {n}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-[#0c0c0c] transition-opacity disabled:opacity-30"
                  >
                    Next page
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Sidebar ── */}
            <aside className="flex flex-col gap-10">
              {/* Newsletter */}
              <Reveal>
                <div className="rounded-2xl border border-[#0c0c0c]/10 bg-white/60 p-6">
                  <h3 className="text-[17px] font-bold text-[#0c0c0c]">
                    Sign up to our newsletter
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[#6c6a68]">
                    Monthly updates, trading insights, and platform news.
                  </p>
                  {subscribed ? (
                    <p className="mt-4 rounded-xl bg-[#cbfb45]/20 px-4 py-3 text-[13px] font-medium text-[#0c0c0c]">
                      You&apos;re subscribed. Welcome aboard!
                    </p>
                  ) : (
                    <form
                      className="mt-4 flex flex-col gap-2.5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (email.trim()) setSubscribed(true);
                      }}
                    >
                      <label htmlFor="newsletter-email" className="sr-only">
                        Your email address
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Ex: trader@example.com"
                        className="w-full rounded-xl border border-[#0c0c0c]/15 bg-white px-4 py-2.5 text-[13px] text-[#0c0c0c] placeholder:text-[#6c6a68]/60 focus:border-[#0c0c0c]/40 focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-[#0c0c0c] px-4 py-2.5 text-[13px] font-semibold text-[#cbfb45] transition-transform hover:scale-[1.02]"
                      >
                        Sign up
                      </button>
                    </form>
                  )}
                  <p className="mt-3 text-[11px] leading-relaxed text-[#6c6a68]/70">
                    By signing up, you agree to receive marketing emails. You can
                    unsubscribe anytime.
                  </p>
                </div>
              </Reveal>

              {/* Popular */}
              <Reveal delay={0.05}>
                <div>
                  <h3 className="mb-5 text-[17px] font-bold text-[#0c0c0c]">
                    Popular
                  </h3>
                  <div className="flex flex-col divide-y divide-[#0c0c0c]/10">
                    {popular.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group flex items-start gap-4 py-4 first:pt-0"
                      >
                        <div className="w-24 flex-shrink-0 overflow-hidden rounded-lg border border-[#0c0c0c]/10">
                          <Image
                            src={post.image || '/placeholder.svg'}
                            alt=""
                            width={192}
                            height={108}
                            className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[13px] font-bold leading-snug text-[#0c0c0c] transition-colors group-hover:text-[#0c0c0c]/70">
                            {post.title}
                          </h4>
                          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#6c6a68]">
                            <span className="font-semibold text-[#5a7a10]">
                              {post.category}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-[#6c6a68]/40" />
                            <span>{formatDate(post.date)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* Community CTA */}
              <Reveal delay={0.1}>
                <div className="rounded-2xl bg-[#0c0c0c] p-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#cbfb45]">
                      <Users className="h-5 w-5 text-[#0c0c0c]" />
                    </span>
                    <h3 className="text-[17px] font-bold text-[#f1eade]">
                      Join our community
                    </h3>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#f1eade]/60">
                    Learn, grow, and connect with funded traders worldwide.
                    Traders from 150+ countries trust The People Prop.
                  </p>
                  <Link
                    href="/challenge"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#cbfb45] px-5 py-2.5 text-[13px] font-semibold text-[#0c0c0c] transition-transform hover:scale-[1.03]"
                  >
                    Get Funded
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </PageSection>

      {/* ── CTA ── */}
      <PageSection variant="lime">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2
              className="font-bold tracking-[-0.02em] text-[#0c0c0c]"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3rem)' }}
            >
              Ready to Get Funded?
            </h2>
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
