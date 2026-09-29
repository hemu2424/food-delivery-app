"use client";

import { memo } from "react";
import Image from "next/image";

function MenuItemListItem({
  item,
  isEditing,
  onToggleEdit,
  onDelete,
  onDeleteImage,
  renderEditForm,
}) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{item.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
              {item.category || "General"}
            </span>
            <span className="text-sm font-bold text-orange-600">₹{item.price}</span>
          </div>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onToggleEdit(item._id)}
            className="text-xs border px-3 py-1.5 rounded-md hover:bg-gray-50 font-medium"
          >
            {isEditing ? "Close" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="text-xs text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-md font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {item.images?.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {item.images.map((img) => (
            <div key={img} className="relative w-16 h-16 rounded-md overflow-visible">
              <Image
                src={img}
                alt={item.name}
                fill
                sizes="64px"
                className="object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => onDeleteImage(item._id, img)}
                className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-700 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center z-10 shadow"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {isEditing && (
        <div className="mt-4 pt-4 border-t">{renderEditForm(item)}</div>
      )}
    </div>
  );
}

export default memo(MenuItemListItem);