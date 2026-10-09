import Link from "next/link";
import { db } from "@/lib/db";
import { serviceProviders, serviceCategories } from "@/lib/schema";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";
import { getActiveCategories } from "@/lib/services-helpers";
import {formatLKR} from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Local Services",
  description:
    "Tuk-tuks, guides, camping gear, food, and accommodation near the Narangala trailhead in Keenakele, Badulla.",
};


export const revalidate = 60;

type SearchParams = Promise<{
  category?: string;
  search?: string;
  sort?: string;
}>;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, search, sort } = await searchParams;
  const categories = await getActiveCategories();

  const conditions = [
    eq(serviceProviders.verificationStatus, "verified"),
    eq(serviceProviders.isAvailable, true),
  ];

  if (category) {
    const cat = categories.find((c) => c.slug === category);
    if (cat) {
      conditions.push(eq(serviceProviders.categoryId, cat.id));
    }
  }

  if (search) {
    conditions.push(
      or(
        ilike(serviceProviders.businessName, `%${search}%`),
        ilike(serviceProviders.description, `%${search}%`),
        ilike(serviceProviders.ownerName, `%${search}%`)
      )!
    );
  }

  const orderBy =
    sort === "rating"
      ? desc(serviceProviders.averageRating)
      : sort === "price"
        ? asc(serviceProviders.pricePerUnit)
        : desc(serviceProviders.averageRating);

  const providers = await db
    .select({
      id: serviceProviders.id,
      businessName: serviceProviders.businessName,
      ownerName: serviceProviders.ownerName,
      description: serviceProviders.description,
      pricePerUnit: serviceProviders.pricePerUnit,
      priceDescription: serviceProviders.priceDescription,
      averageRating: serviceProviders.averageRating,
      totalReviews: serviceProviders.totalReviews,
      serviceArea: serviceProviders.serviceArea,
      profileImage: serviceProviders.profileImage,
      categoryName: serviceCategories.name,
      categorySlug: serviceCategories.slug,
      categoryIcon: serviceCategories.icon,
    })
    .from(serviceProviders)
    .innerJoin(
      serviceCategories,
      eq(serviceCategories.id, serviceProviders.categoryId)
    )
    .where(and(...conditions))
    .orderBy(orderBy);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Local Services</h1>
        <p className="text-gray-600 mt-1">
          Trusted tuk-tuks, guides, gear rentals, and food near Narangala
          trailhead.
        </p>
      </header>

      {/* Filters */}
      <div className="border rounded-lg p-4 space-y-4">
        <form className="grid gap-3 md:grid-cols-3">
          <input
            type="text"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Search providers..."
            className="border rounded px-3 py-2"
          />
          <select
            name="category"
            defaultValue={category ?? ""}
            className="border rounded px-3 py-2"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={sort ?? "rating"}
            className="border rounded px-3 py-2"
          >
            <option value="rating">Sort: Top rated</option>
            <option value="price">Sort: Lowest price</option>
          </select>
          <button
            type="submit"
            className="md:col-span-3 bg-black text-white py-2 rounded hover:bg-gray-800"
          >
            Apply filters
          </button>
        </form>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <Link
            href="/services"
            className={`text-sm px-3 py-1 rounded-full border ${
              !category ? "bg-black text-white" : "hover:bg-gray-50"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/services?category=${c.slug}`}
              className={`text-sm px-3 py-1 rounded-full border ${
                category === c.slug ? "bg-black text-white" : "hover:bg-gray-50"
              }`}
            >
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Providers */}
      {providers.length === 0 ? (
        <p className="text-gray-500">No providers match your filters.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {providers.map((p) => (
            <Link
              key={p.id}
              href={`/services/${p.id}`}
              className="border rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      {p.categoryIcon} {p.categoryName}
                    </span>
                  </div>
                  <h2 className="font-semibold text-lg mt-1">
                    {p.businessName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {p.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="flex items-center gap-1 text-amber-600">
                  ⭐ {p.averageRating}{" "}
                  <span className="text-gray-500">
                    ({p.totalReviews} reviews)
                  </span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {formatLKR(p.pricePerUnit)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.priceDescription}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                📍 {p.serviceArea}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}