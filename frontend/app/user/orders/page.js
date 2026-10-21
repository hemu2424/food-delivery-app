"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import Pagination from "@/components/shared/Pagination";
import { useOrders } from "@/context/OrderContext";
import CancelOrderModal from "@/components/shared/CancelOrderModal";
import { useOrderStatusListener } from "@/hooks/useOrderStatusListener";

function MyOrdersContent() {
  const { cancelOrder } = useOrders();
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null); // order._id
  const [cancelling, setCancelling] = useState(false);
const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Delivery is taking too long",
  "Found a better price elsewhere",
  "Other",
];
const CANCELLABLE_STATUSES = ["placed", "confirmed", "preparing"];

  const { data, error: swrError, isLoading, mutate } = useSWR(
    `/orders/my?page=${currentPage}`,
    fetcher,
    { revalidateOnFocus: false }
  );
  const handleStatusUpdate = useCallback(() => {
  mutate();
}, [mutate]);
useOrderStatusListener(handleStatusUpdate);

  const myOrders = Array.isArray(data) ? data : data?.orders ?? [];
  const myOrdersPagination = data?.pagination ?? null;
  const loading = isLoading;
  const error = swrError ? "Could not load your orders." : "";

  return (
    <div className="app-shell max-w-3xl">
      <div className="mb-6">
        <span className="eyebrow">History</span>
        <h1 className="mt-4 section-title">My Orders</h1>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading orders...</p>}
      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      {!loading && myOrders.length === 0 && (
        <div className="soft-panel p-6 text-sm text-slate-500">You haven&apos;t placed any orders yet.</div>
      )}

      <div className="space-y-3">
        {myOrders.map((order) => (
          <Link key={order._id} href={`/user/orders/${order._id}`} className="surface-card block p-4 transition hover:border-orange-200 hover:shadow-[0_12px_26px_rgba(249,115,22,0.08)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-slate-900">{order.restaurant?.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString()} · ₹{order.totalAmount}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                {CANCELLABLE_STATUSES.includes(order.status) && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setCancelTarget(order._id);
                    }}
                    className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Pagination pagination={myOrdersPagination} onPageChange={setCurrentPage} />
      </div>

      <CancelOrderModal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        loading={cancelling}
        reasons={CANCEL_REASONS}
        onConfirm={async (reason, note) => {
          setCancelling(true);
          try {
            await cancelOrder(cancelTarget, reason, note);
            await mutate();
            setCancelTarget(null);
          } finally {
            setCancelling(false);
          }
        }}
      />
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <MyOrdersContent />
    </ProtectedRoute>
  );
}