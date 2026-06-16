import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { blogs } from "@/lib/data/blogs";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export function generateMetadata({ params }: Props): Metadata {
  const blog = blogs.find((b) => b.slug === params.slug);
  
  if (!blog) {
    return { title: "Blog Not Found | The People Prop" };
  }

  return {
    title: `${blog.title} | The People Prop`,
    description: blog.metaDescription,
    openGraph: {
      title: blog.title,
      description: blog.metaDescription,
      type: "article",
      authors: [blog.author],
      publishedTime: blog.date,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.metaDescription,
    }
  };
}

export default function BlogPostPage({ params }: Props) {
  const blog = blogs.find((b) => b.slug === params.slug);

  if (!blog) {
    notFound();
  }

  // Simple parser to turn ## into headings and text into paragraphs
  const contentBlocks = blog.content.trim().split("\n\n").map(block => block.trim()).filter(Boolean);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <main className="container mx-auto px-4 max-w-3xl">
        <Link href="/blog" className="text-sm font-medium text-muted-foreground hover:text-primary mb-8 inline-flex items-center">
          &larr; Back to Blog
        </Link>
        
        <article className="prose prose-neutral dark:prose-invert prose-lg max-w-none">
          <div className="mb-10 space-y-4">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              {blog.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By {blog.author}</span>
              <span>&bull;</span>
              <span>{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>&bull;</span>
              <span>{blog.readTime}</span>
            </div>
          </div>
          
          <div className="space-y-6 text-foreground/90 leading-relaxed text-lg">
            {contentBlocks.map((block, idx) => {
              if (block.startsWith("## ")) {
                return (
                  <h2 key={idx} className="text-2xl font-bold mt-10 mb-4 text-foreground">
                    {block.replace("## ", "")}
                  </h2>
                );
              }
              // Simple bold parsing for **text**
              const formattedBlock = block.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
              return (
                <p 
                  key={idx} 
                  dangerouslySetInnerHTML={{ __html: formattedBlock }}
                />
              );
            })}
          </div>
        </article>
      </main>
    </div>
  );
}
