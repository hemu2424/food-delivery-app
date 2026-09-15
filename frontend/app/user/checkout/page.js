"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import CheckoutAddressPicker from "@/components/user/CheckoutAddressPicker";

export default function CheckoutPage() {
  const { cart, totalAmount, clearCart } = useCart();
  const { placeOrder, verifyPayment } = useOrders();
  const { user } = useAuth();
  const router = useRouter();

  const [finalizedAddress, setFinalizedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "razorpay"
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
      const orderItems = cart.items.map((item) => ({ menuItem: item.menuItem, quantity: item.quantity }));

      const response = await placeOrder({
        restaurantId: cart.restaurantId,
        deliveryAddress: finalizedAddress.formattedAddress,
        latitude: finalizedAddress.latitude,
        longitude: finalizedAddress.longitude,
        items: orderItems,
        paymentMethod,
      });

      // COD: order is fully done, go straight to confirmation — same as before
      if (paymentMethod === "cod") {
        clearCart();
        router.push(`/user/orders/${response.order._id}`);
        return;
      }

      // Razorpay: launch the checkout widget using details returned from the backend
      openRazorpayCheckout(response);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
      setIsPlacingOrder(false);
    }
  }

  function openRazorpayCheckout(response) {
    const { order, razorpay } = response;

    if (!razorpay) {
      setError("Payment gateway response was invalid. Please try again.");
      setIsPlacingOrder(false);
      return;
    }

    if (typeof window === "undefined" || !window.Razorpay) {
      setError("Payment SDK is loading. Please wait a moment and try again.");
      setIsPlacingOrder(false);
      return;
    }

    const options = {
      key: razorpay.keyId,
      amount: razorpay.amount,
      currency: razorpay.currency,
      name: "FoodExpress",
      description: `Order from ${cart.restaurantName}`,
      order_id: razorpay.orderId,
      prefill: {
        name: user?.name || "",
        email: user?.email || "",
      },
      theme: { color: "#ea580c" }, // matches your orange brand color

      handler: async function (razorpayResponse) {
        // This callback fires ONLY after the widget reports success.
        // We still MUST verify server-side — this is not itself proof of payment.
        try {
          await verifyPayment(order._id, {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
          });
          clearCart();
          router.push(`/user/orders/${order._id}`);
        } catch (err) {
          setError("Payment could not be verified. Please contact support if money was deducted.");
          setIsPlacingOrder(false);
        }
      },

      modal: {
        ondismiss: function () {
          // User closed the widget without paying — order already exists as "pending",
          // they can find it in order history and retry, but we don't auto-navigate anywhere.
          setError("Payment was not completed. Your order is saved — you can retry from your order history.");
          setIsPlacingOrder(false);
        },
      },
    };

    const razorpayInstance = new window.Razorpay(options);
    razorpayInstance.open();
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
        {!finalizedAddress && <CheckoutAddressPicker onFinalize={setFinalizedAddress} />}
        {finalizedAddress && (
          <div className="bg-gray-50 border rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Delivering to</p>
            <p className="text-sm">{finalizedAddress.formattedAddress}</p>
            <button onClick={() => setFinalizedAddress(null)} className="text-xs text-orange-600 hover:underline mt-1">
              Change address
            </button>
          </div>
        )}

        <h2 className="text-sm font-semibold mb-3">Payment Method</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPaymentMethod("cod")}
            className={`flex-1 border rounded-md py-2 text-sm ${paymentMethod === "cod" ? "bg-orange-600 text-white border-orange-600" : ""}`}
          >
            Cash on Delivery
          </button>
          <button
            onClick={() => setPaymentMethod("razorpay")}
            className={`flex-1 border rounded-md py-2 text-sm ${paymentMethod === "razorpay" ? "bg-orange-600 text-white border-orange-600" : ""}`}
          >
            Pay Online
          </button>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || !finalizedAddress}
          className="w-full bg-orange-600 text-white py-3 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlacingOrder ? "Processing..." : paymentMethod === "cod" ? "Place Order" : "Proceed to Pay"}
        </button>

        {!finalizedAddress && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Please confirm your delivery address above to proceed.
          </p>
        )}
      </div>
    </ProtectedRoute>
  );
}