"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { serviceBookings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function adminCancelBooking(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const reason = (formData.get("reason") as string) || "Cancelled by admin";

  await db
    .update(serviceBookings)
    .set({
      status: "cancelled_by_provider",
      cancelledAt: new Date(),
      cancelledBy: "admin",
      cancellationReason: reason,
    })
    .where(eq(serviceBookings.id, id));

  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/provider/bookings");
}

export async function adminMarkCompleted(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await db
    .update(serviceBookings)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(serviceBookings.id, id));

  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/provider/bookings");
}