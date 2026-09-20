"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  serviceAvailability,
  serviceProviders,
} from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function blockDate(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id as string;
  const date = formData.get("date") as string;
  const reason = (formData.get("reason") as string) || "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");

  const [provider] = await db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (!provider) throw new Error("Not a provider");

  // Upsert
  const [existing] = await db
    .select()
    .from(serviceAvailability)
    .where(
      and(
        eq(serviceAvailability.providerId, provider.id),
        eq(serviceAvailability.date, date)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(serviceAvailability)
      .set({ isAvailable: false, reason })
      .where(eq(serviceAvailability.id, existing.id));
  } else {
    await db.insert(serviceAvailability).values({
      providerId: provider.id,
      date,
      isAvailable: false,
      reason,
    });
  }

  revalidatePath("/provider/availability");
}

export async function unblockDate(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id as string;
  const id = formData.get("id") as string;

  const [provider] = await db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (!provider) throw new Error("Not a provider");

  await db
    .delete(serviceAvailability)
    .where(
      and(
        eq(serviceAvailability.id, id),
        eq(serviceAvailability.providerId, provider.id)
      )
    );

  revalidatePath("/provider/availability");
}