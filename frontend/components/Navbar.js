"use client"
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function Navbar(){
  const { logout, user } = useAuth();
  const { itemCount } = useCart();

  const homeLink = !user 
    ? "/" 
    : user.role === "admin" 
    ? "/admin/dashboard" 
    : user.role === "delivery" 
    ? "/delivery/dashboard" 
    : "/user/dashboard";

  return (
    <nav className="w-full bg-white shadow-sm">
     
      <div className="max-w-6xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
        
       
        <div className="flex justify-start">
          <Link href={homeLink} className="text-xl font-bold text-orange-500">
            FoodDelivery
          </Link>
        </div>

       
        <div className="flex justify-center">
          {user?.role && (
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full text-orange-700 ">
              {user.role} Portal
            </span>
          )}
        </div>

        
        <div className="flex justify-end">
        
          <div className="hidden md:flex items-center gap-4">
            {!user && (
              <>
                <Link href="/login" className="text-sm text-gray-700 hover:text-orange-500">Login</Link>
                <Link href="/register" className="text-sm text-white bg-orange-500 px-3 py-1 rounded-md hover:bg-orange-600">Register</Link>
              </>
            )}

            {user && user.role === "user" && (
              <>
                <Link href="/user/cart" className="text-sm text-gray-700 hover:text-orange-500">Cart {itemCount > 0 && `(${itemCount})`}</Link>
                <Link href="/user/dashboard" className="text-sm text-gray-700 hover:text-orange-500">Restaurants-db</Link>
                <Link href="/user/orders" className="text-sm text-gray-700 hover:text-orange-500">Orders</Link>
              </>
            )}

            {user && user.role === "delivery" && (
              <Link href="/delivery/dashboard" className="text-sm text-gray-700 hover:text-orange-500">Delivery</Link>
            )}

            {user && user.role === "admin" && (
              <>
                <Link href="/admin/dashboard" className="text-sm text-gray-700 hover:text-orange-500">Dashboard</Link>
                <Link href="/admin/restaurants" className="text-sm text-gray-700 hover:text-orange-500">Restaurants</Link>
                <Link href="/admin/users" className="text-sm text-gray-700 hover:text-orange-500">Users</Link>
                <Link href="/admin/orders" className="text-sm text-gray-700 hover:text-orange-500">Orders</Link>
              </>
            )}

            {user && (
              <div className="flex items-center gap-3 ml-2  pl-3 border-gray-200">
                <span className="text-sm text-gray-700 font-medium"> {user.name}</span>
                <button onClick={logout} className="text-sm text-gray-600 hover:text-red-600 font-medium">Logout</button>
              </div>
            )}
          </div>

          
         
        </div>

      </div>
    </nav>
  )
}
