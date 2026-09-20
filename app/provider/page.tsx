import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  serviceProviders,
  serviceBookings,
  serviceCategories,
  serviceReviews,
} from "@/lib/schema";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { formatLKR } from "@/lib/services-helpers";

export default async function ProviderDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

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
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (!row) redirect("/provider/register");
  const p = row.p;

  const [pending] = await db
    .select({ c: count() })
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.providerId, p.id),
        eq(serviceBookings.status, "pending")
      )
    );

  const [confirmed] = await db
    .select({ c: count() })
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.providerId, p.id),
        eq(serviceBookings.status, "confirmed")
      )
    );

  const [completed] = await db
    .select({ c: count() })
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.providerId, p.id),
        eq(serviceBookings.status, "completed")
      )
    );

  const [revenue] = await db
    .select({
      total: sql<string>`coalesce(sum(${serviceBookings.totalAmount}), 0)`,
    })
    .from(serviceBookings)
    .where(
      and(
        eq(serviceBookings.providerId, p.id),
        eq(serviceBookings.status, "completed")
      )
    );

  const [unapprovedReviews] = await db
    .select({ c: count() })
    .from(serviceReviews)
    .where(
      and(
        eq(serviceReviews.providerId, p.id),
        eq(serviceReviews.isApproved, false)
      )
    );

  const recentBookings = await db
    .select()
    .from(serviceBookings)
    .where(eq(serviceBookings.providerId, p.id))
    .orderBy(desc(serviceBookings.requestedAt))
    .limit(5);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs text-gray-500">
            {row.categoryIcon} {row.categoryName}
          </div>
          <h1 className="text-3xl font-bold mt-1">{p.businessName}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm">
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                p.verificationStatus === "verified"
                  ? "bg-green-100 text-green-800"
                  : p.verificationStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {p.verificationStatus}
            </span>
            <span className="text-amber-600">
              ⭐ {p.averageRating} ({p.totalReviews})
            </span>
          </div>
        </div>
        <Link
          href={`/services/${p.id}`}
          className="text-sm underline shrink-0"
        >
          View public page →
        </Link>
      </header>

      {p.verificationStatus !== "verified" && (
        <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 text-sm">
          Your account is not yet verified. Bookings you receive will appear
          here, but the public listing won't show until an admin approves you.
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Pending" value={pending?.c ?? 0} tone="yellow" />
        <Stat label="Confirmed" value={confirmed?.c ?? 0} tone="blue" />
        <Stat label="Completed" value={completed?.c ?? 0} tone="green" />
        <Stat label="Revenue" value={formatLKR(revenue?.total ?? "0")} />
      </section>

      <nav className="grid gap-3 md:grid-cols-3">
        <Link
          href="/provider/bookings"
          className="border rounded-lg p-4 hover:bg-gray-50"
        >
          <div className="font-semibold">Manage Bookings</div>
          <div className="text-sm text-gray-500 mt-1">
            Accept, complete, or cancel
          </div>
        </Link>
        <Link
          href="/provider/availability"
          className="border rounded-lg p-4 hover:bg-gray-50"
        >
          <div className="font-semibold">Availability</div>
          <div className="text-sm text-gray-500 mt-1">
            Block dates you're unavailable
          </div>
        </Link>
        <Link
          href="/provider/reviews"
          className="border rounded-lg p-4 hover:bg-gray-50"
        >
          <div className="font-semibold">Reviews</div>
          <div className="text-sm text-gray-500 mt-1">
            {unapprovedReviews?.c ?? 0} awaiting moderation
          </div>
        </Link>
      </nav>

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
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "yellow" | "blue" | "green";
}) {
  const tones = {
    yellow: "border-yellow-200 bg-yellow-50",
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
  };
  return (
    <div
      className={`border rounded-lg p-4 ${tone ? tones[tone] : ""}`}
    >
      <div className="text-xs text-gray-600 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}