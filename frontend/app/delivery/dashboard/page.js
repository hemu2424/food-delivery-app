// app/delivery/dashboard/page.js
"use client";

import { useEffect, useCallback, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { useOrderClaimedListener } from "@/hooks/useOrderClaimedListener";
import CancelOrderModal from "@/components/shared/CancelOrderModal";
import { useOrderUnassignedListener } from "@/hooks/useOrderUnassignedListener";
import AvailableOrderCard from "@/components/delivery/AvailableOrderCard";
import DeliveryOrderCard from "@/components/delivery/DeliveryOrderCard";

const DELIVERY_CANCEL_REASONS = [
  "Restaurant is closed",
  "Unable to reach the location in time",
  "Vehicle breakdown",
  "Restaurant is not ready",
  "Other",
];

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const {
    availableOrders, myDeliveries, deliveryLoading, deliveryError,
    fetchDeliveryData, acceptOrder, markDelivered, removeAvailableOrderLocally,
    markPickedUp, cancelAssignedOrder,
  } = useOrders();
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user?.isApproved) {
      fetchDeliveryData();
    }
  }, [user, fetchDeliveryData]);

  const handleUnassigned = useCallback(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);
  useOrderUnassignedListener(handleUnassigned);

  const handleOrderClaimed = useCallback(
    (update) => {
      removeAvailableOrderLocally(update.orderId);
    },
    [removeAvailableOrderLocally]
  );
  useOrderClaimedListener(handleOrderClaimed);

  const handleConfirmCancel = useCallback(
    async (reason, note) => {
      setCancelling(true);
      try {
        await cancelAssignedOrder(cancelTarget, reason, note);
        setCancelTarget(null);
      } finally {
        setCancelling(false);
      }
    },
    [cancelAssignedOrder, cancelTarget]
  );

  const handleCloseCancelModal = useCallback(() => setCancelTarget(null), []);

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
            <AvailableOrderCard key={order._id} order={order} onAccept={acceptOrder} />
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
            <DeliveryOrderCard
              key={order._id}
              order={order}
              onMarkPickedUp={markPickedUp}
              onCancelRequest={setCancelTarget}
              onMarkDelivered={markDelivered}
            />
          ))}
        </div>
      </section>

      <CancelOrderModal
        isOpen={!!cancelTarget}
        onClose={handleCloseCancelModal}
        loading={cancelling}
        reasons={DELIVERY_CANCEL_REASONS}
        onConfirm={handleConfirmCancel}
      />
    </ProtectedRoute>
  );
}