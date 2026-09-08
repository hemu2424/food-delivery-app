"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const { verifyEmail, resendOtp } = useAuth();
  const { showToast } = useToast();

  const [email] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      await verifyEmail(email, otp);
      showToast("Email verified! Welcome to FoodExpress.");
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setIsResending(true);
    try {
      await resendOtp(email);
      showToast("A new code has been sent to your email.");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not resend code.", "error");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
      <p className="text-sm text-gray-500 mb-6">
        We sent a 6-digit code to <span className="font-medium">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
          className="w-full border rounded-md px-3 py-2 text-center text-lg tracking-widest"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isVerifying || otp.length !== 6}
          className="w-full bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <button
        onClick={handleResend}
        disabled={isResending}
        className="text-sm text-orange-600 hover:underline mt-4 disabled:opacity-50"
      >
        {isResending ? "Sending..." : "Resend code"}
      </button>
    </div>
  );
}


export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center mt-10 text-gray-400">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}