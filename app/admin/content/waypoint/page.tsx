import Link from "next/link";
import { db } from "@/lib/db";
import { trailInfo, trailWaypoints } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";
import { deleteWaypoint } from "@/actions/admin-content-actions";
import { WaypointEditor } from "@/components/admin/waypoint-editor";

export default async function WaypointsAdminPage() {
  const [trail] = await db.select().from(trailInfo).limit(1);
  const waypoints = trail
    ? await db
        .select()
        .from(trailWaypoints)
        .where(eq(trailWaypoints.trailId, trail.id))
        .orderBy(asc(trailWaypoints.order))
    : [];

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/content" className="text-sm underline">
          ← Content
        </Link>
        <h1 className="text-2xl font-bold mt-2">Trail Waypoints</h1>
        <p className="text-gray-600 mt-1">
          Points along the trail with coordinates and descriptions.
        </p>
      </header>

      {!trail && (
        <p className="text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">
          Create Trail Information first.
        </p>
      )}

      {trail && (
        <>
          <WaypointEditor trailId={trail.id} />

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">
              Existing waypoints ({waypoints.length})
            </h2>
            {waypoints.length === 0 ? (
              <p className="text-gray-500 text-sm">None yet.</p>
            ) : (
              <ul className="space-y-3">
                {waypoints.map((wp) => (
                  <li key={wp.id} className="border rounded-lg">
                    <details>
                      <summary className="p-4 cursor-pointer flex items-center justify-between">
                        <div>
                          <span className="font-medium">{wp.name}</span>{" "}
                          <span className="text-xs text-gray-500">
                            · {wp.waypointType} · order {wp.order}
                          </span>
                        </div>
                        <div className="flex gap-3 text-sm">
                          <form action={deleteWaypoint} className="inline">
                            <input type="hidden" name="id" value={wp.id} />
                            <button className="text-red-600 hover:underline">
                              Delete
                            </button>
                          </form>
                        </div>
                      </summary>
                      <div className="p-4 border-t">
                        <WaypointEditor trailId={trail.id} waypoint={wp} />
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}