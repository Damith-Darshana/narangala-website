import Link from "next/link";
import { db } from "@/lib/db";
import { emergencyContacts } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { deleteEmergencyContact } from "@/actions/admin-content-actions";
import { EmergencyEditor } from "@/components/admin/emergency-editor";

export default async function EmergencyAdminPage() {
  const all = await db
    .select()
    .from(emergencyContacts)
    .orderBy(asc(emergencyContacts.order));

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/content" className="text-sm underline">
          ← Content
        </Link>
        <h1 className="text-2xl font-bold mt-2">Emergency Contacts</h1>
      </header>

      <section className="border rounded-lg p-4">
        <h2 className="font-semibold mb-3">Add contact</h2>
        <EmergencyEditor />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Existing ({all.length})</h2>
        {all.map((c) => (
          <details key={c.id} className="border rounded-lg">
            <summary className="p-3 cursor-pointer flex justify-between items-start gap-3">
              <div>
                <div className="font-medium">
                  {c.name} · {c.contactType}
                </div>
                <div className="text-sm font-mono text-gray-600">
                  {c.phoneNumber}
                </div>
              </div>
              <form action={deleteEmergencyContact} className="inline shrink-0">
                <input type="hidden" name="id" value={c.id} />
                <button className="text-red-600 hover:underline text-xs">
                  Delete
                </button>
              </form>
            </summary>
            <div className="p-3 border-t">
              <EmergencyEditor existing={c} />
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}