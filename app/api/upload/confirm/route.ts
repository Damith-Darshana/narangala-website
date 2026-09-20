import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { galleryImages } from "@/lib/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const body = await req.json();
  const { key, title, description, width, height, sizeBytes } = body as {
    key?: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
    sizeBytes?: number;
  };

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  // Sanity check: the key must belong to this user
  if (!key.startsWith(`gallery/${userId}/`)) {
    return NextResponse.json({ error: "Invalid key" }, { status: 403 });
  }

  const [row] = await db
    .insert(galleryImages)
    .values({
      userId,
      r2Key: key,
      title: (title ?? "").slice(0, 200),
      description: (description ?? "").slice(0, 1000),
      width: width ?? null,
      height: height ?? null,
      sizeBytes: sizeBytes ?? null,
      status: "pending",
    })
    .returning({ id: galleryImages.id });

  return NextResponse.json({ id: row.id });
}