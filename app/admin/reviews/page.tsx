import Link from "next/link";
import { db } from "@/lib/db";
import { serviceReviews, serviceProviders, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import {
  approveReview,
  rejectReview,
  deleteReview,
} from "@/actions/admin-review-actions";

type SearchParams = Promise<{ status?: string }>;

const TABS = ["pending", "approved", "all"];

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { status } = await searchParams;
  const filter = status ?? "pending";

  const base = db
    .select({
      r: serviceReviews,
      providerName: serviceProviders.businessName,
      providerId: serviceProviders.id,
      reviewerFirstName: users.firstName,
      reviewerLastName: users.lastName,
      reviewerEmail: users.email,
    })
    .from(serviceReviews)
    .innerJoin(
      serviceProviders,
      eq(serviceProviders.id, serviceReviews.providerId)
    )
    .innerJoin(users, eq(users.id, serviceReviews.userId))
    .orderBy(desc(serviceReviews.createdAt));

  const reviews =
    filter === "pending"
      ? await base.where(eq(serviceReviews.isApproved, false))
      : filter === "approved"
        ? await base.where(eq(serviceReviews.isApproved, true))
        : await base;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-gray-600 mt-1">
          Approved reviews update the provider's public rating.
        </p>
      </header>

      <div className="flex gap-2 border-b">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/admin/reviews?status=${t}`}
            className={`px-3 py-2 text-sm capitalize border-b-2 -mb-px ${
              filter === t
                ? "border-black text-black font-medium"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <p className="text-gray-500">No {filter} reviews.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map(({ r, providerName, providerId, reviewerFirstName, reviewerLastName, reviewerEmail }) => (
            <li key={r.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={`/services/${providerId}`}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    For: {providerName}
                  </Link>
                  <div className="font-medium mt-1">
                    {reviewerFirstName} {reviewerLastName}{" "}
                    <span className="text-gray-500 text-sm font-normal">
                      ({reviewerEmail})
                    </span>
                  </div>
                  <div className="text-amber-600 text-sm mt-1">
                    {"⭐".repeat(r.rating)}
                  </div>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                    {r.comment}
                  </p>
                  {r.providerResponse && (
                    <div className="mt-3 border-l-4 border-blue-300 pl-3 text-sm">
                      <div className="text-xs text-gray-500">
                        Provider response
                      </div>
                      <p className="whitespace-pre-wrap">
                        {r.providerResponse}
                      </p>
                    </div>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                    r.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {r.isApproved ? "Approved" : "Pending"}
                </span>
              </div>

              <div className="flex gap-3 mt-4 pt-3 border-t text-sm">
                {!r.isApproved && (
                  <form action={approveReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-green-700 hover:underline">
                      Approve
                    </button>
                  </form>
                )}
                {r.isApproved && (
                  <form action={rejectReview}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="text-yellow-700 hover:underline">
                      Unapprove
                    </button>
                  </form>
                )}
                <form action={deleteReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}