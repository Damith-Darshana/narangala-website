import Link from "next/link";
import { db } from "@/lib/db";
import { faqs } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { deleteFaq } from "@/actions/admin-content-actions";
import { FaqEditor } from "@/components/admin/faq-editor";

export default async function FaqsAdminPage() {
  const all = await db.select().from(faqs).orderBy(asc(faqs.order));

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/content" className="text-sm underline">
          ← Content
        </Link>
        <h1 className="text-2xl font-bold mt-2">FAQs</h1>
      </header>

      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Add FAQ</h2>
        <FaqEditor />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Existing ({all.length})</h2>
        {all.map((f) => (
          <details key={f.id} className="border rounded-lg">
            <summary className="p-3 cursor-pointer flex justify-between items-start gap-3">
              <div>
                <div className="font-medium">{f.question}</div>
                <div className="text-xs text-gray-500">
                  {f.category} · order {f.order} ·{" "}
                  {f.isPublished ? "published" : "hidden"}
                </div>
              </div>
              <form action={deleteFaq} className="inline shrink-0">
                <input type="hidden" name="id" value={f.id} />
                <button className="text-red-600 hover:underline text-xs">
                  Delete
                </button>
              </form>
            </summary>
            <div className="p-3 border-t">
              <FaqEditor existing={f} />
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}