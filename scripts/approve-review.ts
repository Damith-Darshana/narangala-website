import { config } from "dotenv";
config({ path: ".env" });

import { db } from "../lib/db";
import { serviceReviews } from "../lib/schema";
import { eq } from "drizzle-orm";
import { recomputeProviderRating } from "../actions/review-actions";

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error("Usage: tsx scripts/approve-review.ts <review-id>");
    process.exit(1);
  }

  const [review] = await db
    .select()
    .from(serviceReviews)
    .where(eq(serviceReviews.id, id))
    .limit(1);

  if (!review) {
    console.error("Review not found");
    process.exit(1);
  }

  await db
    .update(serviceReviews)
    .set({ isApproved: true })
    .where(eq(serviceReviews.id, id));

  await recomputeProviderRating(review.providerId);

  console.log(`✅ Approved review ${id} and recomputed provider rating`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});