import Link from "next/link";
import { BlogForm } from "@/components/admin/blog-form";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Blog Post</h1>
        <Link href="/admin/blog" className="text-sm underline">
          ← Back
        </Link>
      </header>
      <BlogForm mode="create" />
    </div>
  );
}