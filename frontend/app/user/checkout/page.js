"use client";

import { useRef, useState } from "react";
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
  const checkoutOpenRef = useRef(false);

  function loadRazorpay() {
    if (window.Razorpay) return Promise.resolve();

    const existingScript = document.querySelector('script[data-razorpay-checkout]');
    if (existingScript) {
      return new Promise((resolve, reject) => {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.dataset.razorpayCheckout = "true";
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load Razorpay Checkout."));
      document.head.appendChild(script);
    });
  }

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
      await openRazorpayCheckout(response);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
      setIsPlacingOrder(false);
    }
  }

  async function openRazorpayCheckout(response) {
    const { order, razorpay } = response;

    if (!razorpay) {
      setError("Payment gateway response was invalid. Please try again.");
      setIsPlacingOrder(false);
      return;
    }

    if (checkoutOpenRef.current) {
      setIsPlacingOrder(false);
      return;
    }

    try {
      await loadRazorpay();
    } catch {
      setError("Payment SDK could not be loaded. Please check your connection and try again.");
      setIsPlacingOrder(false);
      return;
    }

    checkoutOpenRef.current = true;

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
      theme: { color: "#ea580c" }, 

      handler: async function (razorpayResponse) {
       
        try {
          await verifyPayment(order._id, {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
          });
          clearCart();
          checkoutOpenRef.current = false;
          router.push(`/user/orders/${order._id}`);
        } catch (err) {
          setError("Payment could not be verified. Please contact support if money was deducted.");
          checkoutOpenRef.current = false;
          setIsPlacingOrder(false);
        }
      },

      modal: {
        ondismiss: function () {
          // User closed the widget without paying — order already exists as "pending",
          // they can find it in order history and retry, but we don't auto-navigate anywhere.
          setError("Payment was not completed. Your order is saved — you can retry from your order history.");
          checkoutOpenRef.current = false;
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
        <div className="app-shell max-w-xl">
          <div className="soft-panel p-6 text-sm text-slate-500">Your cart is empty.</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="app-shell max-w-2xl">
        <div className="mb-6">
          <span className="eyebrow">Checkout</span>
          <h1 className="mt-4 section-title">Complete your order</h1>
        </div>

        <div className="space-y-5">
          <div className="surface-card p-4">
            <p className="mb-3 text-sm font-medium text-slate-500">Ordering from: {cart.restaurantName}</p>

            <div className="space-y-2">
              {cart.items.map((item) => (
                <div key={item.menuItem} className="flex items-center justify-between gap-3 text-sm text-slate-700">
                  <span>
                    {item.quantity} × {item.name}
                  </span>
                  <span className="font-semibold">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
              <span>Total</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          <div className="surface-card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Delivery Address</h2>
            {!finalizedAddress && <CheckoutAddressPicker onFinalize={setFinalizedAddress} />}
            {finalizedAddress && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Delivering to</p>
                <p className="text-sm leading-6 text-slate-700">{finalizedAddress.formattedAddress}</p>
                <button onClick={() => setFinalizedAddress(null)} className="mt-2 text-xs font-medium text-orange-600 transition hover:text-orange-700 hover:underline">
                  Change address
                </button>
              </div>
            )}
          </div>

          <div className="surface-card p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Payment Method</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod("cod")}
                className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition ${paymentMethod === "cod" ? "border-orange-600 bg-orange-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:text-orange-600"}`}
              >
                Cash on Delivery
              </button>
              <button
                onClick={() => setPaymentMethod("razorpay")}
                className={`rounded-2xl border px-3 py-2.5 text-sm font-medium transition ${paymentMethod === "razorpay" ? "border-orange-600 bg-orange-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:text-orange-600"}`}
              >
                Pay Online
              </button>
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || !finalizedAddress}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPlacingOrder ? "Processing..." : paymentMethod === "cod" ? "Place Order" : "Proceed to Pay"}
          </button>

          {!finalizedAddress && (
            <p className="text-center text-xs text-slate-500">
              Please confirm your delivery address above to proceed.
            </p>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
