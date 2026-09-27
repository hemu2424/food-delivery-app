// components/delivery/AvailableOrderCard.js
"use client";

import { memo } from "react";
import OrderStatusBadge from "@/components/user/OrderStatusBadge";

function AvailableOrderCard({ order, onAccept }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="font-medium">{order.restaurant?.name}</p>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm text-gray-500 mb-3">Deliver to: {order.deliveryAddress}</p>
      <button
        onClick={() => onAccept(order._id)}
        className="bg-orange-600 text-white text-sm px-3 py-2 rounded-md hover:bg-orange-700"
      >
        Accept Delivery
      </button>
    </div>
  );
}

export default memo(AvailableOrderCard);