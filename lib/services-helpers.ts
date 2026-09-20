import { db } from "@/lib/db";
import { serviceCategories } from "@/lib/schema";
import { asc, eq } from "drizzle-orm";

export async function getActiveCategories() {
  return db
    .select()
    .from(serviceCategories)
    .where(eq(serviceCategories.isActive, true))
    .orderBy(asc(serviceCategories.order));
}

export function formatLKR(amount: string | number | null): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  return `LKR ${n.toLocaleString("en-LK", { maximumFractionDigits: 2 })}`;
}

export const CONTACT_TYPE_LABELS: Record<string, string> = {
  police: "Police",
  hospital: "Hospital",
  ambulance: "Ambulance",
  mountain_rescue: "Mountain Rescue",
  fire: "Fire & Rescue",
  local_admin: "Local Administration",
};

export const CONTACT_TYPE_ICONS: Record<string, string> = {
  police: "🚔",
  hospital: "🏥",
  ambulance: "🚑",
  mountain_rescue: "🧗",
  fire: "🚒",
  local_admin: "🏛",
};

export const VERIFICATION_LABELS: Record<string, string> = {
  pending: "Pending Verification",
  verified: "Verified",
  rejected: "Rejected",
  suspended: "Suspended",
};

export function generateBookingId(): string {
  const d = new Date();
  const dateStr =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `NRG${dateStr}${rand}`;
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled_by_user: "Cancelled by you",
  cancelled_by_provider: "Cancelled by provider",
  no_show: "No show",
};

export const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled_by_user: "bg-gray-100 text-gray-700",
  cancelled_by_provider: "bg-red-100 text-red-800",
  no_show: "bg-red-100 text-red-800",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Payment pending",
  partial: "Partially paid",
  paid: "Paid",
  refunded: "Refunded",
};