"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";
import AddressSearchInput from "@/components/user/AddressSearchInput";

export default function RegisterPage() {
  return <RegisterForm />;
}

function RegisterForm() {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
    address: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(formData);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to register.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell flex min-h-[calc(100vh-7rem)] items-center justify-center py-10">
      <div className="surface-card w-full max-w-lg p-6 sm:p-8">
        <span className="eyebrow">Join us</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">Sign up to order food, deliver meals, and manage your account with ease.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "user" })}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                formData.role === "user" ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}
            >
              Order Food
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: "delivery" })}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                formData.role === "delivery" ? "bg-orange-500 text-white shadow-sm" : "text-slate-600 hover:bg-white"
              }`}
            >
              Deliver Food
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
              <input
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="input-shell"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                onChange={handleChange}
                value={formData.phone}
                name="phone"
                required
                className="input-shell"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              onChange={handleChange}
              value={formData.email}
              name="email"
              required
              className="input-shell"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              onChange={handleChange}
              value={formData.password}
              name="password"
              min={6}
              className="input-shell"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
            <AddressSearchInput
              name="address"
              value={formData.address}
              onChange={handleChange}
              onSelect={(details) => {
                setFormData((prev) => ({
                  ...prev,
                  address: details.formattedAddress || details.description || prev.address,
                }));
              }}
              placeholder="Search area, street, locality or click 📍"
              className="input-shell"
              showLocateButton={true}
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3 text-base">
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
