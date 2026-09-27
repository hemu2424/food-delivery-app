"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import Pagination from "@/components/shared/Pagination";
import { useOrders } from "@/context/OrderContext";
import { useOrderStatusListener } from "@/hooks/useOrderStatusListener";
import { useOrderCreatedListener } from "@/hooks/useOrderCreatedListener";
import { useOrderClaimedListener } from "@/hooks/useOrderClaimedListener";
import { useOrderCancelledListener } from "@/hooks/useOrderCancelledListener";
import { useOrderUnassignedListener } from "@/hooks/useOrderUnassignedListener";

const NEXT_STATUS = {
  placed: "confirmed",
  confirmed: "preparing",
};

export default function AdminOrdersPage() {
  const { advanceOrderStatus } = useOrders();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, error: swrError, isLoading, mutate } = useSWR(
    `/orders?page=${currentPage}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleOrderEvent = useCallback(() => {
    mutate();
  }, [mutate]);

  useOrderStatusListener(handleOrderEvent);
  useOrderCreatedListener(handleOrderEvent);
  useOrderClaimedListener(handleOrderEvent);
  useOrderCancelledListener(handleOrderEvent);
  useOrderUnassignedListener(handleOrderEvent);

  const allOrders = Array.isArray(data) ? data : data?.orders ?? [];
  const allOrdersPagination = data?.pagination ?? null;
  const adminOrdersLoading = isLoading;
  const adminOrdersError = swrError ? "Could not load orders." : "";

  async function handleAdvance(orderId, nextStatus) {
    await advanceOrderStatus(orderId, nextStatus);
    await mutate();
  }

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
                  onClick={() => handleAdvance(order._id, nextStatus)}
                  className="bg-orange-600 text-white text-sm px-3 py-2 rounded-md hover:bg-orange-700 mt-2"
                >
                  Mark as {nextStatus.replace(/_/g, " ")}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Pagination pagination={allOrdersPagination} onPageChange={setCurrentPage} />
    </ProtectedRoute>
  );
}