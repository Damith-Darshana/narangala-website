import Script from "next/script";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { MobileNav } from "@/components/mobile-nav";
const inter = Inter({ subsets: ["latin"] });

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/trail", label: "Trail" },
  { href: "/weather", label: "Weather" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/emergency", label: "Emergency" },
  { href: "/faq", label: "FAQ" },
  { href: "/blog", label: "Blog" },
];


export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://narangala.pages.dev"
  ),
  title: {
    default: "Explore Narangala Mountain — The Golden Mountain of Sri Lanka",
    template: "%s | Explore Narangala",
  },
  description:
    "Complete guide to hiking Narangala Mountain in Badulla, Sri Lanka. Trail maps, weather, local services, photo gallery, and the legend of King Walagamba's hidden gold.",
  keywords: [
    "Narangala",
    "Narangala Mountain",
    "Badulla hiking",
    "Uva Province",
    "Sri Lanka hiking",
    "Golden Mountain",
    "Thanga-malai",
  ],
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: "/",
    siteName: "Explore Narangala",
    title: "Explore Narangala Mountain — The Golden Mountain of Sri Lanka",
    description:
      "Complete guide to hiking Narangala Mountain in Badulla, Sri Lanka.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Narangala Mountain",
    description:
      "Complete guide to hiking Narangala Mountain in Badulla, Sri Lanka.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
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
        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <nav className="border-b bg-white sticky top-0 z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="font-bold text-lg">
              Narangala
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex gap-4 items-center text-sm">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              {session?.user ? (
                <>
                  {(session.user as any).role === "ADMIN" && (
                    <Link href="/admin" className="font-medium text-purple-700">
                      Admin
                    </Link>
                  )}
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

            {/* Mobile hamburger */}
            <MobileNav
              links={NAV_LINKS}
              session={
                session?.user
                  ? { user: { name: session.user.name, role: (session.user as any).role } }
                  : null
              }
            />
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}