"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  serviceProviders,
  serviceCategories,
  serviceReviews,
} from "@/lib/schema";
import { and, avg, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ProviderActionState = { error?: string; success?: boolean };

const verifySchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["verify", "reject", "suspend", "reinstate"]),
  notes: z.string().max(1000).default(""),
});

export async function moderateProvider(formData: FormData) {
  await requireAdmin();

  const parsed = verifySchema.safeParse({
    id: formData.get("id"),
    action: formData.get("action"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) throw new Error("Invalid input");
  const { id, action, notes } = parsed.data;

  const updates: Record<string, unknown> = { verificationNotes: notes };
  if (action === "verify") {
    updates.verificationStatus = "verified";
    updates.verifiedAt = new Date();
  } else if (action === "reject") {
    updates.verificationStatus = "rejected";
  } else if (action === "suspend") {
    updates.verificationStatus = "suspended";
  } else if (action === "reinstate") {
    updates.verificationStatus = "verified";
    updates.verifiedAt = new Date();
  }

  await db.update(serviceProviders).set(updates).where(eq(serviceProviders.id, id));

  revalidatePath("/admin/providers");
  revalidatePath("/services");
  revalidatePath(`/services/${id}`);
}

const providerEditSchema = z.object({
  id: z.string().uuid(),
  businessName: z.string().min(2).max(200),
  ownerName: z.string().min(2).max(100),
  phoneNumber: z.string().min(7).max(20),
  alternativePhone: z.string().max(20).optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  categoryId: z.string().uuid(),
  address: z.string().min(5),
  serviceArea: z.string().min(2).max(200),
  description: z.string().min(20).max(2000),
  pricePerUnit: z.coerce.number().min(0),
  priceDescription: z.string().max(200).optional().default(""),
  maxCapacity: z.coerce.number().int().min(0).optional(),
  currentInventory: z.coerce.number().int().min(0).optional(),
  isAvailable: z.coerce.boolean().default(true),
});

export async function updateProviderAdmin(formData: FormData) {
  await requireAdmin();

  const parsed = providerEditSchema.safeParse({
    id: formData.get("id"),
    businessName: formData.get("businessName"),
    ownerName: formData.get("ownerName"),
    phoneNumber: formData.get("phoneNumber"),
    alternativePhone: formData.get("alternativePhone") ?? "",
    email: formData.get("email") ?? "",
    categoryId: formData.get("categoryId"),
    address: formData.get("address"),
    serviceArea: formData.get("serviceArea"),
    description: formData.get("description"),
    pricePerUnit: formData.get("pricePerUnit"),
    priceDescription: formData.get("priceDescription") ?? "",
    maxCapacity: formData.get("maxCapacity") || undefined,
    currentInventory: formData.get("currentInventory") || undefined,
    isAvailable: formData.get("isAvailable") === "on",
  });

  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  const { id, ...data } = parsed.data;

  await db
    .update(serviceProviders)
    .set({
      ...data,
      alternativePhone: data.alternativePhone || null,
      email: data.email || null,
      pricePerUnit: data.pricePerUnit.toFixed(2),
      maxCapacity: data.maxCapacity ?? null,
      currentInventory: data.currentInventory ?? null,
      updatedAt: new Date(),
    })
    .where(eq(serviceProviders.id, id));

  revalidatePath("/admin/providers");
  revalidatePath(`/admin/providers/${id}`);
  revalidatePath(`/services/${id}`);
}

export async function deleteProvider(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  // Also recompute any dependent things? Bookings cascade-delete via schema.
  await db.delete(serviceProviders).where(eq(serviceProviders.id, id));

  revalidatePath("/admin/providers");
  revalidatePath("/services");
  revalidatePath("/admin/bookings");
}