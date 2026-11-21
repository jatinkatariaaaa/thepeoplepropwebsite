import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/dashboard/", "/api/", "/auth/", "/partner-desk", "/ref/", "/r/"] },
    sitemap: "https://thepeopleprop.live/sitemap.xml",
  };
}
