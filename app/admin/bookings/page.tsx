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
} from "@/lib/utils";
import {
  adminCancelBooking,
  adminMarkCompleted,
} from "@/actions/admin-booking-actions";

type SearchParams = Promise<{ status?: string }>;

const TABS = ["pending", "confirmed", "completed", "cancelled_by_user", "cancelled_by_provider", "all"];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const filter = status ?? "pending";

  const base = db
    .select({
      b: serviceBookings,
      providerName: serviceProviders.businessName,
      providerId: serviceProviders.id,
      customerFirstName: users.firstName,
      customerLastName: users.lastName,
      customerEmail: users.email,
      customerPhone: users.phoneNumber,
    })
    .from(serviceBookings)
    .innerJoin(
      serviceProviders,
      eq(serviceProviders.id, serviceBookings.providerId)
    )
    .innerJoin(users, eq(users.id, serviceBookings.userId))
    .orderBy(desc(serviceBookings.requestedAt));

  const bookings =
    filter === "all"
      ? await base
      : await base.where(eq(serviceBookings.status, filter));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">All Bookings</h1>
        <p className="text-gray-600 mt-1">
          Oversight of every booking across the platform.
        </p>
      </header>

      <div className="flex gap-2 border-b overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/bookings?status=${t}`}
            className={`px-3 py-2 text-sm border-b-2 -mb-px whitespace-nowrap ${
              filter === t
                ? "border-black text-black font-medium"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {BOOKING_STATUS_LABELS[t] ?? t}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings in this status.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map(
            ({
              b,
              providerName,
              providerId,
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
                    <div className="text-sm text-gray-600">
                      ✉️ {customerEmail}
                      {customerPhone && <> · 📞 {customerPhone}</>}
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      📅 {b.bookingDate} at {b.bookingTime} ·{" "}
                      <Link
                        href={`/services/${providerId}`}
                        className="underline"
                      >
                        {providerName}
                      </Link>
                    </div>
                    {b.userNotes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="text-gray-500">Notes:</span>{" "}
                        {b.userNotes}
                      </p>
                    )}
                    {b.cancellationReason && (
                      <p className="text-sm text-red-600 mt-2">
                        Cancelled: {b.cancellationReason} (by {b.cancelledBy})
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

                {["pending", "confirmed"].includes(b.status) && (
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    {b.status === "confirmed" && (
                      <form action={adminMarkCompleted}>
                        <input type="hidden" name="id" value={b.id} />
                        <button className="text-sm text-blue-700 hover:underline">
                          Mark completed
                        </button>
                      </form>
                    )}
                    <form
                      action={adminCancelBooking}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={b.id} />
                      <input
                        name="reason"
                        placeholder="Cancellation reason"
                        className="border rounded px-2 py-1 text-xs"
                      />
                      <button className="text-sm text-red-600 hover:underline">
                        Cancel booking
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