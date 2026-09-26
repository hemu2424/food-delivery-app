"use client";

import { memo } from "react";
import Image from "next/image";

function MenuItemListItem({ item, isEditing, onToggleEdit, onDelete, onDeleteImage, renderEditForm }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{item.name}</p>
          <p className="text-sm text-gray-500">{item.category}</p>
          <p className="text-sm font-semibold text-orange-600">₹{item.price}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onToggleEdit(item._id)} className="text-sm border px-3 py-1.5 rounded-md">
            {isEditing ? "Close" : "Edit"}
          </button>
          <button onClick={() => onDelete(item._id)} className="text-sm text-red-600 border border-red-200 px-3 py-1.5 rounded-md">
            Delete
          </button>
        </div>
      </div>

      {item.images?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {item.images.map((img) => (
            <div key={img} className="relative w-16 h-16">
              <Image src={img} alt={item.name} fill sizes="64px" className="object-cover rounded-md border" />
              <button
                onClick={() => onDeleteImage(item._id, img)}
                className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-xs z-10"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {isEditing && <div className="mt-4 pt-4 border-t">{renderEditForm(item)}</div>}
    </div>
  );
}

export default memo(MenuItemListItem);