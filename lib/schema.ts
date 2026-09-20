import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  decimal,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- USERS ----------
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull().default(""),
    lastName: text("last_name").notNull().default(""),
    role: text("role").notNull().default("TOURIST"), // TOURIST | PROVIDER | ADMIN
    isActive: boolean("is_active").notNull().default(true),
    isVerified: boolean("is_verified").notNull().default(false),
    phoneNumber: text("phone_number"),
    bio: text("bio").default(""),
    profilePicture: text("profile_picture"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

// ---------- BLOG POSTS ----------
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: text("content").notNull(),
    featuredImage: text("featured_image"),
    author: text("author").notNull().default("Narangala Admin"),
    authorId: uuid("author_id").references(() => users.id, { onDelete: "set null" }),
    viewCount: integer("view_count").notNull().default(0),
    likes: integer("likes").notNull().default(0),
    categories: text("categories").notNull().default(""),
    tags: text("tags").notNull().default(""),
    isPublished: boolean("is_published").notNull().default(true),
    publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("blog_posts_slug_idx").on(t.slug),
  })
);

// ---------- GALLERY (user-uploaded photos) ----------
export const galleryImages = pgTable("gallery_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  r2Key: text("r2_key").notNull(), // key in Cloudflare R2 bucket
  width: integer("width"),
  height: integer("height"),
  sizeBytes: integer("size_bytes"),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- MOUNTAIN INFO ----------
export const mountainInfo = pgTable("mountain_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("Narangala"),
  tamilName: text("tamil_name"),
  sinhalaName: text("sinhala_name"),
  nickname: text("nickname"),
  elevationMeters: decimal("elevation_meters", { precision: 7, scale: 2 }).default("1527.00"),
  coordinatesLat: decimal("coordinates_lat", { precision: 10, scale: 7 }),
  coordinatesLon: decimal("coordinates_lon", { precision: 10, scale: 7 }),
  district: text("district").default("Badulla"),
  province: text("province").default("Uva Province"),
  nearbyTowns: text("nearby_towns"),
  shortDescription: text("short_description"),
  fullDescription: text("full_description"),
  keyFeatures: text("key_features"),
  legendStory: text("legend_story"),
  historicalSignificance: text("historical_significance"),
  religiousSignificance: text("religious_significance"),
  heroImage: text("hero_image"),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  isPublished: boolean("is_published").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- FAQ ----------
export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("general"),
  order: integer("order").notNull().default(0),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- TRAIL INFO ----------
export const trailInfo = pgTable("trail_info", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("Main Trail to Narangala Summit"),
  trailheadLocation: text("trailhead_location").notNull(),
  trailheadAltitude: decimal("trailhead_altitude", { precision: 7, scale: 2 }),
  distanceKm: decimal("distance_km", { precision: 5, scale: 2 }).default("3.00"),
  ascentMeters: decimal("ascent_meters", { precision: 7, scale: 2 }),
  descentMeters: decimal("descent_meters", { precision: 7, scale: 2 }),
  avgAscentTimeHours: decimal("avg_ascent_time_hours", { precision: 4, scale: 1 }).default("1.5"),
  avgDescentTimeHours: decimal("avg_descent_time_hours", { precision: 4, scale: 1 }).default("1.0"),
  fullRoundTripHours: decimal("full_round_trip_hours", { precision: 4, scale: 1 }).default("2.5"),
  difficulty: text("difficulty").notNull().default("moderate"),
  difficultyRating: integer("difficulty_rating").notNull().default(5),
  trailType: text("trail_type").default("Out & Back"),
  surfaceType: text("surface_type"),
  bestMonthsStart: integer("best_months_start").default(12),
  bestMonthsEnd: integer("best_months_end").default(3),
  bestTimeOfDay: text("best_time_of_day"),
  requiresGuide: boolean("requires_guide").notNull().default(false),
  requiresPermit: boolean("requires_permit").notNull().default(false),
  permitInfo: text("permit_info"),
  safetyTips: text("safety_tips"),
  emergencyNotes: text("emergency_notes"),
  waterAvailability: text("water_availability"),
  mobileCoverage: text("mobile_coverage"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- TRAIL WAYPOINTS ----------
export const trailWaypoints = pgTable("trail_waypoints", {
  id: uuid("id").primaryKey().defaultRandom(),
  trailId: uuid("trail_id")
    .notNull()
    .references(() => trailInfo.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  waypointType: text("waypoint_type").notNull(), // start | checkpoint | viewpoint | cave | rest_area | summit | end
  description: text("description").default(""),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  altitudeMeters: decimal("altitude_meters", { precision: 7, scale: 2 }),
  distanceFromStartKm: decimal("distance_from_start_km", { precision: 5, scale: 2 }),
  estimatedTimeFromStartMinutes: integer("estimated_time_from_start_minutes"),
  image: text("image"),
  order: integer("order").notNull().default(0),
});

// ---------- WEATHER ----------
export const weatherInfo = pgTable(
  "weather_info",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: text("date").notNull(), // YYYY-MM-DD stored as text for simplicity
    condition: text("condition").notNull(), // sunny | partly_cloudy | cloudy | rainy | storm | foggy | misty
    temperatureCelsius: decimal("temperature_celsius", { precision: 4, scale: 1 }).notNull(),
    feelsLikeCelsius: decimal("feels_like_celsius", { precision: 4, scale: 1 }),
    humidityPercent: integer("humidity_percent").notNull(),
    windSpeedKmh: integer("wind_speed_kmh").notNull().default(0),
    precipitationMm: decimal("precipitation_mm", { precision: 5, scale: 1 }).default("0"),
    sunriseTime: text("sunrise_time"),
    sunsetTime: text("sunset_time"),
    isHikingRecommended: boolean("is_hiking_recommended").notNull().default(true),
    recommendationText: text("recommendation_text").default(""),
    hasWarning: boolean("has_warning").notNull().default(false),
    warningText: text("warning_text"),
    updatedBy: text("updated_by").default("system"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    dateIdx: uniqueIndex("weather_date_idx").on(t.date),
  })
);

// ---------- MOUNTAIN GALLERY (curated, distinct from user uploads) ----------
export const mountainGallery = pgTable("mountain_gallery", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").default(""),
  description: text("description").default(""),
  r2Key: text("r2_key").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
  order: integer("order").notNull().default(0),
  season: text("season").notNull().default("all"), // all | summer | winter | monsoon | spring
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- SERVICE CATEGORIES ----------
export const serviceCategories = pgTable(
  "service_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    icon: text("icon").default(""),
    description: text("description").default(""),
    order: integer("order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    slugIdx: uniqueIndex("service_categories_slug_idx").on(t.slug),
  })
);

// ---------- SERVICE PROVIDERS ----------
export const serviceProviders = pgTable("service_providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  alternativePhone: text("alternative_phone"),
  email: text("email"),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => serviceCategories.id, { onDelete: "restrict" }),
  address: text("address").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  serviceArea: text("service_area").default("Keenakele, Narangala Base"),
  description: text("description").notNull().default(""),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }),
  priceDescription: text("price_description").default(""),
  isAvailable: boolean("is_available").notNull().default(true),
  availableFrom: text("available_from").default("06:00"),
  availableTo: text("available_to").default("18:00"),
  daysAvailable: text("days_available").default(
    "Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday"
  ),
  maxCapacity: integer("max_capacity"),
  currentInventory: integer("current_inventory"),
  verificationStatus: text("verification_status").notNull().default("pending"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  verificationNotes: text("verification_notes").default(""),
  idDocument: text("id_document"),
  businessLicense: text("business_license"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 })
    .notNull()
    .default("0.00"),
  totalReviews: integer("total_reviews").notNull().default(0),
  profileImage: text("profile_image"),
  coverImage: text("cover_image"),
  totalBookings: integer("total_bookings").notNull().default(0),
  completedBookings: integer("completed_bookings").notNull().default(0),
  cancelledBookings: integer("cancelled_bookings").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- PROVIDER IMAGES (gallery) ----------
export const serviceImages = pgTable("service_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => serviceProviders.id, { onDelete: "cascade" }),
  r2Key: text("r2_key").notNull(),
  caption: text("caption").default(""),
  order: integer("order").notNull().default(0),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------- SERVICE PRICING RULES ----------
export const servicePricing = pgTable("service_pricing", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: uuid("provider_id")
    .notNull()
    .references(() => serviceProviders.id, { onDelete: "cascade" }),
  pricingType: text("pricing_type").notNull().default("regular"),
  minQuantity: integer("min_quantity").notNull().default(1),
  maxQuantity: integer("max_quantity"),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isActive: boolean("is_active").notNull().default(true),
});

// ---------- SERVICE AVAILABILITY (blocked dates) ----------
export const serviceAvailability = pgTable(
  "service_availability",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => serviceProviders.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    isAvailable: boolean("is_available").notNull().default(false),
    reason: text("reason"),
  },
  (t) => ({
    providerDateIdx: uniqueIndex("service_availability_provider_date_idx").on(
      t.providerId,
      t.date
    ),
  })
);

// ---------- SERVICE BOOKINGS ----------
export const serviceBookings = pgTable(
  "service_bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: text("booking_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => serviceProviders.id, { onDelete: "cascade" }),
    serviceType: text("service_type").notNull().default("general"),
    bookingDate: text("booking_date").notNull(),
    bookingTime: text("booking_time").notNull(),
    details: text("details").notNull().default("{}"), // JSON stored as text
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    status: text("status").notNull().default("pending"),
    paymentStatus: text("payment_status").notNull().default("pending"),
    requestedAt: timestamp("requested_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    userNotes: text("user_notes").default(""),
    providerNotes: text("provider_notes").default(""),
    cancellationReason: text("cancellation_reason"),
    cancelledBy: text("cancelled_by"),
    userRating: integer("user_rating"),
    userReview: text("user_review"),
  },
  (t) => ({
    bookingIdIdx: uniqueIndex("service_bookings_booking_id_idx").on(t.bookingId),
  })
);

// ---------- SERVICE REVIEWS ----------
export const serviceReviews = pgTable(
  "service_reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    providerId: uuid("provider_id")
      .notNull()
      .references(() => serviceProviders.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id").references(() => serviceBookings.id, {
      onDelete: "set null",
    }),
    rating: integer("rating").notNull(),
    comment: text("comment").notNull(),
    isApproved: boolean("is_approved").notNull().default(false),
    providerResponse: text("provider_response"),
    responseAt: timestamp("response_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userProviderIdx: uniqueIndex("service_reviews_user_provider_idx").on(
      t.userId,
      t.providerId
    ),
  })
);

// ---------- EMERGENCY CONTACTS ----------
export const emergencyContacts = pgTable("emergency_contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  contactType: text("contact_type").notNull(),
  phoneNumber: text("phone_number").notNull(),
  alternativeNumber: text("alternative_number"),
  location: text("location").default(""),
  notes: text("notes").default(""),
  isActive: boolean("is_active").notNull().default(true),
  order: integer("order").notNull().default(0),
});


// ---------- RELATIONS ----------
export const usersRelations = relations(users, ({ many }) => ({
  blogPosts: many(blogPosts),
  galleryImages: many(galleryImages),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, { fields: [blogPosts.authorId], references: [users.id] }),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
  user: one(users, { fields: [galleryImages.userId], references: [users.id] }),
}));

export const trailInfoRelations = relations(trailInfo, ({ many }) => ({
  waypoints: many(trailWaypoints),
}));

export const trailWaypointsRelations = relations(trailWaypoints, ({ one }) => ({
  trail: one(trailInfo, {
    fields: [trailWaypoints.trailId],
    references: [trailInfo.id],
  }),
}));

export const serviceCategoriesRelations = relations(
  serviceCategories,
  ({ many }) => ({
    providers: many(serviceProviders),
  })
);

export const serviceProvidersRelations = relations(
  serviceProviders,
  ({ one, many }) => ({
    category: one(serviceCategories, {
      fields: [serviceProviders.categoryId],
      references: [serviceCategories.id],
    }),
    user: one(users, {
      fields: [serviceProviders.userId],
      references: [users.id],
    }),
    images: many(serviceImages),
    reviews: many(serviceReviews),
    bookings: many(serviceBookings),
    pricing: many(servicePricing),
    unavailableDates: many(serviceAvailability),
  })
);

export const serviceImagesRelations = relations(serviceImages, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [serviceImages.providerId],
    references: [serviceProviders.id],
  }),
}));

export const serviceReviewsRelations = relations(serviceReviews, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [serviceReviews.providerId],
    references: [serviceProviders.id],
  }),
  user: one(users, {
    fields: [serviceReviews.userId],
    references: [users.id],
  }),
}));

export const serviceBookingsRelations = relations(
  serviceBookings,
  ({ one }) => ({
    provider: one(serviceProviders, {
      fields: [serviceBookings.providerId],
      references: [serviceProviders.id],
    }),
    user: one(users, {
      fields: [serviceBookings.userId],
      references: [users.id],
    }),
  })
);

export const servicePricingRelations = relations(servicePricing, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [servicePricing.providerId],
    references: [serviceProviders.id],
  }),
}));

export const serviceAvailabilityRelations = relations(
  serviceAvailability,
  ({ one }) => ({
    provider: one(serviceProviders, {
      fields: [serviceAvailability.providerId],
      references: [serviceProviders.id],
    }),
  })
);



// ---------- TYPES ----------
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type GalleryImage = typeof galleryImages.$inferSelect;

export type TrailInfo = typeof trailInfo.$inferSelect;
export type TrailWaypoint = typeof trailWaypoints.$inferSelect;
export type WeatherInfo = typeof weatherInfo.$inferSelect;
export type MountainGallery = typeof mountainGallery.$inferSelect;

export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type ServiceImage = typeof serviceImages.$inferSelect;
export type ServicePricing = typeof servicePricing.$inferSelect;
export type ServiceAvailability = typeof serviceAvailability.$inferSelect;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type ServiceReview = typeof serviceReviews.$inferSelect;
export type EmergencyContact = typeof emergencyContacts.$inferSelect;


