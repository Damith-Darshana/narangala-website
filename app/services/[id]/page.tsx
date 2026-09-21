import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { auth } from "@/lib/auth";
import { serviceBookings } from "@/lib/schema";
import { ReviewForm } from "@/components/review-form";
import { db } from "@/lib/db";
import {
  serviceProviders,
  serviceCategories,
  serviceImages,
  serviceReviews,
  users,
} from "@/lib/schema";
import { and, asc, desc, eq } from "drizzle-orm";
import { formatLKR } from "@/lib/utils";
import { r2Url } from "@/lib/r2-client";

export const revalidate = 60;

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [provider] = await db
    .select({
      p: serviceProviders,
      categoryName: serviceCategories.name,
      categoryIcon: serviceCategories.icon,
      categorySlug: serviceCategories.slug,
    })
    .from(serviceProviders)
    .innerJoin(
      serviceCategories,
      eq(serviceCategories.id, serviceProviders.categoryId)
    )
    .where(eq(serviceProviders.id, id))
    .limit(1);

  if (!provider) notFound();
  const p = provider.p;

  const images = await db
    .select()
    .from(serviceImages)
    .where(eq(serviceImages.providerId, id))
    .orderBy(asc(serviceImages.order));

  const reviews = await db
    .select({
      id: serviceReviews.id,
      rating: serviceReviews.rating,
      comment: serviceReviews.comment,
      providerResponse: serviceReviews.providerResponse,
      responseAt: serviceReviews.responseAt,
      createdAt: serviceReviews.createdAt,
      reviewerFirstName: users.firstName,
      reviewerLastName: users.lastName,
    })
    .from(serviceReviews)
    .innerJoin(users, eq(users.id, serviceReviews.userId))
    .where(
      and(
        eq(serviceReviews.providerId, id),
        eq(serviceReviews.isApproved, true)
      )
    )
    .orderBy(desc(serviceReviews.createdAt))
    .limit(20);

  const coverUrl = r2Url(p.coverImage);
  const profileUrl = r2Url(p.profileImage);
  const session = await auth();

  const userHasCompleted = session?.user
    ? (
        await db
          .select({ id: serviceBookings.id })
          .from(serviceBookings)
          .where(
            and(
              eq(serviceBookings.userId, (session.user as any).id),
              eq(serviceBookings.providerId, p.id),
              eq(serviceBookings.status, "completed")
            )
          )
          .limit(1)
      ).length > 0
    : false;

  const userAlreadyReviewed = session?.user
    ? (
        await db
          .select({ id: serviceReviews.id })
          .from(serviceReviews)
          .where(
            and(
              eq(serviceReviews.userId, (session.user as any).id),
              eq(serviceReviews.providerId, p.id)
            )
          )
          .limit(1)
      ).length > 0
    : false;

  return (
    <div className="space-y-8">
      <Link href="/services" className="text-sm underline">
        ← Back to services
      </Link>

      {/* Hero */}
      <header>
        {coverUrl && (
          <img
            src={coverUrl}
            alt={p.businessName}
            className="w-full h-56 object-cover rounded-lg bg-gray-100"
          />
        )}
        <div className="flex items-start gap-4 mt-4">
          {profileUrl && (
            <img
              src={profileUrl}
              alt={p.ownerName}
              className="w-16 h-16 rounded-full object-cover border"
            />
          )}
          <div className="flex-1">
            <div className="text-xs text-gray-500">
              {provider.categoryIcon} {provider.categoryName}
            </div>
            <h1 className="text-3xl font-bold mt-1">{p.businessName}</h1>
            <p className="text-gray-600 mt-1">by {p.ownerName}</p>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-amber-600">
                ⭐ {p.averageRating} ({p.totalReviews} reviews)
              </span>
              <span className="text-green-700">✓ Verified</span>
              {p.totalBookings > 0 && (
                <span className="text-gray-500">
                  {p.completedBookings}/{p.totalBookings} completed
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Info grid */}
      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          label="Price"
          value={formatLKR(p.pricePerUnit)}
          sub={p.priceDescription ?? ""}
        />
        <InfoCard
          label="Available"
          value={`${p.availableFrom}–${p.availableTo}`}
          sub={p.daysAvailable ?? ""}
        />
        <InfoCard
          label="Service Area"
          value={p.serviceArea ?? ""}
          sub={p.address}
        />
      </section>

      {/* Description */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">About</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{p.description}</p>
      </section>

      {/* Capabilities */}
      {(p.maxCapacity || p.currentInventory) && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Capacity</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {p.maxCapacity && <li>Max capacity: {p.maxCapacity}</li>}
            {p.currentInventory !== null && (
              <li>Available inventory: {p.currentInventory}</li>
            )}
          </ul>
        </section>
      )}

      {/* Image gallery */}
      {images.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-3">Photos</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {images.map((img) => {
              const url = r2Url(img.r2Key);
              if (!url) return null;
              return (
                <figure key={img.id} className="border rounded overflow-hidden">
                  <img
                    src={url}
                    alt={img.caption ?? ""}
                    className="w-full aspect-square object-cover bg-gray-100"
                    loading="lazy"
                  />
                  {img.caption && (
                    <figcaption className="text-xs text-gray-500 p-2">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="border rounded-lg p-4 bg-gray-50">
        <h2 className="text-2xl font-semibold mb-3">Contact</h2>
        <div className="space-y-2 text-sm">
          <div>
            📞{" "}
            <a href={`tel:${p.phoneNumber}`} className="underline">
              {p.phoneNumber}
            </a>
            {p.alternativePhone && (
              <>
                {" "}
                ·{" "}
                <a href={`tel:${p.alternativePhone}`} className="underline">
                  {p.alternativePhone}
                </a>
              </>
            )}
          </div>
          {p.email && (
            <div>
              ✉️{" "}
              <a href={`mailto:${p.email}`} className="underline">
                {p.email}
              </a>
            </div>
          )}
          <div>📍 {p.address}</div>
        </div>

        <div className="mt-4 pt-4 border-t">
          {session?.user ? (
            <BookingForm
              providerId={p.id}
              pricePerUnit={p.pricePerUnit}
              priceDescription={p.priceDescription}
              maxCapacity={p.maxCapacity}
              serviceType={provider.categorySlug}
            />
          ) : (
            <p className="text-sm text-gray-600">
              <a href="/login" className="underline font-medium">
                Log in
              </a>{" "}
              to request a booking.
            </p>
          )}
        </div>
      </section>

      {/* Reviews */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">
          Reviews ({p.totalReviews})
        </h2>

        {session?.user && userHasCompleted && !userAlreadyReviewed && (
          <div className="mb-4">
            <ReviewForm providerId={p.id} />
          </div>
        )}
        {session?.user && userHasCompleted && userAlreadyReviewed && (
          <p className="text-sm text-gray-500 mb-4">
            ✓ You've already submitted a review for this provider.
          </p>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No approved reviews yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {r.reviewerFirstName} {r.reviewerLastName}
                  </span>
                  <span className="text-amber-600">
                    {"⭐".repeat(r.rating)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {r.comment}
                </p>
                {r.providerResponse && (
                  <div className="mt-3 border-l-4 border-blue-300 pl-3 text-sm text-gray-600">
                    <div className="font-medium">Provider response:</div>
                    <p className="whitespace-pre-wrap">{r.providerResponse}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function InfoCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-lg font-semibold mt-1">{value || "—"}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}