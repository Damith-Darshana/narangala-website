"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { serviceCategories, serviceProviders } from "@/lib/schema";
import { count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const catSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with dashes"),
  icon: z.string().max(50).default(""),
  description: z.string().max(1000).default(""),
  order: z.coerce.number().int().default(0),
});

export async function createCategory(
  _prev: { error?: string },
  formData: FormData
) {
  await requireAdmin();

  const parsed = catSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || slugify(formData.get("name") as string),
    icon: formData.get("icon") ?? "",
    description: formData.get("description") ?? "",
    order: formData.get("order") ?? 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const exists = await db
    .select({ id: serviceCategories.id })
    .from(serviceCategories)
    .where(eq(serviceCategories.slug, parsed.data.slug))
    .limit(1);
  if (exists.length > 0) return { error: "A category with this slug exists" };

  await db.insert(serviceCategories).values(parsed.data);
  revalidatePath("/admin/categories");
  revalidatePath("/services");
  return {};
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  const parsed = catSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    icon: formData.get("icon") ?? "",
    description: formData.get("description") ?? "",
    order: formData.get("order") ?? 0,
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  await db
    .update(serviceCategories)
    .set(parsed.data)
    .where(eq(serviceCategories.id, id));

  revalidatePath("/admin/categories");
  revalidatePath("/services");
}

export async function toggleCategoryActive(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  const [row] = await db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.id, id))
    .limit(1);
  if (!row) return;

  await db
    .update(serviceCategories)
    .set({ isActive: !row.isActive })
    .where(eq(serviceCategories.id, id));

  revalidatePath("/admin/categories");
  revalidatePath("/services");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;

  // Refuse if providers are using it
  const [usage] = await db
    .select({ c: count() })
    .from(serviceProviders)
    .where(eq(serviceProviders.categoryId, id));

  if (Number(usage?.c ?? 0) > 0) {
    throw new Error(
      "Cannot delete — providers are assigned to this category. Reassign them first."
    );
  }

  await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
  revalidatePath("/admin/categories");
  revalidatePath("/services");
}