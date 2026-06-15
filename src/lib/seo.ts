import type { Metadata } from "next";

/**
 * Central SEO configuration for The People Prop.
 * Single source of truth for canonical domain, default metadata,
 * Open Graph / Twitter cards, and structured-data builders.
 */

export const SITE = {
  name: "The People Prop",
  shortName: "TPP",
  // Canonical production domain. Used for metadataBase, canonical URLs,
  // sitemap, robots, and absolute Open Graph image URLs.
  url: "https://thepeopleprop.live",
  locale: "en_US",
  twitter: "@thepeopleprop",
  description:
    "The People Prop (TPP) is a next-generation proprietary trading firm. Pass one fair evaluation, get funded up to $200,000, and keep up to 90% of your profits with bi-weekly payouts.",
  ogImage: "/og-image.png",
  logo: "/logo.webp",
} as const;

type PageMetaInput = {
  title: string;
  description: string;
  /** Path beginning with a slash, e.g. "/challenges". Use "/" for home. */
  path: string;
  keywords?: string[];
  /** Set true on legal / utility pages you do not want competing in search. */
  noindex?: boolean;
  ogType?: "website" | "article";
};

/**
 * Build a fully-formed Next.js Metadata object for a page, including a
 * self-referencing canonical URL and Open Graph / Twitter cards.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  noindex,
  ogType = "website",
}: PageMetaInput): Metadata {
  const canonical = path === "/" ? "/" : path;
  const fullTitle =
    path === "/" ? title : `${title} | ${SITE.name}`;

  return {
    title: fullTitle,
    description,
    keywords,
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: ogType,
      siteName: SITE.name,
      title: fullTitle,
      description,
      url: canonical,
      locale: SITE.locale,
      images: [
        {
          url: SITE.ogImage,
          width: 1200,
          height: 630,
          alt: SITE.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      site: SITE.twitter,
      creator: SITE.twitter,
      images: [SITE.ogImage],
    },
  };
}

/* ───────────────────────── Structured data (JSON-LD) ───────────────────────── */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    alternateName: SITE.shortName,
    url: SITE.url,
    logo: `${SITE.url}${SITE.logo}`,
    description: SITE.description,
    sameAs: [
      "https://x.com/thepeopleprop",
      "https://www.instagram.com/thepeopleprop",
      "https://www.youtube.com/@thepeopleprop",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@thepeopleprop.live",
      availableLanguage: ["en"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/faqs?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE.url}${c.path === "/" ? "" : c.path}`,
    })),
  };
}

/**
 * Product/Offer schema for the challenge accounts. Helps the funded-account
 * pricing surface as rich results.
 */
export function productSchema(challenge: {
  id: string;
  sizeLabel: string;
  price: number;
  profitSplit: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${SITE.shortName} ${challenge.sizeLabel} Funded Trading Challenge`,
    description: `Evaluation for a ${challenge.sizeLabel} funded trading account with up to a ${challenge.profitSplit}% profit split.`,
    brand: { "@type": "Brand", name: SITE.name },
    offers: {
      "@type": "Offer",
      price: challenge.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE.url}/challenges`,
    },
  };
}
