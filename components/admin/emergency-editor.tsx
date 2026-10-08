"use client";

import { saveEmergencyContact } from "@/actions/admin-content-actions";
import {
  ContentFormShell,
  Field,
  CheckboxField,
} from "@/components/admin/content-form-shell";
import type { EmergencyContact } from "@/lib/schema";

const TYPES = [
  "police",
  "hospital",
  "ambulance",
  "mountain_rescue",
  "fire",
  "local_admin",
];

export function EmergencyEditor({ existing }: { existing?: EmergencyContact }) {
  return (
    <ContentFormShell
      action={saveEmergencyContact}
      submitLabel={existing ? "Save contact" : "Add contact"}
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Name"
          name="name"
          defaultValue={existing?.name ?? ""}
          required
        />
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <select
            name="contactType"
            defaultValue={existing?.contactType ?? "police"}
            className="w-full border rounded px-3 py-2"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Phone number"
          name="phoneNumber"
          defaultValue={existing?.phoneNumber ?? ""}
          required
        />
        <Field
          label="Alternative number"
          name="alternativeNumber"
          defaultValue={existing?.alternativeNumber ?? ""}
        />
      </div>

      <Field
        label="Location"
        name="location"
        defaultValue={existing?.location ?? ""}
      />

      <Field
        label="Notes"
        name="notes"
        as="textarea"
        rows={2}
        defaultValue={existing?.notes ?? ""}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Order"
          name="order"
          type="number"
          defaultValue={existing?.order ?? 0}
        />
        <div className="flex items-end">
          <CheckboxField
            label="Active"
            name="isActive"
            defaultChecked={existing?.isActive ?? true}
          />
        </div>
      </div>
    </ContentFormShell>
  );
}