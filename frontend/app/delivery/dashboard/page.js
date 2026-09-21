"use client";

import { useEffect, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { useOrderClaimedListener } from "@/hooks/useOrderClaimedListener";
import CancelOrderModal from "@/components/shared/CancelOrderModal";
import { useOrderUnassignedListener } from "@/hooks/useOrderUnassignedListener";
import { useState } from "react";

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const {
    availableOrders, myDeliveries, deliveryLoading, deliveryError,
    fetchDeliveryData, acceptOrder, markDelivered, removeAvailableOrderLocally,
  } = useOrders();
    const { markPickedUp, cancelAssignedOrder, /* ...existing ones */ } = useOrders();
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user?.isApproved) {
      fetchDeliveryData();
    }
  }, [user, fetchDeliveryData]);

  const handleUnassigned = useCallback(
    (update) => {
      fetchDeliveryData();
    },
    [fetchDeliveryData]
  );
  useOrderUnassignedListener(handleUnassigned);
  const handleOrderClaimed = useCallback(
    (update) => {
      removeAvailableOrderLocally(update.orderId);
    },
    [removeAvailableOrderLocally]
  );
  const DELIVERY_CANCEL_REASONS = [
  "Restaurant is closed",
  "Unable to reach the location in time",
  "Vehicle breakdown",
  "Restaurant is not ready",
  "Other",
];

  useOrderClaimedListener(handleOrderClaimed);

  if (user && !user.isApproved) {
    return (
      <ProtectedRoute allowedRoles={["delivery"]}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800 max-w-lg">
          Your account is pending admin approval.
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["delivery"]}>
      <h1 className="text-2xl font-bold mb-6">Delivery Dashboard</h1>

      {deliveryError && <p className="text-sm text-red-600 mb-4">{deliveryError}</p>}
      {deliveryLoading && <p className="text-gray-400">Loading...</p>}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Available Orders</h2>
        {!deliveryLoading && availableOrders.length === 0 && (
          <p className="text-gray-400 text-sm">No orders available for pickup right now.</p>
        )}
        <div className="space-y-3 max-w-lg">
          {availableOrders.map((order) => (
            <div key={order._id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{order.restaurant?.name}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-gray-500 mb-3">
                Deliver to: {order.deliveryAddress}
              </p>
              <button
                onClick={() => acceptOrder(order._id)}
                className="bg-orange-600 text-white text-sm px-3 py-2 rounded-md hover:bg-orange-700"
              >
                Accept Delivery
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">My Active Deliveries</h2>
        {!deliveryLoading && myDeliveries.length === 0 && (
          <p className="text-gray-400 text-sm">You have no assigned deliveries.</p>
        )}
        <div className="space-y-3 max-w-lg">
          {myDeliveries.map((order) => (
            <div key={order._id} className="bg-white border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{order.restaurant?.name}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-gray-500 mb-1">
                Customer: {order.user?.name} · {order.user?.phone}
              </p>
              <p className="text-sm text-gray-500 mb-3">
                Deliver to: {order.deliveryAddress}
              </p>
                           {order.status === "preparing" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => markPickedUp(order._id)}
                    className="bg-orange-600 text-white text-sm px-3 py-2 rounded-md hover:bg-orange-700"
                  >
                    Mark Picked Up
                  </button>
                  <button
                    onClick={() => setCancelTarget(order._id)}
                    className="text-sm text-red-600 border border-red-600 px-3 py-2 rounded-md hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
              {order.status === "out_for_delivery" && (
                <button
                  onClick={() => markDelivered(order._id)}
                  className="bg-green-600 text-white text-sm px-3 py-2 rounded-md hover:bg-green-700"
                >
                  Mark as Delivered
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
            <CancelOrderModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        loading={cancelling}
        reasons={DELIVERY_CANCEL_REASONS}
        onConfirm={async (reason, note) => {
          setCancelling(true);
          try {
            await cancelAssignedOrder(cancelTarget, reason, note);
            setCancelTarget(null);
          } finally {
            setCancelling(false);
          }
        }}
      />
    </ProtectedRoute>
  );
}