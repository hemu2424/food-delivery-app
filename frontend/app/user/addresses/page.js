"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAddresses } from "@/context/AddressContext";
import AddressCard from "@/components/user/AddressCard";
import AddAddressFlow from "@/components/user/AddAddressFlow";
import EditAddressForm from "@/components/user/EditAddressForm";

function AddressesContent() {
  const { addresses, loading, fetchAddresses, deleteAddress, setDefaultAddress } = useAddresses();
  const [showAddFlow, setShowAddFlow] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // the address object currently being edited, or null

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  async function handleDelete(id) {
    if (!confirm("Delete this address?")) return;
    await deleteAddress(id);
  }

  return (
    <div className="app-shell max-w-2xl">
      <div className="mb-6">
        <span className="eyebrow">Places</span>
        <h1 className="mt-4 section-title">Saved Addresses</h1>
      </div>

      {!showAddFlow && !editingAddress && (
        <>
          {loading && <p className="text-sm text-slate-500">Loading...</p>}
          {!loading && addresses.length === 0 && <div className="soft-panel p-6 text-sm text-slate-500">No saved addresses yet.</div>}

          <div className="space-y-3">
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onEdit={setEditingAddress}
                onDelete={handleDelete}
                onSetDefault={setDefaultAddress}
              />
            ))}
          </div>

          <button
            onClick={() => setShowAddFlow(true)}
            className="btn-secondary mt-5 w-full justify-center"
          >
            + Add New Address
          </button>
        </>
      )}

      {showAddFlow && (
        <AddAddressFlow onSuccess={() => setShowAddFlow(false)} onCancel={() => setShowAddFlow(false)} />
      )}

      {editingAddress && (
        <EditAddressForm
          address={editingAddress}
          onSuccess={() => setEditingAddress(null)}
          onCancel={() => setEditingAddress(null)}
        />
      )}
    </div>
  );
}

export default function AddressesPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <AddressesContent />
    </ProtectedRoute>
  );
}