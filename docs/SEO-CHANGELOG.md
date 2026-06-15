# SEO Implementation Changelog

This document records the SEO work applied to the The People Prop website so future
contributors understand what was changed, why, and where to update things.

Branch: `seo-audit-and-roadmap`

---

## 1. Summary

The site previously had a single shared title/description on every page, no
`metadataBase`, no canonical URLs, no Open Graph / Twitter image, no sitemap,
no robots file, no web manifest, no structured data, several broken internal
links, thin placeholder content on five pages, and a prerender crash on
`/challenges`.

All of the above were fixed. The production build now passes and `sitemap.xml`,
`robots.txt`, and `manifest.webmanifest` all generate correctly. `/challenges`
now prerenders as static content.

---

## 2. New files

| File | Purpose |
| --- | --- |
| `src/lib/seo.ts` | Central SEO config (`SITE`), `buildMetadata()` helper, and JSON-LD schema builders: `organizationSchema`, `websiteSchema`, `faqSchema`, `breadcrumbSchema`. **This is the single source of truth — edit site URL, brand name, and social handles here.** |
| `src/components/seo/JsonLd.tsx` | Reusable component that renders one or more JSON-LD objects into a `<script type="application/ld+json">` tag. |
| `src/app/robots.ts` | Generates `/robots.txt`. Allows public pages, disallows `/dashboard`, `/admin`, `/api`. References the sitemap. |
| `src/app/sitemap.ts` | Generates `/sitemap.xml` from the list of public routes. Dashboard/admin/api routes are excluded. |
| `src/app/manifest.ts` | Generates `/manifest.webmanifest` (PWA metadata, theme color, icons). |
| `public/og-image.png` | 1200x630 social share image used for Open Graph + Twitter cards. |
| `public/icon.png` | 512x512 app/PWA icon and favicon. |

### Per-page metadata layouts (client components)

Client component pages cannot export `metadata`, so a route-level `layout.tsx`
was added to supply metadata and (where relevant) JSON-LD:

- `src/app/challenges/layout.tsx` — metadata + Breadcrumb JSON-LD
- `src/app/faqs/layout.tsx` — metadata + FAQ JSON-LD
- `src/app/rules/layout.tsx` — metadata + Breadcrumb JSON-LD
- `src/app/contact/layout.tsx` — metadata
- `src/app/referral/layout.tsx` — metadata
- `src/app/heatmap/layout.tsx` — metadata

---

## 3. Modified files

### `src/app/layout.tsx` (root)
- Added `metadataBase` so all relative OG/canonical URLs resolve to absolute URLs.
- Added a title template (`%s | The People Prop`) with a default title.
- Added canonical URL, full Open Graph block, Twitter card, robots directives,
  icons, and manifest link.
- Added `viewport` export with `themeColor` and `colorScheme`.
- Injected site-wide Organization + WebSite JSON-LD via `<JsonLd>`.

### Legal pages — added `export const metadata` via `buildMetadata()`
- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`
- `src/app/cookie/page.tsx`
- `src/app/aml-policy/page.tsx`
- `src/app/risk-disclosure/page.tsx`

### Placeholder pages — replaced thin content with real, indexable content + metadata
- `src/app/about/page.tsx`
- `src/app/careers/page.tsx`
- `src/app/press/page.tsx`
- `src/app/help/page.tsx`
- `src/app/status/page.tsx` (marked `noindex` — low-value utility page)

### `src/components/layout/Footer.tsx` — fixed broken internal links
- `/faq` → `/faqs`
- `/blog` (no route) → `/help` ("Help Center")
- `/reviews` (no route) → `/press` ("Press")
- `/leaderboard` → `/dashboard/leaderboard`
- Dead `href="#"` social icons → real profile URLs (X, Instagram, YouTube,
  Discord) with `target="_blank"` + `rel="noopener noreferrer"`.

### `src/components/landing/ChallengeCalculator.tsx` — build/prerender fix
- The Supabase browser client was created at render time with non-null
  assertions on env vars. A missing env var crashed prerendering and blocked
  static generation of `/challenges`.
- Now the client is only created when both `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist; otherwise it falls back to the bundled
  program/platform data.
- Added `if (!supabase) return;` guards inside `fetchLivePrograms`,
  `fetchLivePlatforms`, and the promo-code handler.

---

## 4. Things to update for production

These are sensible defaults — update them with real values:

1. **`src/lib/seo.ts`**
   - `SITE.url` — set to the real production domain.
   - `SITE.twitter` — real X/Twitter handle.
   - Social profile URLs used in the Organization schema (`sameAs`).
2. **`src/components/layout/Footer.tsx`**
   - Social icon URLs (X, Instagram, YouTube, Discord) — confirm real handles.
3. **Google Search Console** — submit `sitemap.xml` after deploy.

---

## 5. What was NOT changed
- No changes to dashboard, admin, or API routes.
- No database schema changes.
- No design/visual redesign — only content additions on the placeholder pages.
