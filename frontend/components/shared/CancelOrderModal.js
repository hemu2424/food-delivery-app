"use client";

import { useState } from "react";

export default function CancelOrderModal({ isOpen, onClose, onConfirm, reasons, loading }) {
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-5 max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-1">Cancel this order?</h2>
        <p className="text-sm text-gray-500 mb-4">This cannot be undone.</p>

        <label className="text-sm font-medium block mb-1">Reason</label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm mb-3"
        >
          {reasons.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <label className="text-sm font-medium block mb-1">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm mb-4"
          rows={2}
          maxLength={300}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md border"
          >
            Keep Order
          </button>
          <button
            onClick={() => onConfirm(reason, note)}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "Cancelling..." : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}