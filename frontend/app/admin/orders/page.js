"use client";

import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import { useOrders } from "@/context/OrderContext";

// Defines what the "next" status is for a given current status —
// only shows a button when there's a valid next step for ADMIN to trigger.
// (out_for_delivery -> delivered is the delivery partner's job, not admin's — no button for that here.)
const NEXT_STATUS = {
  placed: "confirmed",
  confirmed: "preparing",
};

export default function AdminOrdersPage() {
  const { allOrders, adminOrdersLoading, adminOrdersError, fetchAllOrders, advanceOrderStatus } =
    useOrders();

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>

      {adminOrdersError && <p className="text-sm text-red-600 mb-4">{adminOrdersError}</p>}
      {adminOrdersLoading && <p className="text-gray-400">Loading orders...</p>}
      {!adminOrdersLoading && allOrders.length === 0 && (
        <p className="text-gray-400">No orders yet.</p>
      )}

      <div className="space-y-3 max-w-2xl">
        {allOrders.map((order) => {
          const nextStatus = NEXT_STATUS[order.status];
          return (
            <div key={order._id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium">{order.restaurant?.name}</p>
                  <p className="text-xs text-gray-400">
                    {order.user?.name} · {order.user?.email}
                  </p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <p className="text-sm text-gray-500 mb-1">
                {order.items.length} item(s) · ₹{order.totalAmount}
              </p>
              {order.deliveryPartner && (
                <p className="text-xs text-gray-400 mb-2">
                  Delivery partner: {order.deliveryPartner.name}
                </p>
              )}

              {nextStatus && (
                <button
                  onClick={() => advanceOrderStatus(order._id, nextStatus, currentPage)}
                  className="bg-orange-600 text-white text-sm px-3 py-2 rounded-md hover:bg-orange-700 mt-2"
                >
                  Mark as {nextStatus.replace(/_/g, " ")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </ProtectedRoute>
  );
}