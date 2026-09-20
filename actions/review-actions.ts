"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  serviceBookings,
  serviceProviders,
  serviceReviews,
} from "@/lib/schema";
import { and, avg, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewSchema = z.object({
  providerId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(5).max(2000),
});

export type ReviewState = { error?: string; success?: boolean };

export async function createReview(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const userId = (session.user as any).id as string;

  const parsed = reviewSchema.safeParse({
    providerId: formData.get("providerId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { providerId, rating, comment } = parsed.data;

  // Must have at least one completed booking with this provider
  const [completedBooking] = await db
    .select()
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.userId, userId),
        eq(serviceBookings.providerId, providerId),
        eq(serviceBookings.status, "completed")
      )
    )
    .limit(1);

  if (!completedBooking) {
    return {
      error:
        "You can only review providers you have a completed booking with",
    };
  }

  // One review per user per provider
  const existing = await db
    .select({ id: serviceReviews.id })
    .from(serviceReviews)
    .where(
      and(
        eq(serviceReviews.userId, userId),
        eq(serviceReviews.providerId, providerId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { error: "You have already reviewed this provider" };
  }

  await db.insert(serviceReviews).values({
    userId,
    providerId,
    bookingId: completedBooking.id,
    rating,
    comment,
    isApproved: false,
  });

  revalidatePath(`/services/${providerId}`);
  return { success: true };
}

export async function respondToReview(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id as string;
  const reviewId = formData.get("id") as string;
  const response = formData.get("response") as string;

  const [provider] = await db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (!provider) throw new Error("Not a provider");

  const [review] = await db
    .select()
    .from(serviceReviews)
    .where(
      and(
        eq(serviceReviews.id, reviewId),
        eq(serviceReviews.providerId, provider.id)
      )
    )
    .limit(1);

  if (!review) throw new Error("Review not found");

  await db
    .update(serviceReviews)
    .set({ providerResponse: response, responseAt: new Date() })
    .where(eq(serviceReviews.id, reviewId));

  revalidatePath("/provider/reviews");
  revalidatePath(`/services/${provider.id}`);
}

// Recompute average rating for a provider
export async function recomputeProviderRating(providerId: string) {
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