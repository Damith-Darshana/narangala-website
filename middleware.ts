import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isDashboard = path.startsWith("/dashboard");
  const isProviderArea = path.startsWith("/provider");
  const isAdminArea = path.startsWith("/admin");

  if ((isDashboard || isProviderArea || isAdminArea) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/provider/:path*", "/admin/:path*"],
};