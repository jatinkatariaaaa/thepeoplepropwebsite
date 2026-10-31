import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogs } from "@/lib/data/blogs";
import { BlogArticle } from "@/components/v2/glass/pages/blog-page";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.metaKeywords,
    openGraph: { title: post.title, description: post.metaDescription, type: "article", publishedTime: post.date },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const post = blogs.find((b) => b.slug === slug);
  if (!post) notFound();
  return <BlogArticle post={post} />;
}
