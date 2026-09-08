"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/context/OrderContext";
import { useToast } from "@/context/ToastContext";

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { user } = useAuth();
  const router = useRouter();

  const [address, setAddress] = useState(user?.address || "");
  const [error, setError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const {showToast} = useToast()


  async function handlePlaceOrder() {
    if (!address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    setError("");
    setIsPlacingOrder(true);

    try {
 
      const orderItems = cart.items.map((item) => ({
        menuItem: item.menuItem,
        quantity: item.quantity,
      }));

      const order = await placeOrder({
        restaurantId: cart.restaurantId,
        deliveryAddress: address,
        items: orderItems,
      });

      clearCart();
      router.push(`/user/orders/${order._id}`); 
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
      //  showToast(message, "error");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <ProtectedRoute allowedRoles={["user"]}>
        <p className="text-gray-400">Your cart is empty.</p>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="max-w-lg">
        <p className="text-sm text-gray-500 mb-2">Ordering from: {cart.restaurantName}</p>

        <div className="bg-white border rounded-lg p-4 mb-4">
          {cart.items.map((item) => (
            <div key={item.menuItem} className="flex justify-between text-sm py-1">
              <span>{item.quantity} x {item.name}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>₹{totalAmount}</span>
          </div>
        </div>

        <label className="block text-sm font-medium mb-1">Delivery Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
          className="w-full border rounded-md px-3 py-2 mb-2"
          placeholder="Enter your full delivery address"
        />

        <p className="text-xs text-gray-400 mb-4">Payment: Cash on Delivery</p>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder}
          className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {isPlacingOrder ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </ProtectedRoute>
  );
}