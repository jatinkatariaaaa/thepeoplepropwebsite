import type { Metadata } from "next";
import { preload } from "react-dom";
import { BlogIndex } from "@/components/v2/glass/pages/blog-page";

export const metadata: Metadata = {
  title: "Blog",
  description: "Strategy, risk management, psychology and platform guides from the TPP trading desk.",
};

export default function Page() {
  preload("/v2/pt/page-blog.webp", { as: "image", fetchPriority: "high" });
  return <BlogIndex />;
}
