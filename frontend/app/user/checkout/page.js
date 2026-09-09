"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import CheckoutAddressPicker from "@/components/user/CheckoutAddressPicker";

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const router = useRouter();

  const [finalizedAddress, setFinalizedAddress] = useState(null); 
  const [error, setError] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  async function handlePlaceOrder() {
    if (!finalizedAddress) {
      setError("Please select a delivery address first.");
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
        deliveryAddress: finalizedAddress.formattedAddress,
        latitude: finalizedAddress.latitude,
        longitude: finalizedAddress.longitude,
        items: orderItems,
      });

      clearCart();
      router.push(`/user/orders/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
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

      <div className="max-w-lg mx-auto">
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

        <h2 className="text-sm font-semibold mb-3">Delivery Address</h2>

        {!finalizedAddress && (
          <CheckoutAddressPicker onFinalize={setFinalizedAddress} />
        )}

        {finalizedAddress && (
          <div className="bg-gray-50 border rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Delivering to</p>
            <p className="text-sm">{finalizedAddress.formattedAddress}</p>
            <button
              onClick={() => setFinalizedAddress(null)}
              className="text-xs text-orange-600 hover:underline mt-1"
            >
              Change address
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 mb-4">Payment: Cash on Delivery</p>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || !finalizedAddress}
          className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {isPlacingOrder ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </ProtectedRoute>
  );
}