import "dotenv/config";

import { db } from "../lib/db";
import {
  emergencyContacts,
  serviceCategories,
  serviceProviders,
} from "../lib/schema";

async function main() {
  console.log("🧹 Clearing services tables...");
  await db.delete(serviceProviders);
  await db.delete(serviceCategories);
  await db.delete(emergencyContacts);

  console.log("🗂  Inserting service categories...");
  const cats = await db
    .insert(serviceCategories)
    .values([
      {
        name: "Tuk-Tuk Transport",
        slug: "tuk-tuk",
        icon: "🛺",
        description:
          "Local three-wheeler drivers for pickups, drop-offs, and tours around the Narangala area.",
        order: 1,
      },
      {
        name: "Camping Gear Rental",
        slug: "camping-gear",
        icon: "⛺",
        description:
          "Tents, sleeping bags, and camping equipment for overnight stays at the summit.",
        order: 2,
      },
      {
        name: "Local Guides",
        slug: "guides",
        icon: "🧭",
        description:
          "Experienced local guides who know the trail, history, and legends of Narangala.",
        order: 3,
      },
      {
        name: "Food & Refreshments",
        slug: "food",
        icon: "🍛",
        description:
          "Home-cooked meals, packed lunches, and refreshments for your hike.",
        order: 4,
      },
      {
        name: "Accommodation",
        slug: "accommodation",
        icon: "🏠",
        description:
          "Guest houses and homestays near the trailhead in Keenakele village.",
        order: 5,
      },
    ])
    .returning();

  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  console.log("👤 Inserting sample providers (demo data)...");
  await db.insert(serviceProviders).values([
    {
      businessName: "Sunil's Tuk-Tuk Service",
      ownerName: "Sunil Perera",
      phoneNumber: "+94771234567",
      email: "sunil@example.com",
      categoryId: catBySlug["tuk-tuk"].id,
      address: "Keenakele Village, Badulla",
      latitude: "6.9833000",
      longitude: "81.0500000",
      serviceArea: "Keenakele, Badulla, Ella, Hali Ella",
      description:
        "Reliable tuk-tuk service with 15 years of experience. Airport pickups, Ella-Badulla transfers, and customized day tours to Narangala.",
      pricePerUnit: "2500.00",
      priceDescription: "per trip (Ella to Keenakele)",
      isAvailable: true,
      availableFrom: "05:30",
      availableTo: "20:00",
      maxCapacity: 3,
      verificationStatus: "verified",
      averageRating: "4.80",
      totalReviews: 12,
      totalBookings: 45,
      completedBookings: 43,
    },
    {
      businessName: "Narangala Camping Supplies",
      ownerName: "Kamal Jayawardena",
      phoneNumber: "+94762345678",
      categoryId: catBySlug["camping-gear"].id,
      address: "Keenakele Junction, Badulla",
      latitude: "6.9845000",
      longitude: "81.0510000",
      description:
        "Quality camping equipment for overnight stays on the mountain. Tents, sleeping bags, mats, portable stoves, and headlamps.",
      pricePerUnit: "1500.00",
      priceDescription: "per tent per night",
      availableFrom: "06:00",
      availableTo: "18:00",
      maxCapacity: 20,
      currentInventory: 12,
      verificationStatus: "verified",
      averageRating: "4.60",
      totalReviews: 8,
      totalBookings: 28,
      completedBookings: 27,
    },
    {
      businessName: "Thangamalai Local Guide Service",
      ownerName: "Ranjith Bandara",
      phoneNumber: "+94753456789",
      categoryId: catBySlug["guides"].id,
      address: "Thangamalai Estate, Keenakele",
      description:
        "Certified local guide. Knows every trail, legend, and viewpoint. Specialized in sunrise hikes and photography tours. English-speaking.",
      pricePerUnit: "3500.00",
      priceDescription: "per group per day",
      availableFrom: "04:30",
      availableTo: "18:00",
      verificationStatus: "verified",
      averageRating: "5.00",
      totalReviews: 21,
      totalBookings: 62,
      completedBookings: 62,
    },
    {
      businessName: "Amma's Kitchen - Packed Lunches",
      ownerName: "Chandra Kumari",
      phoneNumber: "+94724567890",
      categoryId: catBySlug["food"].id,
      address: "Keenakele Village, Badulla",
      description:
        "Traditional Sri Lankan home cooking. Packed lunch includes rice, curry, sambol, and short eats. Vegetarian and vegan options available.",
      pricePerUnit: "800.00",
      priceDescription: "per packed lunch",
      availableFrom: "05:00",
      availableTo: "10:00",
      maxCapacity: 30,
      verificationStatus: "verified",
      averageRating: "4.90",
      totalReviews: 14,
      totalBookings: 38,
      completedBookings: 38,
    },
  ]);

  console.log("🚨 Inserting emergency contacts...");
  await db.insert(emergencyContacts).values([
    {
      name: "Police Emergency",
      contactType: "police",
      phoneNumber: "119",
      notes: "National emergency number, 24/7",
      order: 1,
    },
    {
      name: "Ambulance / Suwa Seriya",
      contactType: "ambulance",
      phoneNumber: "1990",
      notes: "Free pre-hospital emergency care, 24/7",
      order: 2,
    },
    {
      name: "Badulla General Hospital",
      contactType: "hospital",
      phoneNumber: "+94552222261",
      location: "Badulla",
      notes: "Nearest major hospital, ~45 min from trailhead",
      order: 3,
    },
    {
      name: "Hali Ella Police Station",
      contactType: "police",
      phoneNumber: "+94552222522",
      location: "Hali Ella",
      notes: "Nearest police station to the trailhead",
      order: 4,
    },
    {
      name: "Badulla Fire & Rescue",
      contactType: "fire",
      phoneNumber: "+94552222222",
      location: "Badulla",
      order: 5,
    },
    {
      name: "Narangala Mountain Rescue (Local)",
      contactType: "mountain_rescue",
      phoneNumber: "+94771234567",
      notes: "Volunteer-run local rescue coordination",
      order: 6,
    },
    {
      name: "Keenakele Village Officer (Grama Niladhari)",
      contactType: "local_admin",
      phoneNumber: "+94775551234",
      location: "Keenakele",
      notes: "Local authority for trailhead information",
      order: 7,
    },
  ]);

  console.log("✅ Services seed complete");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});