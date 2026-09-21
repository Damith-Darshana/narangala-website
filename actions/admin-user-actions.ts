"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateUserRole(formData: FormData) {
  const session = await requireAdmin();
  const id = formData.get("id") as string;
  const role = formData.get("role") as string;

  if (!["TOURIST", "PROVIDER", "ADMIN"].includes(role)) {
    throw new Error("Invalid role");
  }

  // Prevent self-demotion (avoid locking yourself out)
  if (id === (session.user as any).id && role !== "ADMIN") {
    throw new Error("You cannot change your own admin role");
  }

  await db.update(users).set({ role }).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function toggleUserStatus(formData: FormData) {
  const session = await requireAdmin();
  const id = formData.get("id") as string;

  if (id === (session.user as any).id) {
    throw new Error("You cannot deactivate your own account");
  }

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) throw new Error("User not found");

  await db
    .update(users)
    .set({ isActive: !user.isActive })
    .where(eq(users.id, id));

  revalidatePath("/admin/users");
}