import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {session.user.name || session.user.email}</p>
      <p className="text-sm text-gray-600">
        Role: {(session.user as any).role}
      </p>
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/dashboard/gallery"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          My Photos
        </Link>
        <Link
          href="/dashboard/bookings"
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          My Bookings
        </Link>
        {(session.user as any).role === "PROVIDER" && (
          <Link
            href="/provider"
            className="border px-4 py-2 rounded hover:bg-gray-50"
          >
            Provider Dashboard
          </Link>
        )}
        <Link
          href="/provider/register"
          className="border px-4 py-2 rounded hover:bg-gray-50"
        >
          Become a Provider
        </Link>
      </div>
    </div>


  );
}