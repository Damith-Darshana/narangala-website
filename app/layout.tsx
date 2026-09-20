import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Explore Narangala Mountain",
  description:
    "Complete guide to hiking Narangala Mountain in Badulla, Sri Lanka.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="border-b bg-white sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4 gap-4 flex-wrap">
            <Link href="/" className="font-bold text-lg">
              Narangala
            </Link>
            <div className="flex gap-4 items-center text-sm flex-wrap">
              <Link href="/about">About</Link>
              <Link href="/trail">Trail</Link>
              <Link href="/weather">Weather</Link>
              <Link href="/services">Services</Link>
              <Link href="/gallery">Gallery</Link>
              <Link href="/emergency" className="text-red-600 font-medium">
                Emergency
              </Link>
              <Link href="/faq">FAQ</Link>
              <Link href="/blog">Blog</Link>
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="font-medium">
                    Dashboard
                  </Link>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({ redirectTo: "/" });
                    }}
                  >
                    <button type="submit" className="text-red-600">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">Login</Link>
                  <Link
                    href="/register"
                    className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}