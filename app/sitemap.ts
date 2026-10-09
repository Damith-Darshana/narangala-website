import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { blogPosts, serviceProviders } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://narangala.pages.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    { url: "", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/trail", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/weather", priority: 0.7, changeFrequency: "daily" as const },
    { url: "/gallery", priority: 0.7, changeFrequency: "weekly" as const },
    { url: "/services", priority: 0.8, changeFrequency: "weekly" as const },
    { url: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/emergency", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/blog", priority: 0.8, changeFrequency: "weekly" as const },
  ].map((p) => ({
    url: `${BASE_URL}${p.url}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const posts = await db
    .select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt })
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true));

  const postPages = posts.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const providers = await db
    .select({ id: serviceProviders.id, updatedAt: serviceProviders.updatedAt })
    .from(serviceProviders)
    .where(
      and(
        eq(serviceProviders.verificationStatus, "verified"),
        eq(serviceProviders.isAvailable, true)
      )
    );

  const providerPages = providers.map((p) => ({
    url: `${BASE_URL}/services/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...providerPages];
}