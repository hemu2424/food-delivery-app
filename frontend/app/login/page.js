"use client"

import { useAuth } from "@/context/AuthContext"
import Link from "next/link";
import { useState } from "react";


export default function LoginPage(){
    const{login} = useAuth();
    const[email,setEmail] = useState("");
    const[password,setPassword] = useState("");
    const[error,setError] = useState("");
    const[isSubmitting,setIsSubmitting] = useState(false);

    async function handleSubmit(e){
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try{
            await login(email,password);
        }
        catch(err){
          setError(err.response?.data?.message || "Login failed Please try again.");
        }
        finally{
            setIsSubmitting(false);
        }
      }

    return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800">Welcome back</h1>

        <p className="text-sm text-gray-500 mb-6">Sign in to continue to your food orders.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2 text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border ${error ? "border-red-400" : "border-gray-200"} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 transition`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 text-gray-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full border ${error ? "border-red-400" : "border-gray-200"} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 transition`}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {isSubmitting && (
              <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
            )}
            <span className="text-sm font-medium">{isSubmitting ? "Logging in..." : "Login"}</span>
          </button>
        </form>
        <div className="flex justify-end">
  <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
    Forgot password?
  </Link>
</div>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-orange-500 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
     }
