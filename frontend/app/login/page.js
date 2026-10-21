"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell flex min-h-[calc(100vh-7rem)] items-center justify-center py-10">
      <div className="surface-card w-full max-w-md p-6 sm:p-8">
        <span className="eyebrow">Welcome back</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Sign in to continue</h1>
        <p className="mt-2 text-sm text-slate-600">Order your favorite meals and track every delivery in real time.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`input-shell ${error ? "border-red-300 focus:border-red-300 focus:ring-red-100" : ""}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`input-shell ${error ? "border-red-300 focus:border-red-300 focus:ring-red-100" : ""}`}
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-orange-600 transition hover:text-orange-700 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-orange-600 transition hover:text-orange-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
