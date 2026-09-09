"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAddresses } from "@/context/AddressContext";
import AddressCard from "@/components/user/AddressCard";
import AddAddressFlow from "@/components/user/AddAddressFlow";
import EditAddressForm from "@/components/user/EditAddressForm";

export default function AddressesPage() {
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
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Saved Addresses</h1>

        {!showAddFlow && !editingAddress && (
          <>
            {loading && <p className="text-gray-400">Loading...</p>}
            {!loading && addresses.length === 0 && <p className="text-gray-400 mb-4">No saved addresses yet.</p>}

            <div className="space-y-3 mb-4">
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
              className="w-full border-2 border-dashed rounded-lg p-4 text-sm text-orange-600 hover:bg-orange-50"
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
    </ProtectedRoute>
  );
}