import Link from "next/link";
import { db } from "@/lib/db";
import { serviceProviders, serviceCategories } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { formatLKR } from "@/lib/utils";

type SearchParams = Promise<{ verification?: string }>;

const TABS = ["pending", "verified", "rejected", "suspended", "all"];

export default async function AdminProvidersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { verification } = await searchParams;
  const filter = verification ?? "pending";

  const baseQuery = db
    .select({
      p: serviceProviders,
      categoryName: serviceCategories.name,
      categoryIcon: serviceCategories.icon,
    })
    .from(serviceProviders)
    .innerJoin(
      serviceCategories,
      eq(serviceCategories.id, serviceProviders.categoryId)
    )
    .orderBy(desc(serviceProviders.createdAt));

  const providers =
    filter === "all"
      ? await baseQuery
      : await baseQuery.where(eq(serviceProviders.verificationStatus, filter));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Providers</h1>
        <p className="text-gray-600 mt-1">
          Verify, reject, or edit service provider applications.
        </p>
      </header>

      <div className="flex gap-2 border-b overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/providers?verification=${t}`}
            className={`px-3 py-2 text-sm capitalize border-b-2 -mb-px whitespace-nowrap ${
              filter === t
                ? "border-black text-black font-medium"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {providers.length === 0 ? (
        <p className="text-gray-500">No {filter} providers.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium">Business</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Owner</th>
                <th className="text-left p-3 font-medium">Phone</th>
                <th className="text-left p-3 font-medium">Price</th>
                <th className="text-left p-3 font-medium">Rating</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(({ p, categoryName, categoryIcon }) => (
                <tr key={p.id} className="border-b last:border-b-0">
                  <td className="p-3 font-medium">{p.businessName}</td>
                  <td className="p-3 text-gray-600">
                    {categoryIcon} {categoryName}
                  </td>
                  <td className="p-3 text-gray-600">{p.ownerName}</td>
                  <td className="p-3 text-gray-600">{p.phoneNumber}</td>
                  <td className="p-3">{formatLKR(p.pricePerUnit)}</td>
                  <td className="p-3">
                    ⭐ {p.averageRating} ({p.totalReviews})
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        p.verificationStatus === "verified"
                          ? "bg-green-100 text-green-800"
                          : p.verificationStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : p.verificationStatus === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {p.verificationStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-3 whitespace-nowrap">
                    <Link
                      href={`/services/${p.id}`}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/providers/${p.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}