import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  serviceBookings,
  serviceProviders,
  users,
} from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_STYLES,
  formatLKR,
} from "@/lib/services-helpers";
import { updateBookingStatus } from "@/actions/booking-actions";

export default async function ProviderBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const [provider] = await db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (!provider) redirect("/provider/register");

  const bookings = await db
    .select({
      b: serviceBookings,
      customerFirstName: users.firstName,
      customerLastName: users.lastName,
      customerEmail: users.email,
      customerPhone: users.phoneNumber,
    })
    .from(serviceBookings)
    .innerJoin(users, eq(users.id, serviceBookings.userId))
    .where(eq(serviceBookings.providerId, provider.id))
    .orderBy(desc(serviceBookings.requestedAt));

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-baseline">
        <h1 className="text-2xl font-bold">Bookings</h1>
        <Link href="/provider" className="text-sm underline">
          ← Dashboard
        </Link>
      </header>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings yet.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map(
            ({
              b,
              customerFirstName,
              customerLastName,
              customerEmail,
              customerPhone,
            }) => (
              <li key={b.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-mono text-xs text-gray-500">
                      {b.bookingId}
                    </div>
                    <div className="font-semibold mt-1">
                      {customerFirstName} {customerLastName}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      ✉️ {customerEmail}
                      {customerPhone && <> · 📞 {customerPhone}</>}
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      📅 {b.bookingDate} at {b.bookingTime}
                    </div>
                    {b.userNotes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="text-gray-500">Notes:</span>{" "}
                        {b.userNotes}
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
                    <div className="font-semibold">
                      {formatLKR(b.totalAmount)}
                    </div>
                  </div>
                </div>

                {b.status === "pending" && (
                  <div className="mt-4 pt-3 border-t flex gap-2">
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="confirmed" />
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                      >
                        Confirm
                      </button>
                    </form>
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <input
                        type="hidden"
                        name="status"
                        value="cancelled_by_provider"
                      />
                      <button
                        type="submit"
                        className="border border-red-500 text-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-50"
                      >
                        Decline
                      </button>
                    </form>
                  </div>
                )}

                {b.status === "confirmed" && (
                  <div className="mt-4 pt-3 border-t flex gap-2">
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="completed" />
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                      >
                        Mark completed
                      </button>
                    </form>
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={b.id} />
                      <input type="hidden" name="status" value="no_show" />
                      <button
                        type="submit"
                        className="border px-3 py-1.5 rounded text-sm hover:bg-gray-50"
                      >
                        Mark no-show
                      </button>
                    </form>
                  </div>
                )}
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}