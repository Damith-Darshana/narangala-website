"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serviceProviders, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const providerSchema = z.object({
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
});

export type ProviderRegisterState = {
  error?: string;
  success?: boolean;
};

export async function registerAsProvider(
  _prev: ProviderRegisterState,
  formData: FormData
): Promise<ProviderRegisterState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be logged in" };

  const userId = (session.user as any).id as string;

  // Already a provider?
  const existing = await db
    .select({ id: serviceProviders.id })
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return { error: "You already have a provider account" };
  }

  const parsed = providerSchema.safeParse({
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
  });

  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = parsed.data;

  await db.insert(serviceProviders).values({
    userId,
    businessName: data.businessName,
    ownerName: data.ownerName,
    phoneNumber: data.phoneNumber,
    alternativePhone: data.alternativePhone || null,
    email: data.email || null,
    categoryId: data.categoryId,
    address: data.address,
    serviceArea: data.serviceArea,
    description: data.description,
    pricePerUnit: data.pricePerUnit.toFixed(2),
    priceDescription: data.priceDescription,
    maxCapacity: data.maxCapacity ?? null,
    verificationStatus: "pending",
  });

  // Upgrade user role
  await db
    .update(users)
    .set({ role: "PROVIDER" })
    .where(eq(users.id, userId));

  revalidatePath("/provider");
  revalidatePath("/dashboard");
  return { success: true };
}