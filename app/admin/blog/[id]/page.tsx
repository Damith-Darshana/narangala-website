import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { BlogForm } from "@/components/admin/blog-form";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);

  if (!post) notFound();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
        <Link href="/admin/blog" className="text-sm underline">
          ← Back
        </Link>
      </header>
      <BlogForm mode="edit" post={post} />
    </div>
  );
}