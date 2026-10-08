import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  serviceProviders,
  serviceCategories,
  serviceBookings,
  serviceReviews,
  users,
} from "@/lib/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { formatLKR } from "@/lib/utils";
import {
  moderateProvider,
  updateProviderAdmin,
  deleteProvider,
} from "@/actions/admin-provider-actions";
import { ProviderEditForm } from "@/components/admin/provider-edit-form";

export default async function AdminProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [row] = await db
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
    .where(eq(serviceProviders.id, id))
    .limit(1);

  if (!row) notFound();
  const p = row.p;

  const categories = await db
    .select()
    .from(serviceCategories)
    .orderBy(serviceCategories.order);

  const [linkUser] = p.userId
    ? await db.select().from(users).where(eq(users.id, p.userId)).limit(1)
    : [];

  const [bookingStats] = await db
    .select({
      total: count(),
      completed: sql<number>`sum(case when ${serviceBookings.status} = 'completed' then 1 else 0 end)`,
    })
    .from(serviceBookings)
    .where(eq(serviceBookings.providerId, id));

  const [reviewStats] = await db
    .select({
      total: count(),
      pending: sql<number>`sum(case when ${serviceReviews.isApproved} = false then 1 else 0 end)`,
    })
    .from(serviceReviews)
    .where(eq(serviceReviews.providerId, id));

  const recentBookings = await db
    .select()
    .from(serviceBookings)
    .where(eq(serviceBookings.providerId, id))
    .orderBy(desc(serviceBookings.requestedAt))
    .limit(5);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/providers" className="text-sm underline">
            ← Providers
          </Link>
          <div className="text-xs text-gray-500 mt-2">
            {row.categoryIcon} {row.categoryName}
          </div>
          <h1 className="text-2xl font-bold mt-1">{p.businessName}</h1>
          <p className="text-gray-600">Owner: {p.ownerName}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/services/${p.id}`}
            className="border px-3 py-1.5 rounded text-sm hover:bg-gray-50"
          >
            Public page
          </Link>
        </div>
      </header>

      {/* Verification panel */}
      <section className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Current status:</span>
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
          {p.verifiedAt && (
            <span className="text-xs text-gray-500">
              verified {new Date(p.verifiedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {p.verificationStatus !== "verified" && (
            <form action={moderateProvider}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="action" value="verify" />
              <button className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700">
                Approve
              </button>
            </form>
          )}
          {p.verificationStatus !== "rejected" && (
            <form action={moderateProvider}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="action" value="reject" />
              <button className="border border-red-500 text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-50">
                Reject
              </button>
            </form>
          )}
          {p.verificationStatus === "verified" && (
            <form action={moderateProvider}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="action" value="suspend" />
              <button className="border px-3 py-1.5 rounded text-sm hover:bg-gray-50">
                Suspend
              </button>
            </form>
          )}
          {p.verificationStatus === "suspended" && (
            <form action={moderateProvider}>
              <input type="hidden" name="id" value={p.id} />
              <input type="hidden" name="action" value="reinstate" />
              <button className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
                Reinstate
              </button>
            </form>
          )}
        </div>

        <form action={moderateProvider} className="flex gap-2 pt-3 border-t">
          <input type="hidden" name="id" value={p.id} />
          <input type="hidden" name="action" value="verify" />
          <input
            name="notes"
            placeholder="Optional notes (for internal record)"
            defaultValue={p.verificationNotes ?? ""}
            className="flex-1 border rounded px-3 py-1.5 text-sm"
          />
        </form>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Total bookings" value={bookingStats?.total ?? 0} />
        <Stat label="Completed" value={bookingStats?.completed ?? 0} />
        <Stat label="Reviews" value={reviewStats?.total ?? 0} />
        <Stat
          label="Pending reviews"
          value={reviewStats?.pending ?? 0}
          tone="yellow"
        />
      </section>

      {/* Linked user account */}
      {linkUser && (
        <section className="border rounded-lg p-4 text-sm">
          <h2 className="font-semibold mb-2">Linked User Account</h2>
          <div className="text-gray-700">
            {linkUser.firstName} {linkUser.lastName} · {linkUser.email}
          </div>
          <Link
            href={`/admin/users`}
            className="text-xs underline mt-1 inline-block"
          >
            Manage users →
          </Link>
        </section>
      )}

      {/* Edit form */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Edit Details</h2>
        <ProviderEditForm provider={p} categories={categories} />
      </section>

      {/* Recent bookings */}
      {recentBookings.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Recent bookings</h2>
          <ul className="space-y-2">
            {recentBookings.map((b) => (
              <li
                key={b.id}
                className="border rounded p-3 flex justify-between text-sm"
              >
                <span className="font-mono">{b.bookingId}</span>
                <span className="text-gray-500">
                  {b.bookingDate} · {b.bookingTime}
                </span>
                <span>{formatLKR(b.totalAmount)}</span>
                <span className="capitalize">{b.status.replace(/_/g, " ")}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Danger zone */}
      <section className="border border-red-200 rounded-lg p-4">
        <h2 className="font-semibold text-red-800">Danger Zone</h2>
        <p className="text-sm text-gray-600 mt-1 mb-3">
          Deleting a provider removes all their images, pricing, availability,
          and reviews. Bookings associated with them are also deleted.
        </p>
        <form action={deleteProvider}>
          <input type="hidden" name="id" value={p.id} />
          <button
            type="submit"
            className="border border-red-500 text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-50"
          >
            Delete provider permanently
          </button>
        </form>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "yellow";
}) {
  return (
    <div
      className={`border rounded-lg p-4 ${tone === "yellow" ? "bg-yellow-50 border-yellow-200" : ""}`}
    >
      <div className="text-xs text-gray-600 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}