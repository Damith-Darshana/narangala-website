"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { registerUser, type RegisterState } from "@/actions/auth-actions";

const initialState: RegisterState = {};

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState
  );

  useEffect(() => {
    if (state.success) router.push("/login");
  }, [state.success, router]);

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <form action={formAction} className="space-y-3">
        <input
          name="firstName"
          placeholder="First name"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="lastName"
          placeholder="Last name"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 8 chars)"
          required
          className="w-full border rounded px-3 py-2"
        />
        {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
          {isPending ? "Creating…" : "Register"}
        </button>
      </form>
      <p className="text-sm mt-4 text-center">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
}