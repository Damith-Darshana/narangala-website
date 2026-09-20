import { db } from "@/lib/db";
import { faqs } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";

export const revalidate = 3600;

const categoryLabels: Record<string, string> = {
  general: "General",
  hiking: "Hiking & Trail",
  transport: "Transportation",
  safety: "Safety & Emergency",
  accommodation: "Accommodation",
  food: "Food & Water",
  permits: "Permits & Fees",
};

export default async function FAQPage() {
  const all = await db
    .select()
    .from(faqs)
    .where(eq(faqs.isPublished, true))
    .orderBy(asc(faqs.order));

  const grouped = all.reduce<Record<string, typeof all>>((acc, faq) => {
    (acc[faq.category] ||= []).push(faq);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat}>
          <h2 className="text-xl font-semibold mb-3">
            {categoryLabels[cat] ?? cat}
          </h2>
          <div className="space-y-3">
            {items.map((faq) => (
              <details key={faq.id} className="border rounded p-4">
                <summary className="font-medium cursor-pointer">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}