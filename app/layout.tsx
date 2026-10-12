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
        <nav className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
            <Link href="/" className="group flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground shadow-sm">N</span>
              <span>
                <span className="block text-sm font-bold tracking-tight text-foreground">Narangala</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Golden Mountain</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden items-center gap-1 text-sm md:flex">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-full px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
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
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
