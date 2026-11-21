import type { MetadataRoute } from "next";
import { PROGRAM_ORDER } from "@/data/catalogue";
import { blogs } from "@/lib/data/blogs";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "/", "/about", "/challenges", "/faqs", "/help", "/rules", "/contact", "/leaderboard",
    "/reviews", "/status", "/press", "/careers", "/contest", "/heatmap", "/tools", "/blog",
    "/terms", "/privacy", "/cookie", "/aml-policy", "/payout-policy", "/refund-policy", "/risk-disclosure",
    ...PROGRAM_ORDER.map((program) => `/challenges/${program}`),
    ...blogs.map((post) => `/blog/${post.slug}`),
  ];
  return pages.map((page) => ({ url: new URL(page, "https://thepeopleprop.live").toString() }));
}
