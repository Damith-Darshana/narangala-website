"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2-client";
import { revalidatePath } from "next/cache";

export async function deletePhoto(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id as string;
  const id = formData.get("id") as string;

  const [row] = await db
    .select()
    .from(galleryImages)
    .where(and(eq(galleryImages.id, id), eq(galleryImages.userId, userId)))
    .limit(1);

  if (!row) throw new Error("Not found");

  // Delete from R2
  try {
    await r2.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: row.r2Key })
    );
  } catch (err) {
    console.error("Failed to delete R2 object:", err);
    // Continue — DB row should still be removed
  }

  await db.delete(galleryImages).where(eq(galleryImages.id, id));

  revalidatePath("/dashboard/gallery");
  revalidatePath("/gallery");
}