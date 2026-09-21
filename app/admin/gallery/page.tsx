import Link from "next/link";
import { db } from "@/lib/db";
import { galleryImages, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { r2Url } from "@/lib/r2-client";
import {
  approvePhoto,
  rejectPhoto,
  adminDeletePhoto,
} from "@/actions/admin-gallery-actions";

type SearchParams = Promise<{ status?: string }>;

export default async function AdminGalleryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const filterStatus = status ?? "pending";

  const photos = await db
    .select({
      p: galleryImages,
      uploaderFirstName: users.firstName,
      uploaderLastName: users.lastName,
      uploaderEmail: users.email,
    })
    .from(galleryImages)
    .innerJoin(users, eq(users.id, galleryImages.userId))
    .where(eq(galleryImages.status, filterStatus))
    .orderBy(desc(galleryImages.createdAt));

  const tabs = ["pending", "approved", "rejected"];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Gallery Moderation</h1>
        <p className="text-gray-600 mt-1">
          Approve photos to make them appear on the public gallery.
        </p>
      </header>

      <div className="flex gap-2 border-b">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/admin/gallery?status=${t}`}
            className={`px-3 py-2 text-sm capitalize border-b-2 -mb-px ${
              filterStatus === t
                ? "border-black text-black font-medium"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-500">No {filterStatus} photos.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {photos.map(({ p, uploaderFirstName, uploaderLastName, uploaderEmail }) => {
            const url = r2Url(p.r2Key);
            return (
              <div key={p.id} className="border rounded-lg overflow-hidden">
                {url ? (
                  <img
                    src={url}
                    alt={p.title || "Photo"}
                    className="w-full aspect-square object-cover bg-gray-100"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    No preview
                  </div>
                )}
                <div className="p-3 space-y-2 text-sm">
                  <div className="font-medium">
                    {p.title || "Untitled"}
                  </div>
                  {p.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500">
                    by {uploaderFirstName} {uploaderLastName} ({uploaderEmail})
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {filterStatus !== "approved" && (
                      <form action={approvePhoto}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                      </form>
                    )}
                    {filterStatus !== "rejected" && (
                      <form action={rejectPhoto}>
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          className="text-xs border border-red-500 text-red-600 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Reject
                        </button>
                      </form>
                    )}
                    <form action={adminDeletePhoto}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="text-xs text-gray-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}