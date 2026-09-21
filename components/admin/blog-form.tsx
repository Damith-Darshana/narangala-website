"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createBlogPost,
  updateBlogPost,
  type BlogFormState,
} from "@/actions/admin-blog-actions";
import { slugify } from "@/lib/utils";
import type { BlogPost } from "@/lib/schema";

const initialState: BlogFormState = {};

export function BlogForm({
  mode,
  post,
}: {
  mode: "create" | "edit";
  post?: BlogPost;
}) {
  const router = useRouter();
  const action =
    mode === "edit" && post
      ? updateBlogPost.bind(null, post.id)
      : createBlogPost;
  const [state, formAction, isPending] = useActionState(action, initialState);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post);

  useEffect(() => {
    if (!slugTouched && mode === "create") {
      setSlug(slugify(title));
    }
  }, [title, slugTouched, mode]);

  return (
    <form action={formAction} className="space-y-4 max-w-3xl">
      <Field
        label="Title"
        name="title"
        value={title}
        onChange={setTitle}
        required
      />
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          required
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className="w-full border rounded px-3 py-2 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          URL: /blog/{slug || "your-slug"}
        </p>
      </div>

      <Field
        label="Excerpt (shown on listing page)"
        name="excerpt"
        defaultValue={post?.excerpt}
        required
        as="textarea"
        rows={2}
        maxLength={300}
      />

      <Field
        label="Content (markdown supported)"
        name="content"
        defaultValue={post?.content}
        required
        as="textarea"
        rows={20}
        className="font-mono text-sm"
      />

      <div className="grid gap-3 md:grid-cols-2">
        <Field
          label="Author"
          name="author"
          defaultValue={post?.author ?? "Narangala Admin"}
          required
        />
        <Field
          label="Categories (comma-separated)"
          name="categories"
          defaultValue={post?.categories ?? ""}
        />
      </div>

      <Field
        label="Tags (comma-separated)"
        name="tags"
        defaultValue={post?.tags ?? ""}
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={post?.isPublished ?? false}
          className="w-4 h-4"
        />
        Publish immediately
      </label>

      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending
            ? "Saving…"
            : mode === "create"
              ? "Create post"
              : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  value,
  defaultValue,
  onChange,
  as,
  rows,
  maxLength,
  className,
  required,
}: {
  label: string;
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  as?: "input" | "textarea";
  rows?: number;
  maxLength?: number;
  className?: string;
  required?: boolean;
}) {
  const baseCls = `w-full border rounded px-3 py-2 ${className ?? ""}`;
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {as === "textarea" ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={rows ?? 4}
          maxLength={maxLength}
          required={required}
          className={baseCls}
        />
      ) : (
        <input
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          maxLength={maxLength}
          required={required}
          className={baseCls}
        />
      )}
    </div>
  );
}