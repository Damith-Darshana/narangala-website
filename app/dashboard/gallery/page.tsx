import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { GalleryUploader } from "@/components/gallery-uploader";
import { r2Url } from "@/lib/r2-client";
import Link from "next/link";
import { deletePhoto } from "@/actions/gallery-actions";

const MAX_UPLOADS = 5;

export default async function DashboardGalleryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const photos = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.userId, userId))
    .orderBy(desc(galleryImages.createdAt));

  const remaining = Math.max(0, MAX_UPLOADS - photos.length);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-baseline">
        <h1 className="text-2xl font-bold">My Photos</h1>
        <Link href="/gallery" className="text-sm underline">
          View public gallery →
        </Link>
      </header>

      <section>
        <h2 className="font-semibold mb-3">
          Upload new ({photos.length}/{MAX_UPLOADS})
        </h2>
        <GalleryUploader remaining={remaining} />
      </section>

      {photos.length > 0 && (
        <section>
          <h2 className="font-semibold mb-3">Your uploads</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {photos.map((p) => (
              <div key={p.id} className="border rounded-lg overflow-hidden">
                {r2Url(p.r2Key) ? (
                  <img
                    src={r2Url(p.r2Key)!}
                    alt={p.title || "Upload"}
                    className="w-full h-40 object-cover bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    Image
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {p.title || "Untitled"}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <form action={deletePhoto}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded ${styles[status] ?? "bg-gray-100"}`}
    >
      {status}
    </span>
  );
}