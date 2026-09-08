"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/context/CartContext";

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
              <div
                key={item.menuItem}
                className="flex items-center justify-between bg-white border rounded-lg p-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">₹{item.price} each</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                    className="w-7 h-7 border rounded-md hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                    className="w-7 h-7 border rounded-md hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
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