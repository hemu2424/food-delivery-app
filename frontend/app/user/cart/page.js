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
      <div className="app-shell max-w-xl">
        <div className="mb-6">
          <span className="eyebrow">Basket</span>
          <h1 className="mt-4 section-title">Your Cart</h1>
        </div>

        {(!cart || cart.items.length === 0) && (
          <div className="soft-panel py-16 text-center">
            <p className="mb-4 text-base text-slate-500">Your cart is empty.</p>
            <Link href="/user/dashboard" className="text-sm font-semibold text-orange-600 transition hover:text-orange-700 hover:underline">
              Browse restaurants
            </Link>
          </div>
        )}

        {cart && cart.items.length > 0 && (
          <div>
            <p className="mb-4 text-sm font-medium text-slate-500">Ordering from: {cart.restaurantName}</p>

            <div className="space-y-3">
              {cart.items.map((item) => (
                <CartLineItem key={item.menuItem} item={item} onUpdateQuantity={updateQuantity} />
              ))}
            </div>

            <div className="surface-card mt-6 p-4">
              <div className="flex items-center justify-between text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <Link href="/user/checkout" className="btn-primary mt-6 block w-full text-center">
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}