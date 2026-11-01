import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: true,
  },
  // /v2 previews the next landing page. Older /v2/<page> links, from when every
  // glass page was previewed there, go to the live page. Temporary (307) so
  // browsers don't cache it and /v2 can keep hosting previews.
  async redirects() {
    return [{ source: "/v2/:path+", destination: "/:path+", permanent: false }];
  },
};

export default nextConfig;
