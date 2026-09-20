import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  serviceBookings,
  serviceProviders,
  serviceCategories,
} from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  formatLKR,
} from "@/lib/services-helpers";
import { cancelBooking } from "@/actions/booking-actions";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const bookings = await db
    .select({
      b: serviceBookings,
      providerName: serviceProviders.businessName,
      providerId: serviceProviders.id,
      categoryName: serviceCategories.name,
      categoryIcon: serviceCategories.icon,
    })
    .from(serviceBookings)
    .innerJoin(
      serviceProviders,
      eq(serviceProviders.id, serviceBookings.providerId)
    )
    .innerJoin(
      serviceCategories,
      eq(serviceCategories.id, serviceProviders.categoryId)
    )
    .where(eq(serviceBookings.userId, userId))
    .orderBy(desc(serviceBookings.requestedAt));

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-baseline">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <Link href="/services" className="text-sm underline">
          Browse services →
        </Link>
      </header>

      {bookings.length === 0 ? (
        <p className="text-gray-500">
          You have no bookings yet.{" "}
          <Link href="/services" className="underline">
            Find a service
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {bookings.map(({ b, providerName, providerId, categoryName, categoryIcon }) => (
            <li key={b.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-500">
                    {categoryIcon} {categoryName}
                  </div>
                  <Link
                    href={`/services/${providerId}`}
                    className="font-semibold hover:underline"
                  >
                    {providerName}
                  </Link>
                  <div className="text-sm text-gray-600 mt-1">
                    📅 {b.bookingDate} at {b.bookingTime}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Booking ID: <span className="font-mono">{b.bookingId}</span>
                  </div>
                  {b.userNotes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="text-gray-500">Notes:</span> {b.userNotes}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded ${
                      BOOKING_STATUS_STYLES[b.status] ?? "bg-gray-100"
                    }`}
                  >
                    {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                  </span>
                  <div className="font-semibold text-sm">
                    {formatLKR(b.totalAmount)}
                  </div>
                </div>
              </div>

              {["pending", "confirmed"].includes(b.status) && (
                <form action={cancelBooking} className="mt-4 pt-3 border-t">
                  <input type="hidden" name="id" value={b.id} />
                  <input
                    type="text"
                    name="reason"
                    placeholder="Reason for cancellation (optional)"
                    className="border rounded px-2 py-1 text-sm w-full md:w-64"
                  />
                  <button
                    type="submit"
                    className="ml-2 text-sm text-red-600 hover:underline"
                  >
                    Cancel booking
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}