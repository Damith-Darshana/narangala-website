import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";

export const revalidate = 60; // ISR: rebuild every 60s

export default async function BlogListPage() {
  const posts = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      {posts.length === 0 && (
        <p className="text-gray-500">
          No blog posts yet. (Run the seed command below.)
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold text-lg">{post.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}