"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";
import Pagination from "@/components/shared/Pagination";
import { useOrders } from "@/context/OrderContext";
import CancelOrderModal from "@/components/shared/CancelOrderModal";

function MyOrdersContent() {
  const { myOrders, myOrdersPagination, loading, error, fetchMyOrders } = useOrders();
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState(null); // order._id
const [cancelling, setCancelling] = useState(false);
const { cancelOrder } = useOrders(); // already destructure other fields too
const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Delivery is taking too long",
  "Found a better price elsewhere",
  "Other",
];
const CANCELLABLE_STATUSES = ["placed", "confirmed", "preparing"];

  useEffect(() => {
    fetchMyOrders(currentPage);
  }, [currentPage, fetchMyOrders]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {loading && <p className="text-gray-400">Loading orders...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && myOrders.length === 0 && (
        <p className="text-gray-400">You haven&apos;t placed any orders yet.</p>
      )}

      <div className="space-y-3 max-w-lg">
        {myOrders.map((order) => (
          <Link key={order._id} href={`/user/orders/${order._id}`} className="block bg-white border rounded-lg p-4 hover:shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order.restaurant?.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()} · ₹{order.totalAmount}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
              {CANCELLABLE_STATUSES.includes(order.status) && (
  <button
    onClick={(e) => { e.preventDefault(); setCancelTarget(order._id); }}
    className="text-xs text-red-600 border border-red-600 px-2 py-1 rounded-md hover:bg-red-50 mt-1"
  >
    Cancel
  </button>
)}
            </div>
          </Link>
        ))}
        <CancelOrderModal
  isOpen={!!cancelTarget}
  onClose={() => setCancelTarget(null)}
  loading={cancelling}
  reasons={CANCEL_REASONS}
  onConfirm={async (reason, note) => {
    setCancelling(true);
    try {
      await cancelOrder(cancelTarget, reason, note, currentPage);
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  }}
/> 
      </div>

      <Pagination pagination={myOrdersPagination} onPageChange={setCurrentPage} />
    </>
  );
}

export default function MyOrdersPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <MyOrdersContent />
    </ProtectedRoute>
  );
}
