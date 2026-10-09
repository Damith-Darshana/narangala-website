import { db } from "@/lib/db";
import { galleryImages, users } from "@/lib/schema";
import { desc, eq, and } from "drizzle-orm";
import { r2Url } from "@/lib/r2-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Gallery",
  description:
    "Photos shared by hikers who climbed Narangala Mountain. Sunrise views, golden grasslands, and summit panoramas.",
};


export const revalidate = 60;

export default async function PublicGalleryPage() {
  const photos = await db
    .select({
      id: galleryImages.id,
      title: galleryImages.title,
      description: galleryImages.description,
      r2Key: galleryImages.r2Key,
      createdAt: galleryImages.createdAt,
      uploaderFirstName: users.firstName,
      uploaderLastName: users.lastName,
    })
    .from(galleryImages)
    .innerJoin(users, eq(users.id, galleryImages.userId))
    .where(eq(galleryImages.status, "approved"))
    .orderBy(desc(galleryImages.createdAt));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Gallery</h1>
        <p className="text-gray-600 mt-1">
          Photos shared by hikers who explored Narangala.
        </p>
      </header>

      {photos.length === 0 && (
        <p className="text-gray-500">
          No approved photos yet. Photos appear here after admin review.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {photos.map((p) => {
          const url = r2Url(p.r2Key);
          return (
            <figure key={p.id} className="border rounded-lg overflow-hidden">
              {url && (
                <img
                  src={url}
                  alt={p.title || "Narangala photo"}
                  className="w-full aspect-square object-cover bg-gray-100"
                  loading="lazy"
                />
              )}
              <figcaption className="p-3">
                <div className="font-medium text-sm">
                  {p.title || "Narangala"}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  by {p.uploaderFirstName} {p.uploaderLastName}
                </div>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}