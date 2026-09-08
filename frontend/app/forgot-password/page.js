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
    console.log("Requesting code onclick ")
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
    <div className="max-w-sm mx-auto mt-10">
      {step === "email" && (
        <>
          <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter your email and we'll send you a reset code.
          </p>

          <form onSubmit={handleRequestCode} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {isSubmitting ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        </>
      )}

      {step === "reset" && (
        <>
          <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
          <p className="text-sm text-gray-500 mb-6">
            Enter the code sent to <span className="font-medium">{email}</span> and choose a new password.
          </p>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full border rounded-md px-3 py-2 text-center tracking-widest"
            />

            <input
              type="password"
              required
              minLength={6}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <button
            onClick={() => setStep("email")}
            className="text-sm text-gray-500 hover:underline mt-4"
          >
            Use a different email
          </button>
        </>
      )}

      <p className="text-sm text-gray-500 mt-6">
        Remembered your password?{" "}
        <Link href="/login" className="text-orange-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}