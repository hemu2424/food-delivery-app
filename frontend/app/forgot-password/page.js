"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRequestCode(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await forgotPassword(email);
      showToast("If that email exists, a reset code has been sent.");
      setStep("reset");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await resetPassword(email, otp, newPassword);
      showToast("Password reset! Please log in with your new password.");
      router.push("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="app-shell flex min-h-[calc(100vh-7rem)] items-center justify-center py-10">
      <div className="surface-card w-full max-w-md p-6 sm:p-8">
        {step === "email" && (
          <>
            <span className="eyebrow">Reset access</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Forgot password?</h1>
            <p className="mt-2 text-sm text-slate-600">Enter your email and we&apos;ll send you a reset code.</p>

            <form onSubmit={handleRequestCode} className="mt-6 space-y-4">
              <input
                type="email"
                required
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-shell"
              />

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
                {isSubmitting ? "Sending..." : "Send Reset Code"}
              </button>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <span className="eyebrow">Verify code</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Reset your password</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter the code sent to <span className="font-semibold text-slate-800">{email}</span> and choose a new password.
            </p>

            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="input-shell text-center text-lg tracking-[0.3em]"
              />

              <input
                type="password"
                required
                minLength={6}
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-shell"
              />

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <button type="submit" disabled={isSubmitting || otp.length !== 6} className="btn-primary w-full py-3 text-base">
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <button onClick={() => setStep("email")} className="mt-4 text-sm font-medium text-slate-500 transition hover:text-orange-600 hover:underline">
              Use a different email
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Remembered your password? <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
