"use server";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  mountainInfo,
  trailInfo,
  trailWaypoints,
  weatherInfo,
  faqs,
  emergencyContacts,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ================ MOUNTAIN INFO ================
const mountainSchema = z.object({
  name: z.string().min(2).max(100),
  tamilName: z.string().max(100).optional().default(""),
  sinhalaName: z.string().max(100).optional().default(""),
  nickname: z.string().max(200).optional().default(""),
  elevationMeters: z.coerce.number().min(0),
  coordinatesLat: z.coerce.number().optional(),
  coordinatesLon: z.coerce.number().optional(),
  district: z.string().max(100).optional().default("Badulla"),
  province: z.string().max(100).optional().default("Uva Province"),
  nearbyTowns: z.string().max(500).optional().default(""),
  shortDescription: z.string().max(300).default(""),
  fullDescription: z.string().default(""),
  keyFeatures: z.string().default(""),
  legendStory: z.string().optional().default(""),
  historicalSignificance: z.string().optional().default(""),
  religiousSignificance: z.string().optional().default(""),
  metaTitle: z.string().max(150).optional().default(""),
  metaDescription: z.string().max(300).optional().default(""),
  metaKeywords: z.string().max(200).optional().default(""),
});

export async function saveMountainInfo(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = mountainSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const [existing] = await db.select().from(mountainInfo).limit(1);
  const values = {
    ...parsed.data,
    elevationMeters: parsed.data.elevationMeters.toFixed(2),
    coordinatesLat: parsed.data.coordinatesLat?.toString(),
    coordinatesLon: parsed.data.coordinatesLon?.toString(),
  };

  if (existing) {
    await db
      .update(mountainInfo)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(mountainInfo.id, existing.id));
  } else {
    await db.insert(mountainInfo).values(values);
  }

  revalidatePath("/admin/content/mountain");
  revalidatePath("/about");
  revalidatePath("/");
}

// ================ TRAIL INFO ================
const trailSchema = z.object({
  name: z.string().min(2).max(200),
  trailheadLocation: z.string().min(2).max(200),
  trailheadAltitude: z.coerce.number().optional(),
  distanceKm: z.coerce.number().min(0),
  ascentMeters: z.coerce.number().optional(),
  descentMeters: z.coerce.number().optional(),
  avgAscentTimeHours: z.coerce.number().min(0),
  avgDescentTimeHours: z.coerce.number().min(0),
  fullRoundTripHours: z.coerce.number().min(0),
  difficulty: z.enum(["easy", "moderate", "hard", "expert"]),
  difficultyRating: z.coerce.number().int().min(1).max(10),
  trailType: z.string().max(50).default("Out & Back"),
  surfaceType: z.string().max(200).optional().default(""),
  bestMonthsStart: z.coerce.number().int().min(1).max(12),
  bestMonthsEnd: z.coerce.number().int().min(1).max(12),
  bestTimeOfDay: z.string().max(200).optional().default(""),
  requiresGuide: z.coerce.boolean().default(false),
  requiresPermit: z.coerce.boolean().default(false),
  permitInfo: z.string().optional().default(""),
  safetyTips: z.string().optional().default(""),
  emergencyNotes: z.string().optional().default(""),
  waterAvailability: z.string().max(300).optional().default(""),
  mobileCoverage: z.string().max(300).optional().default(""),
});

export async function saveTrailInfo(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = trailSchema.safeParse({
    ...raw,
    requiresGuide: raw.requiresGuide === "on",
    requiresPermit: raw.requiresPermit === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const [existing] = await db.select().from(trailInfo).limit(1);
  const values = {
    ...parsed.data,
    trailheadAltitude: parsed.data.trailheadAltitude?.toFixed(2),
    distanceKm: parsed.data.distanceKm.toFixed(2),
    ascentMeters: parsed.data.ascentMeters?.toFixed(2),
    descentMeters: parsed.data.descentMeters?.toFixed(2),
    avgAscentTimeHours: parsed.data.avgAscentTimeHours.toFixed(1),
    avgDescentTimeHours: parsed.data.avgDescentTimeHours.toFixed(1),
    fullRoundTripHours: parsed.data.fullRoundTripHours.toFixed(1),
  };

  if (existing) {
    await db
      .update(trailInfo)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(trailInfo.id, existing.id));
  } else {
    await db.insert(trailInfo).values(values);
  }

  revalidatePath("/admin/content/trail");
  revalidatePath("/trail");
}

// ================ WAYPOINTS ================
const waypointSchema = z.object({
  trailId: z.string().uuid(),
  name: z.string().min(2).max(200),
  waypointType: z.enum([
    "start",
    "checkpoint",
    "viewpoint",
    "cave",
    "rest_area",
    "summit",
    "end",
  ]),
  description: z.string().optional().default(""),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  altitudeMeters: z.coerce.number().optional(),
  distanceFromStartKm: z.coerce.number().optional(),
  estimatedTimeFromStartMinutes: z.coerce.number().int().optional(),
  order: z.coerce.number().int().default(0),
});

export async function saveWaypoint(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const id = raw.id as string | undefined;
  const parsed = waypointSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const values = {
    ...parsed.data,
    latitude: parsed.data.latitude.toFixed(7),
    longitude: parsed.data.longitude.toFixed(7),
    altitudeMeters: parsed.data.altitudeMeters?.toFixed(2),
    distanceFromStartKm: parsed.data.distanceFromStartKm?.toFixed(2),
  };

  if (id && id !== "") {
    await db.update(trailWaypoints).set(values).where(eq(trailWaypoints.id, id));
  } else {
    await db.insert(trailWaypoints).values(values);
  }

  revalidatePath("/admin/content/waypoints");
  revalidatePath("/trail");
}

export async function deleteWaypoint(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await db.delete(trailWaypoints).where(eq(trailWaypoints.id, id));
  revalidatePath("/admin/content/waypoints");
  revalidatePath("/trail");
}

// ================ WEATHER ================
const weatherSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  condition: z.enum([
    "sunny",
    "partly_cloudy",
    "cloudy",
    "rainy",
    "storm",
    "foggy",
    "misty",
  ]),
  temperatureCelsius: z.coerce.number(),
  feelsLikeCelsius: z.coerce.number().optional(),
  humidityPercent: z.coerce.number().int().min(0).max(100),
  windSpeedKmh: z.coerce.number().int().min(0),
  precipitationMm: z.coerce.number().min(0).default(0),
  sunriseTime: z.string().optional().default(""),
  sunsetTime: z.string().optional().default(""),
  isHikingRecommended: z.coerce.boolean().default(true),
  recommendationText: z.string().max(300).optional().default(""),
  hasWarning: z.coerce.boolean().default(false),
  warningText: z.string().max(300).optional().default(""),
});

export async function saveWeather(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const id = raw.id as string | undefined;
  const parsed = weatherSchema.safeParse({
    ...raw,
    isHikingRecommended: raw.isHikingRecommended === "on",
    hasWarning: raw.hasWarning === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const values = {
    ...parsed.data,
    temperatureCelsius: parsed.data.temperatureCelsius.toFixed(1),
    feelsLikeCelsius: parsed.data.feelsLikeCelsius?.toFixed(1),
    precipitationMm: parsed.data.precipitationMm.toFixed(1),
    sunriseTime: parsed.data.sunriseTime || null,
    sunsetTime: parsed.data.sunsetTime || null,
    updatedBy: "admin",
  };

  if (id) {
    await db.update(weatherInfo).set(values).where(eq(weatherInfo.id, id));
  } else {
    // Upsert by date
    const [existing] = await db
      .select()
      .from(weatherInfo)
      .where(eq(weatherInfo.date, parsed.data.date))
      .limit(1);
    if (existing) {
      await db.update(weatherInfo).set(values).where(eq(weatherInfo.id, existing.id));
    } else {
      await db.insert(weatherInfo).values(values);
    }
  }

  revalidatePath("/admin/content/weather");
  revalidatePath("/weather");
}

export async function deleteWeather(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await db.delete(weatherInfo).where(eq(weatherInfo.id, id));
  revalidatePath("/admin/content/weather");
  revalidatePath("/weather");
}

// ================ FAQS ================
const faqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(5),
  category: z.enum([
    "general",
    "hiking",
    "transport",
    "safety",
    "accommodation",
    "food",
    "permits",
  ]),
  order: z.coerce.number().int().default(0),
  isPublished: z.coerce.boolean().default(true),
});

export async function saveFaq(formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const id = raw.id as string | undefined;
  const parsed = faqSchema.safeParse({
    ...raw,
    isPublished: raw.isPublished === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  if (id) {
    await db.update(faqs).set(parsed.data).where(eq(faqs.id, id));
  } else {
    await db.insert(faqs).values(parsed.data);
  }
  revalidatePath("/admin/content/faqs");
  revalidatePath("/faq");
}

export async function deleteFaq(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await db.delete(faqs).where(eq(faqs.id, id));
  revalidatePath("/admin/content/faqs");
  revalidatePath("/faq");
}

// ================ EMERGENCY CONTACTS ================
const emergencySchema = z.object({
  name: z.string().min(2).max(100),
  contactType: z.enum([
    "police",
    "hospital",
    "ambulance",
    "mountain_rescue",
    "fire",
    "local_admin",
  ]),
  phoneNumber: z.string().min(3).max(20),
  alternativeNumber: z.string().max(20).optional().default(""),
  location: z.string().max(200).optional().default(""),
  notes: z.string().optional().default(""),
  isActive: z.coerce.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export async function saveEmergencyContact(formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const id = raw.id as string | undefined;
  const parsed = emergencySchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on",
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const values = {
    ...parsed.data,
    alternativeNumber: parsed.data.alternativeNumber || null,
  };

  if (id) {
    await db
      .update(emergencyContacts)
      .set(values)
      .where(eq(emergencyContacts.id, id));
  } else {
    await db.insert(emergencyContacts).values(values);
  }
  revalidatePath("/admin/content/emergency");
  revalidatePath("/emergency");
}

export async function deleteEmergencyContact(formData: FormData) {
  await requireAdmin();
  const id = formData.get("id") as string;
  await db.delete(emergencyContacts).where(eq(emergencyContacts.id, id));
  revalidatePath("/admin/content/emergency");
  revalidatePath("/emergency");
}