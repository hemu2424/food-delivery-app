// app/user/cart/page.js
"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/context/CartContext";
import CartLineItem from "@/components/user/CartLineItem";

export default function CartPage() {
  const { cart, updateQuantity, totalAmount } = useCart();

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      {(!cart || cart.items.length === 0) && (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Your cart is empty.</p>
          <Link href="/user/dashboard" className="text-orange-600 hover:underline">
            Browse restaurants
          </Link>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <div className="max-w-lg">
          <p className="text-sm text-gray-500 mb-4">Ordering from: {cart.restaurantName}</p>

          <div className="space-y-3 mb-6">
            {cart.items.map((item) => (
              <CartLineItem key={item.menuItem} item={item} onUpdateQuantity={updateQuantity} />
            ))}
          </div>

          <div className="flex items-center justify-between mb-6 text-lg font-semibold">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>

          <Link
            href="/user/checkout"
            className="block text-center w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700"
          >
            Proceed to Checkout
          </Link>
        </div>
      )}
    </ProtectedRoute>
  );
}