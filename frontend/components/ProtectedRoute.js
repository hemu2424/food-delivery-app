"use client"

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({children,allowedRoles}){
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!user) {
            router.push("/login");
            return;
        }

        if (allowedRoles && !allowedRoles.includes(user.role)) {
            router.push("/");
            return;
        }
    }, [user, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                Loading...
            </div>
        );
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null;
    }

    return children;
}