"use client";

import { saveFaq } from "@/actions/admin-content-actions";
import {
  ContentFormShell,
  Field,
  CheckboxField,
} from "@/components/admin/content-form-shell";
import type { FAQ } from "@/lib/schema";

const CATEGORIES = [
  "general",
  "hiking",
  "transport",
  "safety",
  "accommodation",
  "food",
  "permits",
];

export function FaqEditor({ existing }: { existing?: FAQ }) {
  return (
    <ContentFormShell
      action={saveFaq}
      submitLabel={existing ? "Save FAQ" : "Add FAQ"}
    >
      {existing && <input type="hidden" name="id" value={existing.id} />}

      <Field
        label="Question"
        name="question"
        defaultValue={existing?.question ?? ""}
        required
      />

      <Field
        label="Answer"
        name="answer"
        as="textarea"
        rows={5}
        defaultValue={existing?.answer ?? ""}
        required
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            defaultValue={existing?.category ?? "general"}
            className="w-full border rounded px-3 py-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Order"
          name="order"
          type="number"
          defaultValue={existing?.order ?? 0}
        />
        <div className="flex items-end">
          <CheckboxField
            label="Published"
            name="isPublished"
            defaultChecked={existing?.isPublished ?? true}
          />
        </div>
      </div>
    </ContentFormShell>
  );
}