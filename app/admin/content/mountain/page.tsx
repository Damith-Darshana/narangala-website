import Link from "next/link";
import { db } from "@/lib/db";
import { mountainInfo } from "@/lib/schema";
import { saveMountainInfo } from "@/actions/admin-content-actions";
import { ContentFormShell, Field } from "@/components/admin/content-form-shell";

export default async function MountainInfoAdminPage() {
  const [mountain] = await db.select().from(mountainInfo).limit(1);

  return (
    <div className="space-y-6">
      <header>
        <Link href="/admin/content" className="text-sm underline">
          ← Content
        </Link>
        <h1 className="text-2xl font-bold mt-2">Mountain Information</h1>
        <p className="text-gray-600 mt-1">
          The main description shown on the About page.
        </p>
      </header>

      <ContentFormShell action={saveMountainInfo}>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Name" name="name" defaultValue={mountain?.name ?? "Narangala"} required />
          <Field label="Tamil name" name="tamilName" defaultValue={mountain?.tamilName ?? ""} />
          <Field label="Sinhala name" name="sinhalaName" defaultValue={mountain?.sinhalaName ?? ""} />
        </div>

        <Field
          label="Nickname"
          name="nickname"
          defaultValue={mountain?.nickname ?? ""}
          placeholder="e.g., Golden Mountain"
        />

        <div className="grid gap-3 md:grid-cols-3">
          <Field
            label="Elevation (meters)"
            name="elevationMeters"
            type="number"
            step="0.01"
            defaultValue={mountain?.elevationMeters ?? "1527.00"}
            required
          />
          <Field
            label="Latitude"
            name="coordinatesLat"
            type="number"
            step="0.0000001"
            defaultValue={mountain?.coordinatesLat ?? ""}
          />
          <Field
            label="Longitude"
            name="coordinatesLon"
            type="number"
            step="0.0000001"
            defaultValue={mountain?.coordinatesLon ?? ""}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="District" name="district" defaultValue={mountain?.district ?? "Badulla"} />
          <Field label="Province" name="province" defaultValue={mountain?.province ?? "Uva Province"} />
        </div>

        <Field
          label="Nearby towns (comma-separated)"
          name="nearbyTowns"
          defaultValue={mountain?.nearbyTowns ?? ""}
        />

        <Field
          label="Short description (max 300 chars)"
          name="shortDescription"
          as="textarea"
          rows={2}
          maxLength={300}
          defaultValue={mountain?.shortDescription ?? ""}
        />

        <Field
          label="Full description"
          name="fullDescription"
          as="textarea"
          rows={10}
          defaultValue={mountain?.fullDescription ?? ""}
        />

        <Field
          label="Key features (comma-separated)"
          name="keyFeatures"
          as="textarea"
          rows={3}
          defaultValue={mountain?.keyFeatures ?? ""}
        />

        <Field
          label="Legend story"
          name="legendStory"
          as="textarea"
          rows={8}
          defaultValue={mountain?.legendStory ?? ""}
        />

        <Field
          label="Historical significance"
          name="historicalSignificance"
          as="textarea"
          rows={5}
          defaultValue={mountain?.historicalSignificance ?? ""}
        />

        <Field
          label="Religious significance"
          name="religiousSignificance"
          as="textarea"
          rows={5}
          defaultValue={mountain?.religiousSignificance ?? ""}
        />

        <fieldset className="border rounded p-4 space-y-3">
          <legend className="text-sm font-medium px-2">SEO</legend>
          <Field
            label="Meta title"
            name="metaTitle"
            maxLength={150}
            defaultValue={mountain?.metaTitle ?? ""}
          />
          <Field
            label="Meta description"
            name="metaDescription"
            as="textarea"
            rows={2}
            maxLength={300}
            defaultValue={mountain?.metaDescription ?? ""}
          />
          <Field
            label="Meta keywords"
            name="metaKeywords"
            maxLength={200}
            defaultValue={mountain?.metaKeywords ?? ""}
          />
        </fieldset>
      </ContentFormShell>
    </div>
  );
}