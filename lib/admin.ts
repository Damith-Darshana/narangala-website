import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if ((session.user as any).role !== "ADMIN") redirect("/dashboard");
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return (session?.user as any)?.role === "ADMIN";
}