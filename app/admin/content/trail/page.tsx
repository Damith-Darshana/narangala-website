import Link from "next/link";
import { db } from "@/lib/db";
import { trailInfo } from "@/lib/schema";
import { saveTrailInfo } from "@/actions/admin-content-actions";
import {
  ContentFormShell,
  Field,
  CheckboxField,
} from "@/components/admin/content-form-shell";

export default async function TrailInfoAdminPage() {
  const [trail] = await db.select().from(trailInfo).limit(1);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/content" className="text-sm underline">
          ← Content
        </Link>
        <h1 className="text-2xl font-bold mt-2">Trail Information</h1>
      </header>

      <ContentFormShell action={saveTrailInfo}>
        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Trail name"
            name="name"
            defaultValue={trail?.name ?? "Main Trail to Narangala Summit"}
            required
          />
          <Field
            label="Trailhead location"
            name="trailheadLocation"
            defaultValue={trail?.trailheadLocation ?? ""}
            required
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field
            label="Trailhead altitude (m)"
            name="trailheadAltitude"
            type="number"
            step="0.01"
            defaultValue={trail?.trailheadAltitude ?? ""}
          />
          <Field
            label="Distance (km)"
            name="distanceKm"
            type="number"
            step="0.01"
            defaultValue={trail?.distanceKm ?? "3.00"}
            required
          />
          <Field
            label="Difficulty rating (1-10)"
            name="difficultyRating"
            type="number"
            min="1"
            defaultValue={trail?.difficultyRating ?? 5}
            required
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Ascent (m)"
            name="ascentMeters"
            type="number"
            step="0.01"
            defaultValue={trail?.ascentMeters ?? ""}
          />
          <Field
            label="Descent (m)"
            name="descentMeters"
            type="number"
            step="0.01"
            defaultValue={trail?.descentMeters ?? ""}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field
            label="Ascent time (hours)"
            name="avgAscentTimeHours"
            type="number"
            step="0.1"
            defaultValue={trail?.avgAscentTimeHours ?? "1.5"}
            required
          />
          <Field
            label="Descent time (hours)"
            name="avgDescentTimeHours"
            type="number"
            step="0.1"
            defaultValue={trail?.avgDescentTimeHours ?? "1.0"}
            required
          />
          <Field
            label="Round trip (hours)"
            name="fullRoundTripHours"
            type="number"
            step="0.1"
            defaultValue={trail?.fullRoundTripHours ?? "2.5"}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            name="difficulty"
            defaultValue={trail?.difficulty ?? "moderate"}
            className="w-full border rounded px-3 py-2"
          >
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Trail type"
            name="trailType"
            defaultValue={trail?.trailType ?? "Out & Back"}
          />
          <Field
            label="Surface type"
            name="surfaceType"
            defaultValue={trail?.surfaceType ?? ""}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Best months start (1-12)"
            name="bestMonthsStart"
            type="number"
            min="1"
            defaultValue={trail?.bestMonthsStart ?? 12}
          />
          <Field
            label="Best months end (1-12)"
            name="bestMonthsEnd"
            type="number"
            min="1"
            defaultValue={trail?.bestMonthsEnd ?? 3}
          />
        </div>

        <Field
          label="Best time of day"
          name="bestTimeOfDay"
          defaultValue={trail?.bestTimeOfDay ?? ""}
        />

        <div className="flex gap-6">
          <CheckboxField
            label="Requires guide"
            name="requiresGuide"
            defaultChecked={trail?.requiresGuide ?? false}
          />
          <CheckboxField
            label="Requires permit"
            name="requiresPermit"
            defaultChecked={trail?.requiresPermit ?? false}
          />
        </div>

        <Field
          label="Permit info"
          name="permitInfo"
          as="textarea"
          rows={2}
          defaultValue={trail?.permitInfo ?? ""}
        />

        <Field
          label="Safety tips (one per line)"
          name="safetyTips"
          as="textarea"
          rows={10}
          defaultValue={trail?.safetyTips ?? ""}
        />

        <Field
          label="Emergency notes"
          name="emergencyNotes"
          as="textarea"
          rows={8}
          defaultValue={trail?.emergencyNotes ?? ""}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Water availability"
            name="waterAvailability"
            defaultValue={trail?.waterAvailability ?? ""}
          />
          <Field
            label="Mobile coverage"
            name="mobileCoverage"
            defaultValue={trail?.mobileCoverage ?? ""}
          />
        </div>
      </ContentFormShell>
    </div>
  );
}