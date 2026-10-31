import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { blogs } from '@/lib/data/blogs';
import BlogPostContent from './BlogPostContent';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) return { title: 'Blog Not Found' };

  return {
    title: `${blog.title} | The People Prop`,
    description: blog.metaDescription,
    keywords: blog.metaKeywords,
    openGraph: {
      title: blog.title,
      description: blog.metaDescription,
      type: 'article',
      publishedTime: blog.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description: blog.metaDescription,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) notFound();

  return <BlogPostContent blog={blog} />;
}
