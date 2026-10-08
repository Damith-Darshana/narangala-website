"use client";

import { deleteWeather } from "@/actions/admin-content-actions";

export function DeleteWeatherButton({ id }: { id: string | number }) {
  return (
    <form action={deleteWeather} className="inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => e.stopPropagation()}
        className="text-red-600 hover:underline text-xs"
      >
        Delete
      </button>
    </form>
  );
}