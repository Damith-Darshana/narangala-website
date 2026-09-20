import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  if (!post) notFound();

  // fire-and-forget view count
  await db
    .update(blogPosts)
    .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
    .where(eq(blogPosts.id, post.id));

  return (
    <article className="prose max-w-none">
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        By {post.author} · {new Date(post.publishedAt).toLocaleDateString()}
      </p>
      <div className="whitespace-pre-wrap">{post.content}</div>
    </article>
  );
}