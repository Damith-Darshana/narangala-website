"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  serviceBookings,
  serviceProviders,
  serviceAvailability,
} from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateBookingId } from "@/lib/utils";
import { z } from "zod";

const createBookingSchema = z.object({
  providerId: z.string().uuid(),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time"),
  serviceType: z.string().min(1).default("general"),
  totalAmount: z.coerce.number().min(0),
  depositAmount: z.coerce.number().min(0).default(0),
  userNotes: z.string().max(1000).default(""),
  details: z.string().default("{}"),
});

export type CreateBookingState = {
  error?: string;
  success?: boolean;
  bookingId?: string;
};

export async function createBooking(
  _prev: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const userId = (session.user as any).id as string;

  const parsed = createBookingSchema.safeParse({
    providerId: formData.get("providerId"),
    bookingDate: formData.get("bookingDate"),
    bookingTime: formData.get("bookingTime"),
    serviceType: formData.get("serviceType") ?? "general",
    totalAmount: formData.get("totalAmount"),
    depositAmount: formData.get("depositAmount") ?? 0,
    userNotes: formData.get("userNotes") ?? "",
    details: formData.get("details") ?? "{}",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Verify provider exists and is verified
  const [provider] = await db
    .select()
    .from(serviceProviders)
    .where(
      and(
        eq(serviceProviders.id, data.providerId),
        eq(serviceProviders.verificationStatus, "verified")
      )
    )
    .limit(1);

  if (!provider) return { error: "Provider not found or not verified" };

  // Check blocked dates
  const blocked = await db
    .select()
    .from(serviceAvailability)
    .where(
      and(
        eq(serviceAvailability.providerId, provider.id),
        eq(serviceAvailability.date, data.bookingDate),
        eq(serviceAvailability.isAvailable, false)
      )
    )
    .limit(1);

  if (blocked.length > 0) {
    return { error: "Provider is not available on that date" };
  }

  const bookingId = generateBookingId();

  await db.insert(serviceBookings).values({
    bookingId,
    userId,
    providerId: provider.id,
    serviceType: data.serviceType,
    bookingDate: data.bookingDate,
    bookingTime: data.bookingTime,
    details: data.details,
    totalAmount: data.totalAmount.toFixed(2),
    depositAmount: data.depositAmount.toFixed(2),
    userNotes: data.userNotes,
    status: "pending",
    paymentStatus: "pending",
  });

  revalidatePath("/dashboard/bookings");
  revalidatePath(`/services/${provider.id}`);

  return { success: true, bookingId };
}

export async function cancelBooking(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id as string;
  const bookingUuid = formData.get("id") as string;
  const reason = (formData.get("reason") as string) || "No reason provided";

  const [booking] = await db
    .select()
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.id, bookingUuid),
        eq(serviceBookings.userId, userId)
      )
    )
    .limit(1);

  if (!booking) throw new Error("Booking not found");
  if (!["pending", "confirmed"].includes(booking.status)) {
    throw new Error("Booking cannot be cancelled in its current state");
  }

  // Enforce 2-hour cancellation window
  const [h, m] = booking.bookingTime.split(":").map(Number);
  const bookingDateTime = new Date(`${booking.bookingDate}T00:00:00`);
  bookingDateTime.setHours(h, m, 0, 0);
  const hoursUntil =
    (bookingDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 2) {
    throw new Error(
      "Bookings can only be cancelled at least 2 hours before the scheduled time"
    );
  }

  await db
    .update(serviceBookings)
    .set({
      status: "cancelled_by_user",
      cancelledAt: new Date(),
      cancellationReason: reason,
      cancelledBy: session.user.email ?? "user",
    })
    .where(eq(serviceBookings.id, bookingUuid));

  revalidatePath("/dashboard/bookings");
}

export async function updateBookingStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id as string;
  const bookingUuid = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!["confirmed", "completed", "cancelled_by_provider", "no_show"].includes(status)) {
    throw new Error("Invalid status");
  }

  // Find provider owned by this user
  const [provider] = await db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (!provider) throw new Error("You are not a provider");

  const [booking] = await db
    .select()
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.id, bookingUuid),
        eq(serviceBookings.providerId, provider.id)
      )
    )
    .limit(1);

  if (!booking) throw new Error("Booking not found");

  const updates: Record<string, unknown> = { status };
  if (status === "confirmed") updates.confirmedAt = new Date();
  if (status === "completed") updates.completedAt = new Date();
  if (status === "cancelled_by_provider") {
    updates.cancelledAt = new Date();
    updates.cancelledBy = "provider";
  }

  await db
    .update(serviceBookings)
    .set(updates)
    .where(eq(serviceBookings.id, bookingUuid));

  // Update provider stats
  if (status === "completed") {
    await db
      .update(serviceProviders)
      .set({
        completedBookings: provider.completedBookings + 1,
        totalBookings: provider.totalBookings + 1,
      })
      .where(eq(serviceProviders.id, provider.id));
  } else if (status === "cancelled_by_provider") {
    await db
      .update(serviceProviders)
      .set({
        cancelledBookings: provider.cancelledBookings + 1,
        totalBookings: provider.totalBookings + 1,
      })
      .where(eq(serviceProviders.id, provider.id));
  }

  revalidatePath("/provider/bookings");
  revalidatePath("/dashboard/bookings");
}