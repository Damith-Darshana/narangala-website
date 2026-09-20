import { db } from "@/lib/db";
import { trailInfo, trailWaypoints } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export const revalidate = 300;

const waypointIcons: Record<string, string> = {
  start: "🚩",
  checkpoint: "📍",
  viewpoint: "👁",
  cave: "🕳",
  rest_area: "🪑",
  summit: "⛰",
  end: "🏁",
};

export default async function TrailPage() {
  const [trail] = await db.select().from(trailInfo).limit(1);
  if (!trail) notFound();

  const waypoints = await db
    .select()
    .from(trailWaypoints)
    .where(eq(trailWaypoints.trailId, trail.id))
    .orderBy(asc(trailWaypoints.order));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">{trail.name}</h1>
        <p className="text-gray-600 mt-1">
          Trailhead: {trail.trailheadLocation}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Stat label="Distance" value={`${trail.distanceKm} km`} />
        <Stat
          label="Round Trip"
          value={`${trail.fullRoundTripHours} hrs`}
        />
        <Stat
          label="Difficulty"
          value={`${trail.difficulty} (${trail.difficultyRating}/10)`}
        />
        <Stat label="Ascent" value={`${trail.ascentMeters} m`} />
        <Stat label="Best Months" value={`${trail.bestMonthsStart}–${trail.bestMonthsEnd}`} />
        <Stat
          label="Guide Required"
          value={trail.requiresGuide ? "Yes" : "No"}
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Waypoints</h2>
        <ol className="space-y-3">
          {waypoints.map((wp) => (
            <li
              key={wp.id}
              className="border rounded-lg p-4 flex gap-4 items-start"
            >
              <span className="text-2xl">
                {waypointIcons[wp.waypointType] ?? "•"}
              </span>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold">{wp.name}</h3>
                  <span className="text-sm text-gray-500">
                    {wp.distanceFromStartKm} km · {wp.altitudeMeters} m
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{wp.description}</p>
                {wp.estimatedTimeFromStartMinutes !== null && (
                  <p className="text-xs text-gray-500 mt-1">
                    ~{wp.estimatedTimeFromStartMinutes} min from start
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {trail.safetyTips && (
        <section className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
          <h2 className="font-semibold mb-2">Safety Tips</h2>
          <div className="whitespace-pre-wrap text-sm">{trail.safetyTips}</div>
        </section>
      )}

      {trail.waterAvailability && (
        <section>
          <h2 className="font-semibold mb-1">Water Availability</h2>
          <p className="text-sm">{trail.waterAvailability}</p>
        </section>
      )}

      {trail.mobileCoverage && (
        <section>
          <h2 className="font-semibold mb-1">Mobile Coverage</h2>
          <p className="text-sm">{trail.mobileCoverage}</p>
        </section>
      )}

      {trail.emergencyNotes && (
        <section className="border-l-4 border-red-500 bg-red-50 p-4">
          <h2 className="font-semibold mb-2">Emergency Information</h2>
          <div className="whitespace-pre-wrap text-sm">
            {trail.emergencyNotes}
          </div>
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