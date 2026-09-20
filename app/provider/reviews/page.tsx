import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { serviceProviders, serviceReviews, users } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { respondToReview } from "@/actions/review-actions";

export default async function ProviderReviewsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const [provider] = await db
    .select()
    .from(serviceProviders)
    .where(eq(serviceProviders.userId, userId))
    .limit(1);

  if (!provider) redirect("/provider/register");

  const reviews = await db
    .select({
      r: serviceReviews,
      customerFirstName: users.firstName,
      customerLastName: users.lastName,
    })
    .from(serviceReviews)
    .innerJoin(users, eq(users.id, serviceReviews.userId))
    .where(eq(serviceReviews.providerId, provider.id))
    .orderBy(desc(serviceReviews.createdAt));

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-baseline">
        <h1 className="text-2xl font-bold">Reviews</h1>
        <Link href="/provider" className="text-sm underline">
          ← Dashboard
        </Link>
      </header>

      <p className="text-sm text-gray-600">
        Reviews appear publicly only after admin moderation. You can respond to
        any review — your response is shown below the review.
      </p>

      {reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.map(({ r, customerFirstName, customerLastName }) => (
            <li key={r.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium">
                    {customerFirstName} {customerLastName}
                  </div>
                  <div className="text-amber-600 text-sm">
                    {"⭐".repeat(r.rating)}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    r.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {r.isApproved ? "Approved" : "Pending moderation"}
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                {r.comment}
              </p>

              {r.providerResponse ? (
                <div className="mt-3 border-l-4 border-blue-300 pl-3 bg-blue-50 p-3 rounded">
                  <div className="text-xs text-gray-500 mb-1">
                    Your response
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {r.providerResponse}
                  </p>
                </div>
              ) : (
                <form
                  action={respondToReview}
                  className="mt-3 space-y-2 border-t pt-3"
                >
                  <input type="hidden" name="id" value={r.id} />
                  <textarea
                    name="response"
                    required
                    rows={2}
                    placeholder="Write a public response..."
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className="text-sm bg-black text-white px-3 py-1.5 rounded hover:bg-gray-800"
                  >
                    Post response
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