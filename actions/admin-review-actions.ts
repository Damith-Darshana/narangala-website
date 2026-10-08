"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { serviceReviews, serviceProviders } from "@/lib/schema";
import { and, avg, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function recomputeRating(providerId: string) {
  const [result] = await db
    .select({
      avgRating: avg(serviceReviews.rating),
      total: count(serviceReviews.id),
    })
    .from(serviceReviews)
    .where(
      and(
        eq(serviceReviews.providerId, providerId),
        eq(serviceReviews.isApproved, true)
      )
    );

  const avgValue = result?.avgRating ? Number(result.avgRating).toFixed(2) : "0.00";
  const totalValue = result?.total ? Number(result.total) : 0;

  await db
    .update(serviceProviders)
    .set({
      averageRating: avgValue,
      totalReviews: totalValue,
    })
    .where(eq(serviceProviders.id, providerId));
}

export async function approveReview(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const [r] = await db
    .select()
    .from(serviceReviews)
    .where(eq(serviceReviews.id, id))
    .limit(1);
  if (!r) return;

  await db
    .update(serviceReviews)
    .set({ isApproved: true })
    .where(eq(serviceReviews.id, id));

  await recomputeRating(r.providerId);

  revalidatePath("/admin/reviews");
  revalidatePath(`/services/${r.providerId}`);
}

export async function rejectReview(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const [r] = await db
    .select()
    .from(serviceReviews)
    .where(eq(serviceReviews.id, id))
    .limit(1);
  if (!r) return;

  await db
    .update(serviceReviews)
    .set({ isApproved: false })
    .where(eq(serviceReviews.id, id));

  await recomputeRating(r.providerId);

  revalidatePath("/admin/reviews");
  revalidatePath(`/services/${r.providerId}`);
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const [r] = await db
    .select()
    .from(serviceReviews)
    .where(eq(serviceReviews.id, id))
    .limit(1);
  if (!r) return;

  await db.delete(serviceReviews).where(eq(serviceReviews.id, id));
  await recomputeRating(r.providerId);

  revalidatePath("/admin/reviews");
  revalidatePath(`/services/${r.providerId}`);
}