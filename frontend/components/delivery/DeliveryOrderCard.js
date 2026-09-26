// components/delivery/DeliveryOrderCard.js
"use client";

import { memo } from "react";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";

function DeliveryOrderCard({ order, onMarkPickedUp, onCancelRequest, onMarkDelivered }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">{order.restaurant?.name}</p>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-gray-500 mb-1">
        Customer: {order.user?.name} · {order.user?.phone}
      </p>
      <p className="text-sm text-gray-500 mb-3">Deliver to: {order.deliveryAddress}</p>

      {order.status === "preparing" && (
        <div className="flex gap-2">
          <button
            onClick={() => onMarkPickedUp(order._id)}
            className="bg-orange-600 text-white text-sm px-3 py-2 rounded-md hover:bg-orange-700"
          >
            Mark Picked Up
          </button>
          <button
            onClick={() => onCancelRequest(order._id)}
            className="text-sm text-red-600 border border-red-600 px-3 py-2 rounded-md hover:bg-red-50"
          >
            Cancel
          </button>
        </div>
      )}

      {order.status === "out_for_delivery" && (
        <button
          onClick={() => onMarkDelivered(order._id)}
          className="bg-green-600 text-white text-sm px-3 py-2 rounded-md hover:bg-green-700"
        >
          Mark as Delivered
        </button>
      )}
    </div>
  );
}

export default memo(DeliveryOrderCard);