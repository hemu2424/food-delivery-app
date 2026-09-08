"use client"

import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({children}){
    const [user,setUser] = useState(null);
    const[loading,setLoading] = useState(true);
    const router = useRouter()



    useEffect(()=>{
        async function checkAuth(){
            try{
                const response = await api.get("/auth/me")
                
                setUser(response.data.user ?? response.data);

            }
            catch(error){

                setUser(null);
            }
            finally{
                setLoading(false)
            }
        }
        checkAuth()

    },[])


  async function login(email, password) {
    try {
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data.user);
      redirectByRole(response.data.user.role);
      return response.data.user;
    } catch (error) {
    
      if (error.response?.data?.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(error.response.data.email)}`);
      }
      throw error; 
    }
  }

    async function verifyEmail(email, otp) {
    const response = await api.post("/auth/verify-email", { email, otp });
    setUser(response.data.user);
    redirectByRole(response.data.user.role);
    return response.data.user;
  }

  async function resendOtp(email) {
    const response = await api.post("/auth/resend-otp", { email });
    return response.data;
  }


  async function register(formData) {
    const response = await api.post("/auth/register", formData);
  
    router.push(`/verify-email?email=${encodeURIComponent(response.data.email)}`);
    return response.data;
  }
  async function logout() {
    await api.post("/auth/logout"); 
    setUser(null);
    router.push("/login");
  }

function redirectByRole(role){
  if(role === "admin"){ router.push("/admin/dashboard"); }
  else if(role === "delivery") { router.push("/delivery/dashboard"); }
  else { router.push("/user/dashboard"); }

}

async function forgotPassword(email) {
  const response = await api.post("/auth/forgot-password", { email });
  console.log("Requesting password reset for:", email);

  
  return response.data;
}

async function resetPassword(email, otp, newPassword) {
  console.log("Resetting password for:", email, otp, newPassword);
  const response = await api.post("/auth/reset-password", { email, otp, newPassword });
  return response.data;
}

return (
    <AuthContext.Provider value = {{user,loading,register,login,logout,verifyEmail,resendOtp,forgotPassword,resetPassword}}>
        {children}
    </AuthContext.Provider>
)

}
//bhai aa custom hook che jo usethisstrt thai che etle k reusable logic
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}