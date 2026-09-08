"use client"
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage(){

    const {register} = useAuth();
    const [formData,setFormData] = useState({
        name:"",
        email:"",
        phone:"",
        password:"",
        role:"user",
        address:"",

    });
    const [error,setError]= useState("");
    const [isSubmitting,setIsSubmitting] = useState(false);    


    const handleChange = (e)=>{
setFormData({...formData,[e.target.name]:e.target.value})
    }

    const handleSubmit = async(e)=>{
     e.preventDefault();
    setError("");
    setIsSubmitting(true);
     try{

        await register(formData);

        
     }
     catch(error){
        setError(error.response.data?.message || "fail to register")
        console.log(error);
     }
      finally{
        setIsSubmitting(false);
      }

    }

    return(
    <>
        
         <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800">Create an account</h1>
        <p className="text-sm text-gray-500 mb-6">Sign up to order or deliver food in your area.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
            <button
              type="button"
              onClick={() =>setFormData({...formData,role:"user"})}
              className={`flex-1 text-sm py-2 rounded-lg transition ${formData.role === "user" ? "bg-orange-500 text-white shadow" : "text-gray-700 hover:bg-white"}`}
            >
              Order Food
            </button>
            <button
              type="button"
              onClick={() =>setFormData({...formData,role:"delivery"})}
              className={`flex-1 text-sm py-2 rounded-lg transition ${formData.role === "delivery" ? "bg-orange-500 text-white shadow" : "text-gray-700 hover:bg-white"}`}
            >
              Deliver Food
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
              <input
                name="name"
                required
                value = {formData.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input
                type="phone"
                onChange={handleChange}
                value={formData.phone}
                name="phone"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input
              type="email"
              onChange={handleChange}
              value={formData.email}
              name="email"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input
              type="password"
              onChange={handleChange}
              value={formData.password}
              name="password"
              min={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
            <input
              onChange={handleChange}
              value={formData.address}
              name="address"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {isSubmitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-orange-500 font-medium hover:underline">Login</Link>
        </p>

      </div>
    </div>
    </>

    )

  

}