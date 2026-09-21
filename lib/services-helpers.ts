import { db } from "@/lib/db";
import { serviceCategories } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";

export async function getActiveCategories() {
  return db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.isActive, true))
    .orderBy(asc(serviceCategories.order));
}


