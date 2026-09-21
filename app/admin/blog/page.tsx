import Link from "next/link";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/schema";
import { desc } from "drizzle-orm";
import { deleteBlogPost, toggleBlogPublished } from "@/actions/admin-blog-actions";

export default async function AdminBlogListPage() {
  const posts = await db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="text-gray-600 mt-1">{posts.length} total</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800"
        >
          + New post
        </Link>
      </header>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Title</th>
              <th className="text-left p-3 font-medium">Author</th>
              <th className="text-left p-3 font-medium">Views</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Published</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b last:border-b-0">
                <td className="p-3 max-w-xs truncate">{p.title}</td>
                <td className="p-3 text-gray-600">{p.author}</td>
                <td className="p-3">{p.viewCount}</td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      p.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(p.publishedAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right space-x-3">
                  <Link
                    href={`/blog/${p.slug}`}
                    className="text-xs text-gray-600 hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/blog/${p.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={toggleBlogPublished} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="text-xs text-gray-600 hover:underline"
                    >
                      {p.isPublished ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteBlogPost} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}