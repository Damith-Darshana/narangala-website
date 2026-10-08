"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProviderAdmin } from "@/actions/admin-provider-actions";
import type { ServiceProvider, ServiceCategory } from "@/lib/schema";

export function ProviderEditForm({
  provider,
  categories,
}: {
  provider: ServiceProvider;
  categories: ServiceCategory[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await updateProviderAdmin(formData);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <input type="hidden" name="id" value={provider.id} />

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Business name" name="businessName" defaultValue={provider.businessName} required />
        <Field label="Owner name" name="ownerName" defaultValue={provider.ownerName} required />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Phone" name="phoneNumber" defaultValue={provider.phoneNumber} required />
        <Field label="Alt phone" name="alternativePhone" defaultValue={provider.alternativePhone ?? ""} />
      </div>

      <Field label="Email" name="email" type="email" defaultValue={provider.email ?? ""} />

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="categoryId"
          defaultValue={provider.categoryId}
          required
          className="w-full border rounded px-3 py-2"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <Field label="Address" name="address" defaultValue={provider.address} required />
      <Field label="Service area" name="serviceArea" defaultValue={provider.serviceArea ?? ""} required />

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={provider.description}
          required
          rows={4}
          minLength={20}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Price per unit (LKR)"
          name="pricePerUnit"
          type="number"
          step="0.01"
          min="0"
          defaultValue={provider.pricePerUnit ?? "0"}
          required
        />
        <Field
          label="Price description"
          name="priceDescription"
          defaultValue={provider.priceDescription ?? ""}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Max capacity"
          name="maxCapacity"
          type="number"
          min="0"
          defaultValue={provider.maxCapacity?.toString() ?? ""}
        />
        <Field
          label="Current inventory"
          name="currentInventory"
          type="number"
          min="0"
          defaultValue={provider.currentInventory?.toString() ?? ""}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked={provider.isAvailable}
          className="w-4 h-4"
        />
        Currently accepting bookings
      </label>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        step={step}
        min={min}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}