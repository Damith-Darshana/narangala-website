import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { updateUserRole, toggleUserStatus } from "@/actions/admin-user-actions";

export default async function AdminUsersPage() {
  const all = await db.select().from(users).orderBy(desc(users.createdAt));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-gray-600 mt-1">{all.length} total</p>
      </header>

      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Joined</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {all.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="p-3">
                  {u.firstName} {u.lastName}
                </td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">
                  <form
                    action={updateUserRole}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="id" value={u.id} />
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      <option value="TOURIST">TOURIST</option>
                      <option value="PROVIDER">PROVIDER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button
                      type="submit"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Save
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      u.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {u.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <form action={toggleUserStatus}>
                    <input type="hidden" name="id" value={u.id} />
                    <button
                      type="submit"
                      className={`text-xs hover:underline ${
                        u.isActive ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}