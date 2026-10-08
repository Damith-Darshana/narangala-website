"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Props = {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  submitLabel?: string;
};

export function ContentFormShell({
  action,
  children,
  submitLabel = "Save",
}: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    try {
      await action(formData);
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children}
      {error && (
        <p className="text-red-600 text-sm border border-red-200 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-700 text-sm border border-green-200 bg-green-50 p-2 rounded">
          ✓ Saved
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  as,
  rows,
  step,
  maxLength,
  min,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  as?: "input" | "textarea";
  rows?: number;
  step?: string;
  maxLength?: number;
  min?:string;
  className?: string;
}) {
  const cls = `w-full border rounded px-3 py-2 ${className ?? ""}`;
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {as === "textarea" ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          rows={rows ?? 4}
          maxLength={maxLength}
          className={cls}
        />
      ) : (
        <input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          placeholder={placeholder}
          step={step}
          maxLength={maxLength}
          className={cls}
        />
      )}
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4"
      />
      {label}
    </label>
  );
}