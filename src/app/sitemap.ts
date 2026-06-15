import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/**
 * XML sitemap. Lists only canonical, indexable, public marketing pages.
 * Authenticated routes (/dashboard, /admin), API routes, and auth pages
 * are intentionally excluded and are also disallowed in robots.ts.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: {
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/challenges", priority: 0.9, changeFrequency: "weekly" },
    { path: "/rules", priority: 0.8, changeFrequency: "monthly" },
    { path: "/faqs", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
    { path: "/referral", priority: 0.6, changeFrequency: "monthly" },
    { path: "/heatmap", priority: 0.5, changeFrequency: "daily" },
    { path: "/careers", priority: 0.5, changeFrequency: "monthly" },
    { path: "/press", priority: 0.4, changeFrequency: "monthly" },
    { path: "/help", priority: 0.5, changeFrequency: "monthly" },
    { path: "/status", priority: 0.3, changeFrequency: "daily" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/cookie", priority: 0.3, changeFrequency: "yearly" },
    { path: "/risk-disclosure", priority: 0.4, changeFrequency: "yearly" },
    { path: "/aml-policy", priority: 0.3, changeFrequency: "yearly" },
  ];

  return routes.map((r) => ({
    url: `${SITE.url}${r.path === "/" ? "" : r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
