"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  registerAsProvider,
  type ProviderRegisterState,
} from "@/actions/provider-actions";

const initialState: ProviderRegisterState = {};

export function ProviderRegisterForm({
  categories,
}: {
  categories: { id: string; name: string; icon: string | null }[];
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    registerAsProvider,
    initialState
  );

  useEffect(() => {
    if (state.success) router.push("/provider");
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Business name" name="businessName" required />
        <Field label="Owner name" name="ownerName" required />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Phone number"
          name="phoneNumber"
          required
          placeholder="+94771234567"
        />
        <Field label="Alternative phone" name="alternativePhone" />
      </div>

      <Field label="Email" name="email" type="email" />

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          name="categoryId"
          required
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      <Field label="Address" name="address" required />
      <Field
        label="Service area"
        name="serviceArea"
        required
        placeholder="e.g., Keenakele, Badulla, Ella"
      />

      <div>
        <label className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          name="description"
          required
          rows={4}
          minLength={20}
          className="w-full border rounded px-3 py-2"
          placeholder="Describe your service, experience, and what makes you a good choice."
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Price per unit (LKR)"
          name="pricePerUnit"
          type="number"
          required
          step="0.01"
          min="0"
        />
        <Field
          label="Price description"
          name="priceDescription"
          placeholder="e.g., per trip, per day, per tent"
        />
      </div>

      <Field
        label="Max capacity (optional)"
        name="maxCapacity"
        type="number"
        min="0"
      />

      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Submitting application…" : "Submit application"}
      </button>

      <p className="text-xs text-gray-500">
        Applications are reviewed within a few days. You'll be able to manage
        bookings once approved.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  step,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  step?: string;
  min?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        className="w-full border rounded px-3 py-2"
      />
    </div>
  );
}