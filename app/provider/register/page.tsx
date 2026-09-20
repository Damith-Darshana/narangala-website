import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveCategories } from "@/lib/services-helpers";
import { db } from "@/lib/db";
import { serviceProviders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { ProviderRegisterForm } from "@/components/provider-register-form";

export default async function ProviderRegisterPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const existing = await db
    .select({ id: serviceProviders.id })
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (existing.length > 0) redirect("/provider");

  const categories = await getActiveCategories();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Become a Service Provider</h1>
        <p className="text-gray-600 mt-1">
          List your tuk-tuk, guiding, gear rental, food, or accommodation
          service. Applications are reviewed by an admin before appearing
          publicly.
        </p>
      </header>
      <ProviderRegisterForm categories={categories} />
    </div>
  );
}