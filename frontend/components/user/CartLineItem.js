"use client";

import { memo } from "react";

function CartLineItem({ item, onUpdateQuantity }) {
  return (
    <div className="flex items-center justify-between bg-white border rounded-lg p-3">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-gray-500">₹{item.price} each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.menuItem, item.quantity - 1)}
          className="w-7 h-7 border rounded-md hover:bg-gray-50"
        >
          -
        </button>
        <span className="w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.menuItem, item.quantity + 1)}
          className="w-7 h-7 border rounded-md hover:bg-gray-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default memo(CartLineItem);