"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@/lib/r2-client";

export async function approvePhoto(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await db
    .update(galleryImages)
    .set({ status: "approved" })
    .where(eq(galleryImages.id, id));
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function rejectPhoto(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await db
    .update(galleryImages)
    .set({ status: "rejected" })
    .where(eq(galleryImages.id, id));
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export async function adminDeletePhoto(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  const [row] = await db
    .select()
    .from(galleryImages)
    .where(eq(galleryImages.id, id))
    .limit(1);
  if (!row) return;

  try {
    await r2.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: row.r2Key })
    );
  } catch (err) {
    console.error("R2 delete failed:", err);
  }

  await db.delete(galleryImages).where(eq(galleryImages.id, id));

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}