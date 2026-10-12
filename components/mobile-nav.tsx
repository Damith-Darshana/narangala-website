
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav({
  links,
  session,
}: {
  links: { href: string; label: string }[];
  session: { user?: { name?: string | null; role?: string } } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="-mr-2 rounded-full border border-border bg-card p-2 text-foreground shadow-sm"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed inset-0 top-[73px] z-50 overflow-y-auto bg-background/95 backdrop-blur-xl">
          <nav className="flex flex-col gap-1 p-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-3 rounded hover:bg-gray-100 text-base"
              >
                {link.label}
              </Link>
            ))}

            <div className="border-t pt-3 mt-3 space-y-1">
              {session?.user ? (
                <>
                  {session.user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setOpen(false)}
                      className="block px-3 py-3 rounded hover:bg-gray-100 text-purple-700 font-medium"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded hover:bg-gray-100 font-medium"
                  >
                    Dashboard
                  </Link>
                  <form
                    action="/api/auth/signout"
                    method="post"
                    className="px-3 py-3"
                  >
                    <button
                      type="submit"
                      className="text-red-600 text-left w-full"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-3 rounded bg-black text-white text-center"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
