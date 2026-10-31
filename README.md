This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Site design (glass)

Every public page uses the glass design. It was previewed under `/v2`; those URLs now redirect to the same page at the root (see `next.config.ts`).

| Where | What |
| --- | --- |
| `src/app/(site)/` | Public pages: landing page, challenges, rules, faqs, about, contact, careers, leaderboard, heatmap, contest, reviews, blog (+ articles), help, press, status, certificate check (`verify/[id]`), terms, privacy, cookie, aml-policy, risk-disclosure |
| `src/app/(site)/layout.tsx` | Shared shell: header, footer and data provider |
| `src/app/(auth)/login`, `src/app/auth/reset-password` | Sign-in pages, on the same design |
| `src/app/not-found.tsx` | 404 page |
| `src/app/glass.css` | Design tokens and glass utilities |
| `src/app/api/status/` | Live service checks behind the status page |
| `src/components/v2/glass/` | Landing page sections and shared UI |
| `src/components/v2/glass/pages/` | One file per inner page |
| `src/components/v2/glass/routes.ts` | Every internal link goes through `href()` |
| `public/art/` | Path-traced artwork (WebP) |
| `public/brand/` | Logo files offered on the press page |
| `tools/asset-studio/` | The studio that renders the artwork (see its README) |

Prices, programs and stats come from `src/data/*` and Supabase (`tpp_stats`, `tpp_platforms`, `tpp_faqs`).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```
