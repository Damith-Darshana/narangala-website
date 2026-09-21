"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with dashes"),
  excerpt: z.string().min(10).max(300),
  content: z.string().min(10),
  author: z.string().min(1).max(100),
  categories: z.string().max(200).default(""),
  tags: z.string().max(200).default(""),
  isPublished: z.coerce.boolean().default(false),
});

export type BlogFormState = { error?: string; success?: boolean };

export async function createBlogPost(
  _prev: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  await requireAdmin();

  const parsed = blogSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    author: formData.get("author"),
    categories: formData.get("categories") ?? "",
    tags: formData.get("tags") ?? "",
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Slug conflict?
  const existing = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, parsed.data.slug))
    .limit(1);
  if (existing.length > 0) return { error: "A post with this slug already exists" };

  await db.insert(blogPosts).values(parsed.data);

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function updateBlogPost(
  id: string,
  _prev: BlogFormState,
  formData: FormData
): Promise<BlogFormState> {
  await requireAdmin();

  const parsed = blogSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    author: formData.get("author"),
    categories: formData.get("categories") ?? "",
    tags: formData.get("tags") ?? "",
    isPublished: formData.get("isPublished") === "on",
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Slug conflict with another post?
  const conflict = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, parsed.data.slug))
    .limit(1);
  if (conflict.length > 0 && conflict[0].id !== id) {
    return { error: "Another post already uses this slug" };
  }

  await db.update(blogPosts).set(parsed.data).where(eq(blogPosts.id, id));

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.data.slug}`);
  redirect("/admin/blog");
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

export async function toggleBlogPublished(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  if (!post) return;

  await db
    .update(blogPosts)
    .set({ isPublished: !post.isPublished })
    .where(eq(blogPosts.id, id));

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}