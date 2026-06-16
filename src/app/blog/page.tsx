import { Metadata } from "next";
import Link from "next/link";
import { blogs } from "@/lib/data/blogs";

export const metadata: Metadata = {
  title: "Blog & Prop Firm Insights | The People Prop",
  description: "Read the latest insights, strategies, and updates from The People Prop. Learn how to pass your prop firm challenge and get funded today.",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="mb-16 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Trader <span className="text-primary">Insights</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about passing your evaluation, risk management, and the proprietary trading industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <Link 
              key={blog.slug} 
              href={\`/blog/\${blog.slug}\`}
              className="group flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(blog.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="bg-secondary px-2 py-1 rounded-md text-secondary-foreground">{blog.readTime}</span>
                </div>
                <h2 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {blog.title}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {blog.metaDescription}
                </p>
              </div>
              <div className="mt-6 flex items-center text-sm font-medium text-primary">
                Read Article &rarr;
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
