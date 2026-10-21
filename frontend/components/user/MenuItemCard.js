// components/user/MenuItemCard.js
"use client";

import { memo } from "react";
import Image from "next/image";

function MenuItemCard({ item, onAdd }) {
  const thumbnail = item.images?.[0];

  return (
    <div className="flex items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_10px_25px_rgba(15,23,42,0.04)] sm:p-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 sm:h-24 sm:w-24">
          {thumbnail ? (
            <Image src={thumbnail} alt={item.name} fill sizes="96px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">No image</div>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-base font-semibold text-slate-900">{item.name}</h4>
          <p className="mt-1 text-sm text-slate-500">{item.description || "Freshly prepared and packed for delivery."}</p>
          <p className="mt-2 text-base font-bold text-orange-600">₹{item.price}</p>
        </div>
      </div>
      <button onClick={() => onAdd(item)} className="btn-primary shrink-0 px-4 py-2.5 text-sm">
        Add
      </button>
    </div>
  );
}

export default memo(MenuItemCard);