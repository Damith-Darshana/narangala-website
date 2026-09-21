import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/providers", label: "Providers" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/content", label: "Content" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 -mx-6 md:-mx-0">
      <aside className="md:sticky md:top-20 md:self-start md:max-h-[calc(100vh-6rem)] overflow-y-auto">
        <div className="px-6 md:px-0 mb-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Admin Panel
          </div>
        </div>
        <nav className="flex md:flex-col gap-2 overflow-x-auto px-6 md:px-0 pb-2 md:pb-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap px-3 py-2 rounded hover:bg-gray-100 text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="px-6 md:px-0 min-w-0">{children}</div>
    </div>
  );
}