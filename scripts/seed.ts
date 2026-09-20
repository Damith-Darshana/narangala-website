import "dotenv/config";
import { db } from "../lib/db";
import { blogPosts, faqs, mountainInfo } from "../lib/schema";

async function main() {
  await db.insert(blogPosts).values([
    {
      title: "Complete Guide to Hiking Narangala Mountain",
      slug: "complete-guide-narangala-hike",
      excerpt:
        "Everything you need to know about hiking Narangala — getting there, packing, safety, and the summit view.",
      content:
        "# Complete Guide\n\nNarangala is one of Sri Lanka's most rewarding hikes...",
      author: "Narangala Admin",
      categories: "Hiking Guide, Beginner Tips",
      tags: "narangala, hiking, sri lanka",
    },
    {
      title: "The Legend of King Walagamba's Hidden Gold",
      slug: "legend-king-walagamba-hidden-gold",
      excerpt:
        "The fascinating legend behind Narangala's name and the mysterious gold cave.",
      content: "# The Legend\n\nDeep within the slopes of Narangala...",
      author: "Narangala Historian",
      categories: "History, Legend",
      tags: "history, legend, gold",
    },
  ]);

  await db.insert(mountainInfo).values({
    name: "Narangala",
    nickname: "Golden Mountain",
    district: "Badulla",
    province: "Uva Province",
    shortDescription:
      "A prominent peak in Uva Province with 360-degree panoramic views.",
    fullDescription:
      "Narangala Mountain is a hidden gem in Badulla District, standing at 1,527m.",
  });

  await db.insert(faqs).values([
    {
      question: "How long does it take to hike Narangala?",
      answer: "Ascent ~1.5-2 hours, descent ~1 hour. Plan 3-4 hours total.",
      category: "hiking",
      order: 1,
    },
    {
      question: "Do I need a guide?",
      answer: "No. The trail is well-marked.",
      category: "hiking",
      order: 2,
    },
  ]);

  console.log("✅ Seed complete");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});