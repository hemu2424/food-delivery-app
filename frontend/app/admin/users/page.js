"use client";

import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAdmin } from "@/context/AdminContext";






export default function AdminUsersPage() {
  const {
    customers, deliveryPartners, loading, error,
    fetchUsers, toggleBlockUser, approveDeliveryPartner,
  } = useAdmin();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <p className="text-gray-400">Loading users...</p>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Delivery Partners</h2>
        <div className="space-y-2 max-w-xl">
          {deliveryPartners.map((partner) => (
            <div key={partner._id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{partner.name}</p>
                <p className="text-sm text-gray-500">{partner.email}</p>
                <div className="flex gap-2 mt-1">
                  {!partner.isApproved && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      Pending Approval
                    </span>
                  )}
                  {partner.isBlocked && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {!partner.isApproved && (
                  <button
                    onClick={() => approveDeliveryPartner(partner._id)}
                    className="text-sm bg-orange-600 text-white px-3 py-1.5 rounded-md hover:bg-orange-700"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => toggleBlockUser(partner._id)}
                  className="text-sm border px-3 py-1.5 rounded-md hover:bg-gray-50"
                >
                  {partner.isBlocked ? "Unblock" : "Block"}
                </button>
              </div>
            </div>
          ))}
          {deliveryPartners.length === 0 && (
            <p className="text-gray-400 text-sm">No delivery partners registered yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">Customers</h2>
        <div className="space-y-2 max-w-xl">
          {customers.map((customer) => (
            <div key={customer._id} className="bg-white border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-gray-500">{customer.email}</p>
                {customer.isBlocked && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                    Blocked
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleBlockUser(customer._id)}
                className="text-sm border px-3 py-1.5 rounded-md hover:bg-gray-50"
              >
                {customer.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          ))}
          {customers.length === 0 && (
            <p className="text-gray-400 text-sm">No customers registered yet.</p>
          )}
        </div>
      </section>
    </ProtectedRoute>
  );
}