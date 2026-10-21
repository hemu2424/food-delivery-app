"use client";

export default function AddressCard({ address, onSelect, onEdit, onDelete, onSetDefault, selectable }) {
  return (
    <div
      onClick={selectable ? () => onSelect(address) : undefined}
      className={`surface-card p-4 transition ${selectable ? "cursor-pointer hover:border-orange-200 hover:shadow-[0_12px_30px_rgba(249,115,22,0.08)]" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">{address.label}</span>
        {address.isDefault && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">Default</span>
        )}
      </div>
      <p className="text-base font-semibold text-slate-900">{address.flatOrBuilding}</p>
      <p className="mt-1 text-sm leading-6 text-slate-600">{address.formattedAddress}</p>

      {!selectable && (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <button onClick={() => onEdit(address)} className="font-medium text-blue-600 transition hover:text-blue-700 hover:underline">
            Edit
          </button>
          {!address.isDefault && (
            <button onClick={() => onSetDefault(address._id)} className="font-medium text-orange-600 transition hover:text-orange-700 hover:underline">
              Set as default
            </button>
          )}
          <button onClick={() => onDelete(address._id)} className="font-medium text-red-600 transition hover:text-red-700 hover:underline">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}