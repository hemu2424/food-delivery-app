"use client";

export default function AddressCard({ address, onSelect, onEdit, onDelete, onSetDefault, selectable }) {
  return (
    <div
      onClick={selectable ? () => onSelect(address) : undefined}
      className={`bg-white border rounded-lg p-4 ${selectable ? "cursor-pointer hover:border-orange-400" : ""}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium uppercase text-orange-600">{address.label}</span>
        {address.isDefault && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Default</span>
        )}
      </div>
      <p className="text-sm font-medium">{address.flatOrBuilding}</p>
      <p className="text-sm text-gray-500">{address.formattedAddress}</p>

      {!selectable && (
        <div className="flex gap-3 mt-2 text-sm">
          <button onClick={() => onEdit(address)} className="text-blue-600 hover:underline">
            Edit
          </button>
          {!address.isDefault && (
            <button onClick={() => onSetDefault(address._id)} className="text-orange-600 hover:underline">
              Set as default
            </button>
          )}
          <button onClick={() => onDelete(address._id)} className="text-red-600 hover:underline">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}