import Link from "next/link";
import { db } from "@/lib/db";
import {
  users,
  blogPosts,
  galleryImages,
  serviceProviders,
  serviceReviews,
  serviceBookings,
  emergencyContacts,
  faqs,
  weatherInfo,
} from "@/lib/schema";
import { count, eq, and, desc } from "drizzle-orm";
import { formatLKR } from "@/lib/utils";

export default async function AdminDashboard() {
  const [
    [totalUsers],
    [providerUsers],
    [totalBlog],
    [pendingGallery],
    [pendingProviders],
    [pendingReviews],
    [openBookings],
    [completedBookings],
    [totalContacts],
    [totalFaqs],
    [recentWeather], // Destructures the first element directly as an object
  ] = await Promise.all([
    db.select({ c: count() }).from(users),
    db.select({ c: count() }).from(users).where(eq(users.role, "PROVIDER")),
    db.select({ c: count() }).from(blogPosts),
    db
      .select({ c: count() })
      .from(galleryImages)
      .where(eq(galleryImages.status, "pending")),
    db
      .select({ c: count() })
      .from(serviceProviders)
      .where(eq(serviceProviders.verificationStatus, "pending")),
    db
      .select({ c: count() })
      .from(serviceReviews)
      .where(eq(serviceReviews.isApproved, false)),
    db
      .select({ c: count() })
      .from(serviceBookings)
      .where(eq(serviceBookings.status, "pending")),
    db
      .select({ c: count() })
      .from(serviceBookings)
      .where(eq(serviceBookings.status, "completed")),
    db.select({ c: count() }).from(emergencyContacts),
    db.select({ c: count() }).from(faqs),
    db.select().from(weatherInfo).orderBy(desc(weatherInfo.date)).limit(1),
  ]);

  const alerts = [
    pendingProviders.c > 0 && {
      href: "/admin/providers",
      label: `${pendingProviders.c} provider${pendingProviders.c === 1 ? "" : "s"} awaiting verification`,
      tone: "yellow",
    },
    pendingReviews.c > 0 && {
      href: "/admin/reviews",
      label: `${pendingReviews.c} review${pendingReviews.c === 1 ? "" : "s"} awaiting approval`,
      tone: "yellow",
    },
    pendingGallery.c > 0 && {
      href: "/admin/gallery",
      label: `${pendingGallery.c} gallery photo${pendingGallery.c === 1 ? "" : "s"} pending`,
      tone: "yellow",
    },
    openBookings.c > 0 && {
      href: "/admin/bookings",
      label: `${openBookings.c} pending booking${openBookings.c === 1 ? "" : "s"}`,
      tone: "blue",
    },
  ].filter(Boolean) as { href: string; label: string; tone: string }[];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of the Narangala site.
        </p>
      </header>

      {alerts.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-500 uppercase">
            Needs your attention
          </h2>
          <ul className="space-y-2">
            {alerts.map((a, i) => (
              <li key={i}>
                <Link
                  href={a.href}
                  className={`block border rounded-lg p-3 text-sm hover:bg-gray-50 ${
                    a.tone === "yellow"
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-blue-300 bg-blue-50"
                  }`}
                >
                  ⚠️ {a.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-4">
        <Stat label="Total Users" value={totalUsers.c} />
        <Stat label="Providers" value={providerUsers.c} />
        <Stat label="Blog Posts" value={totalBlog.c} />
        <Stat label="Completed Bookings" value={completedBookings.c} />
        <Stat label="FAQs" value={totalFaqs.c} />
        <Stat label="Emergency Contacts" value={totalContacts.c} />
        <Stat label="Pending Providers" value={pendingProviders.c} tone="yellow" />
        <Stat label="Pending Reviews" value={pendingReviews.c} tone="yellow" />
      </section>

      {recentWeather && (
        <section className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Latest Weather Entry</h2>
          <div className="text-sm text-gray-700">
            <div className="font-medium">{recentWeather.date}</div>
            <div>
              {recentWeather.condition} · {recentWeather.temperatureCelsius}°C ·{" "}
              {recentWeather.humidityPercent}% humidity
            </div>
          </div>
          <Link
            href="/admin/content/weather"
            className="text-sm underline mt-2 inline-block"
          >
            Update weather →
          </Link>
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
  value: number;
  tone?: "yellow" | "blue" | "green";
}) {
  const tones = {
    yellow: "border-yellow-200 bg-yellow-50",
    blue: "border-blue-200 bg-blue-50",
    green: "border-green-200 bg-green-50",
  };
  return (
    <div className={`border rounded-lg p-4 ${tone ? tones[tone] : ""}`}>
      <div className="text-xs text-gray-600 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}