"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBooking, type CreateBookingState } from "@/actions/booking-actions";

const initialState: CreateBookingState = {};

export function BookingForm({
  providerId,
  pricePerUnit,
  priceDescription,
  maxCapacity,
  serviceType,
}: {
  providerId: string;
  pricePerUnit: string | null;
  priceDescription: string | null;
  maxCapacity: number | null;
  serviceType: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createBooking,
    initialState
  );

  useEffect(() => {
    if (state.success && state.bookingId) {
      router.push("/dashboard/bookings");
    }
  }, [state.success, state.bookingId, router]);

  const price = pricePerUnit ? parseFloat(pricePerUnit) : 0;

  return (
    <form action={formAction} className="space-y-4 border rounded-lg p-4">
      <h3 className="font-semibold text-lg">Request Booking</h3>

      <input type="hidden" name="providerId" value={providerId} />
      <input type="hidden" name="serviceType" value={serviceType} />
      <input type="hidden" name="totalAmount" value={price.toFixed(2)} />

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="bookingDate"
            required
            min={new Date().toISOString().slice(0, 10)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            name="bookingTime"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      {maxCapacity !== null && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of people / quantity (max {maxCapacity})
          </label>
          <input
            type="number"
            min={1}
            max={maxCapacity}
            defaultValue={1}
            className="w-full border rounded px-3 py-2"
            onChange={(e) => {
              const qty = parseInt(e.target.value || "1", 10);
              const total = price * qty;
              const input = e.currentTarget
                .form?.elements.namedItem("totalAmount") as HTMLInputElement;
              if (input) input.value = total.toFixed(2);
            }}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Notes for the provider (optional)
        </label>
        <textarea
          name="userNotes"
          rows={3}
          className="w-full border rounded px-3 py-2"
          placeholder="Any special requests, pickup location, etc."
        />
      </div>

      <div className="bg-gray-50 border rounded p-3 text-sm">
        <div className="flex justify-between">
          <span>Total amount</span>
          <span className="font-semibold">
            LKR {price.toLocaleString()}
            {priceDescription ? ` ${priceDescription}` : ""}
          </span>
        </div>
        <div className="flex justify-between text-gray-500 mt-1">
          <span>Deposit</span>
          <span>LKR 0 (pay provider directly)</span>
        </div>
      </div>

      {state.error && (
        <p className="text-red-600 text-sm">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
      >
        {isPending ? "Submitting…" : "Request booking"}
      </button>

      <p className="text-xs text-gray-500">
        The provider will confirm your request. You'll see the status in your
        dashboard. Payment is handled directly with the provider.
      </p>
    </form>
  );
}