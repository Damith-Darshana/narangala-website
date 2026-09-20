import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { r2, R2_BUCKET } from "@/lib/r2-client";

const MAX_UPLOADS_PER_USER = 5;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // Check user's upload count (excluding rejected)
  const existing = await db
    .select({ id: galleryImages.id })
    .from(galleryImages)
    .where(
      and(
        eq(galleryImages.userId, userId),
        // count pending + approved, ignore rejected
        // (rejected ones don't count toward the limit)
      )
    );

  const activeCount = existing.length;
  if (activeCount >= MAX_UPLOADS_PER_USER) {
    return NextResponse.json(
      {
        error: `Upload limit reached. You have ${activeCount}/${MAX_UPLOADS_PER_USER} photos.`,
      },
      { status: 400 }
    );
  }

  const body = await req.json();
  const { contentType } = body as { contentType?: string };

  if (!contentType || !contentType.startsWith("image/")) {
    return NextResponse.json(
      { error: "Content-Type must be an image" },
      { status: 400 }
    );
  }

  // Generate a unique, collision-proof key
  const ext = contentType === "image/webp" ? "webp" : "jpg";
  const uuid = crypto.randomUUID();
  const key = `gallery/${userId}/${uuid}.${ext}`;

  const cmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 300 }); // 5 min

  return NextResponse.json({ uploadUrl, key });
}