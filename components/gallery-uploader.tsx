"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { useRouter } from "next/navigation";

type UploadState = {
  file: File;
  status: "compressing" | "uploading" | "saving" | "done" | "error";
  progress: number;
  error?: string;
};

export function GalleryUploader({ remaining }: { remaining: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadState[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files).slice(0, remaining - uploads.filter(u => u.status === "done").length);

    for (const file of list) {
      await processOne(file);
    }

    setTitle("");
    setDescription("");
    router.refresh();
  }

  async function processOne(file: File) {
    const state: UploadState = { file, status: "compressing", progress: 0 };
    setUploads((prev) => [...prev, state]);

    const update = (patch: Partial<UploadState>) =>
      setUploads((prev) =>
        prev.map((u) => (u.file === file ? { ...u, ...patch } : u))
      );

    try {
      // 1. Compress in-browser
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: "image/webp",
        initialQuality: 0.82,
      });

      update({ status: "uploading", progress: 10 });

      // 2. Get pre-signed URL
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: compressed.type }),
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || "Presign failed");
      }

      const { uploadUrl, key } = await presignRes.json();

      // 3. Upload directly to R2 (does NOT touch our server)
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": compressed.type },
        body: compressed,
      });

      if (!putRes.ok) throw new Error("Direct upload to R2 failed");

      update({ status: "saving", progress: 90 });

      // 4. Get image dimensions
      const { width, height } = await getImageDimensions(compressed);

      // 5. Save metadata
      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          title,
          description,
          width,
          height,
          sizeBytes: compressed.size,
        }),
      });

      if (!confirmRes.ok) throw new Error("Saving metadata failed");

      update({ status: "done", progress: 100 });
    } catch (err) {
      update({
        status: "error",
        progress: 0,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  if (remaining <= 0) {
    return (
      <div className="border rounded p-4 bg-gray-50 text-sm text-gray-600">
        You've reached the 5-photo limit. Delete a photo to upload more.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="font-medium">Click to select photos</p>
        <p className="text-sm text-gray-500 mt-1">
          {remaining} upload{remaining !== 1 ? "s" : ""} remaining · compressed
          in your browser before upload
        </p>
      </div>

      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((u, i) => (
            <li
              key={i}
              className="border rounded p-3 flex items-center justify-between text-sm"
            >
              <div className="truncate flex-1 mr-3">
                {u.file.name}{" "}
                <span className="text-gray-500">
                  ({(u.file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    u.status === "done"
                      ? "text-green-600"
                      : u.status === "error"
                        ? "text-red-600"
                        : "text-blue-600"
                  }
                >
                  {u.status === "done" && "✓ Done"}
                  {u.status === "error" && `✗ ${u.error}`}
                  {u.status === "compressing" && "Compressing…"}
                  {u.status === "uploading" && "Uploading…"}
                  {u.status === "saving" && "Saving…"}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getImageDimensions(file: File | Blob): Promise<{
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image"));
    };
    img.src = url;
  });
}