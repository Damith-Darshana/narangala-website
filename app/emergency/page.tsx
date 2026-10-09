import { db } from "@/lib/db";
import { emergencyContacts } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import {
  CONTACT_TYPE_ICONS,
  CONTACT_TYPE_LABELS,
} from "@/lib/utils";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Emergency Contacts",
  description:
    "Emergency phone numbers for Narangala Mountain: police, ambulance, hospital, and mountain rescue.",
};


export const revalidate = 3600;

export default async function EmergencyPage() {
  const contacts = await db
    .select()
    .from(emergencyContacts)
    .where(eq(emergencyContacts.isActive, true))
    .orderBy(asc(emergencyContacts.order));

  const grouped = contacts.reduce<Record<string, typeof contacts>>(
    (acc, c) => {
      (acc[c.contactType] ||= []).push(c);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      <header className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
        <h1 className="text-3xl font-bold">🚨 Emergency Contacts</h1>
        <p className="text-gray-700 mt-1">
          Keep these numbers saved before your hike. Mobile coverage on the
          trail is limited — save them offline.
        </p>
      </header>

      {Object.entries(grouped).map(([type, items]) => (
        <section key={type}>
          <h2 className="text-xl font-semibold mb-3">
            {CONTACT_TYPE_ICONS[type] ?? "📞"}{" "}
            {CONTACT_TYPE_LABELS[type] ?? type}
          </h2>
          <div className="space-y-3">
            {items.map((c) => (
              <div
                key={c.id}
                className="border rounded-lg p-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="font-semibold">{c.name}</div>
                  {c.location && (
                    <div className="text-sm text-gray-500">📍 {c.location}</div>
                  )}
                  {c.notes && (
                    <div className="text-sm text-gray-600 mt-1">{c.notes}</div>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <a
                    href={`tel:${c.phoneNumber}`}
                    className="block font-mono text-lg font-semibold text-blue-700 hover:underline"
                  >
                    {c.phoneNumber}
                  </a>
                  {c.alternativeNumber && (
                    <a
                      href={`tel:${c.alternativeNumber}`}
                      className="block font-mono text-sm text-blue-700 hover:underline"
                    >
                      {c.alternativeNumber}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}