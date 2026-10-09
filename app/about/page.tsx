import { db } from "@/lib/db";
import { mountainInfo } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Mountain",
  description:
    "History, legends, and geography of Narangala Mountain — the Golden Mountain of Uva Province, Sri Lanka.",
};



export const revalidate = 3600;

export default async function AboutPage() {
  const [mountain] = await db
    .select()
    .from(mountainInfo)
    .where(eq(mountainInfo.isPublished, true))
    .limit(1);

  if (!mountain) notFound();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-bold">{mountain.name}</h1>
        <p className="text-gray-600 mt-1">
          {mountain.nickname} · {mountain.sinhalaName} · {mountain.tamilName}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Elevation" value={`${mountain.elevationMeters} m`} />
        <Stat label="District" value={mountain.district ?? ""} />
        <Stat label="Province" value={mountain.province ?? ""} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-700">{mountain.shortDescription}</p>
      </section>

      {mountain.fullDescription && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Full Description</h2>
          <div className="whitespace-pre-wrap text-gray-700">
            {mountain.fullDescription}
          </div>
        </section>
      )}

      {mountain.keyFeatures && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Key Features</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {mountain.keyFeatures.split(",").map((f, i) => (
              <li key={i}>{f.trim()}</li>
            ))}
          </ul>
        </section>
      )}

      {mountain.legendStory && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Legend</h2>
          <div className="whitespace-pre-wrap text-gray-700">
            {mountain.legendStory}
          </div>
        </section>
      )}

      {mountain.historicalSignificance && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Historical Significance</h2>
          <div className="whitespace-pre-wrap text-gray-700">
            {mountain.historicalSignificance}
          </div>
        </section>
      )}

      {mountain.nearbyTowns && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Nearby Towns</h2>
          <p className="text-gray-700">{mountain.nearbyTowns}</p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}