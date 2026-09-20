import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { serviceAvailability, serviceProviders } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import { blockDate, unblockDate } from "@/actions/availability-actions";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const [provider] = await db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (!provider) redirect("/provider/register");

  const blocked = await db
    .select()
    .from(serviceAvailability)
    .where(eq(serviceAvailability.providerId, provider.id))
    .orderBy(asc(serviceAvailability.date));

  return (
    <div className="space-y-6 max-w-2xl">
      <header className="flex justify-between items-baseline">
        <h1 className="text-2xl font-bold">Availability</h1>
        <Link href="/provider" className="text-sm underline">
          ← Dashboard
        </Link>
      </header>

      <p className="text-sm text-gray-600">
        Block specific dates when you cannot take bookings (holidays, personal
        days, fully booked). Users will be prevented from booking on these
        dates.
      </p>

      <form action={blockDate} className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold">Block a date</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              name="reason"
              placeholder="e.g., Fully booked"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
        >
          Block date
        </button>
      </form>

      <section>
        <h2 className="font-semibold mb-3">
          Blocked dates ({blocked.length})
        </h2>
        {blocked.length === 0 ? (
          <p className="text-sm text-gray-500">
            No blocked dates. You're available every day.
          </p>
        ) : (
          <ul className="space-y-2">
            {blocked.map((b) => (
              <li
                key={b.id}
                className="border rounded p-3 flex items-center justify-between text-sm"
              >
                <div>
                  <div className="font-medium">{b.date}</div>
                  {b.reason && (
                    <div className="text-xs text-gray-500">{b.reason}</div>
                  )}
                </div>
                <form action={unblockDate}>
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}