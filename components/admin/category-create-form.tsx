"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { slugify } from "@/lib/utils";

export function CategoryCreateForm({
  action,
}: {
  action: (
    prev: { error?: string },
    formData: FormData
  ) => Promise<{ error?: string }>;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(action, {});
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched) setSlug(slugify(name));
  }, [name, touched]);

  useEffect(() => {
    if (!state.error && !isPending) {
      formRef.current?.reset();
      setName("");
      setSlug("");
      setTouched(false);
    }
  }, [state, isPending]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Icon (emoji)</label>
          <input
            name="icon"
            placeholder="🛺"
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setTouched(true);
          }}
          required
          className="w-full border rounded px-3 py-2 font-mono text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea          name="description"
          rows={2}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Order</label>
        <input
          name="order"
          type="number"
          defaultValue={0}
          className="w-24 border rounded px-3 py-2"
        />
      </div>

      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Creating…" : "Create category"}
      </button>
    </form>
  );
}