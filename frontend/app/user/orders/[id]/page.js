"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import { useOrderStatusListener } from "@/hooks/useOrderStatusListener";
import api, { getInvoiceUrl } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const { showToast } = useToast();


  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (err) {
        setError("Could not load this order.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

const handleStatusUpdate = useCallback(
  (update) => {
    if (update.orderId === id) {
      setOrder((prevOrder) => (prevOrder ? { ...prevOrder, status: update.status } : prevOrder));
      showToast(`Order status updated: ${update.status.replace(/_/g, " ")}`);
    }
  },
  [id, showToast]
);

  useOrderStatusListener(handleStatusUpdate);


  return (
    <ProtectedRoute allowedRoles={["user"]}>
      {loading && <p className="text-gray-400">Loading order...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {order && (
        <div className="max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Order Confirmed 🎉</h1>
            <OrderStatusBadge status={order.status} />
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Order #{order._id.slice(-6).toUpperCase()} · {order.restaurant?.name}
          </p>

          <div className="bg-white border rounded-lg p-4 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm py-1">
                <span>{item.quantity} x {item.name}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
            {order.status === "delivered" && (
            <a
  href={getInvoiceUrl(order._id)}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-block mt-4 text-sm border border-orange-600 text-orange-600 px-4 py-2 rounded-md hover:bg-orange-50"
>
  Download Invoice
</a>)}
          </div>

          <p className="text-sm text-gray-500">
            Delivering to: <span className="text-gray-700">{order.deliveryAddress}</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Payment: Cash on Delivery</p>
        </div>
      )}
    </ProtectedRoute>
  );
}