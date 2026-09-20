"use client";

import { useActionState, useEffect, useState } from "react";
import { createReview, type ReviewState } from "@/actions/review-actions";

const initialState: ReviewState = {};

export function ReviewForm({ providerId }: { providerId: string }) {
  const [state, formAction, isPending] = useActionState(
    createReview,
    initialState
  );
  const [rating, setRating] = useState(5);

  if (state.success) {
    return (
      <div className="border rounded-lg p-4 bg-green-50 text-sm">
        ✓ Review submitted. It will appear once approved by an admin.
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="border rounded-lg p-4 space-y-3 bg-gray-50"
    >
      <h3 className="font-semibold">Leave a review</h3>
      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <label className="block text-sm font-medium mb-1">Rating</label>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={n <= rating ? "text-amber-500" : "text-gray-300"}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Comment</label>
        <textarea
          name="comment"
          required
          minLength={5}
          rows={3}
          className="w-full border rounded px-3 py-2"
          placeholder="Share your experience..."
        />
      </div>

      {state.error && <p className="text-red-600 text-sm">{state.error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Submit review"}
      </button>
    </form>
  );
}