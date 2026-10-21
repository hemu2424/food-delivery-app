// app/delivery/dashboard/page.js
"use client";

import { useEffect, useCallback, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useOrders } from "@/context/OrderContext";
import { useAuth } from "@/context/AuthContext";
import { useOrderClaimedListener } from "@/hooks/useOrderClaimedListener";
import CancelOrderModal from "@/components/shared/CancelOrderModal";
import { useOrderUnassignedListener } from "@/hooks/useOrderUnassignedListener";
import { useOrderAvailableListener } from "@/hooks/useOrderAvailableListener";
import { useOrderCancelledListener } from "@/hooks/useOrderCancelledListener";
import { useOrderStatusListener } from "@/hooks/useOrderStatusListener";
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

  const handleNewAvailable = useCallback(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);
  useOrderAvailableListener(handleNewAvailable);

  const handleUnassigned = useCallback(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);
  useOrderUnassignedListener(handleUnassigned);

  const handleOrderClaimed = useCallback(
    (update) => {
      if (update?.orderId) {
        removeAvailableOrderLocally(update.orderId);
      }
      fetchDeliveryData();
    },
    [removeAvailableOrderLocally, fetchDeliveryData]
  );
  useOrderClaimedListener(handleOrderClaimed);

  const handleOrderCancelled = useCallback(
    (update) => {
      if (update?.orderId) {
        removeAvailableOrderLocally(update.orderId);
      }
      fetchDeliveryData();
    },
    [removeAvailableOrderLocally, fetchDeliveryData]
  );
  useOrderCancelledListener(handleOrderCancelled);

  const handleStatusUpdate = useCallback(() => {
    fetchDeliveryData();
  }, [fetchDeliveryData]);
  useOrderStatusListener(handleStatusUpdate);

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
        <div className="app-shell max-w-xl">
          <div className="soft-panel border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
            Your account is pending admin approval.
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["delivery"]}>
      <div className="app-shell">
        <div className="mb-6">
          <span className="eyebrow">Delivery</span>
          <h1 className="mt-4 section-title">Delivery Dashboard</h1>
        </div>

        {deliveryError && <p className="mb-4 text-sm font-medium text-red-600">{deliveryError}</p>}
        {deliveryLoading && <p className="text-sm text-slate-500">Loading...</p>}

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Available Orders</h2>
          {!deliveryLoading && availableOrders.length === 0 && (
            <div className="soft-panel p-4 text-sm text-slate-500">No orders available for pickup right now.</div>
          )}
          <div className="space-y-3 max-w-2xl">
            {availableOrders.map((order) => (
              <AvailableOrderCard key={order._id} order={order} onAccept={acceptOrder} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">My Active Deliveries</h2>
          {!deliveryLoading && myDeliveries.length === 0 && (
            <div className="soft-panel p-4 text-sm text-slate-500">You have no assigned deliveries.</div>
          )}
          <div className="space-y-3 max-w-2xl">
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
      </div>
    </ProtectedRoute>
  );
}