"use client";

import { saveWaypoint } from "@/actions/admin-content-actions";
import {
  ContentFormShell,
  Field,
} from "@/components/admin/content-form-shell";
import type { TrailWaypoint } from "@/lib/schema";

const TYPES = [
  { value: "start", label: "Trailhead start" },
  { value: "checkpoint", label: "Checkpoint" },
  { value: "viewpoint", label: "Viewpoint" },
  { value: "cave", label: "Cave / historical site" },
  { value: "rest_area", label: "Rest area" },
  { value: "summit", label: "Summit" },
  { value: "end", label: "End point" },
];

export function WaypointEditor({
  trailId,
  waypoint,
}: {
  trailId: string;
  waypoint?: TrailWaypoint;
}) {
  return (
    <ContentFormShell
      action={saveWaypoint}
      submitLabel={waypoint ? "Save waypoint" : "Add waypoint"}
    >
      <input type="hidden" name="trailId" value={trailId} />
      {waypoint && <input type="hidden" name="id" value={waypoint.id} />}

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Name"
          name="name"
          defaultValue={waypoint?.name ?? ""}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            name="waypointType"
            defaultValue={waypoint?.waypointType ?? "checkpoint"}
            className="w-full border rounded px-3 py-2"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Field
        label="Description"
        name="description"
        as="textarea"
        rows={3}
        defaultValue={waypoint?.description ?? ""}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Latitude"
          name="latitude"
          type="number"
          step="0.0000001"
          defaultValue={waypoint?.latitude ?? ""}
          required
        />
        <Field
          label="Longitude"
          name="longitude"
          type="number"
          step="0.0000001"
          defaultValue={waypoint?.longitude ?? ""}
          required
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Field
          label="Altitude (m)"
          name="altitudeMeters"
          type="number"
          step="0.01"
          defaultValue={waypoint?.altitudeMeters ?? ""}
        />
        <Field
          label="Distance from start (km)"
          name="distanceFromStartKm"
          type="number"
          step="0.01"
          defaultValue={waypoint?.distanceFromStartKm ?? ""}
        />
        <Field
          label="Est. minutes from start"
          name="estimatedTimeFromStartMinutes"
          type="number"
          defaultValue={waypoint?.estimatedTimeFromStartMinutes ?? ""}
        />
        <Field
          label="Order"
          name="order"
          type="number"
          defaultValue={waypoint?.order ?? 0}
        />
      </div>
    </ContentFormShell>
  );
}