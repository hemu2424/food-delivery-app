"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const [myOrders, setMyOrders] = useState([]);
  const [myOrdersPagination, setMyOrdersPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Delivery mate na state
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  const [allOrders, setAllOrders] = useState([]);
  const [allOrdersPagination, setAllOrdersPagination] = useState(null);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [adminOrdersError, setAdminOrdersError] = useState("");

  function removeAvailableOrderLocally(orderId) {
    setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId));
  }

  const fetchAllOrders = useCallback(async (page = 1) => {
    if (!user || user.role !== "admin") return;
    setAdminOrdersLoading(true);
    try {
      const response = await api.get("/orders", { params: { page } });
      const orders = Array.isArray(response.data) ? response.data : response.data.orders || [];
      const pagination = response.data?.pagination || null;
      setAllOrders(orders);
      setAllOrdersPagination(pagination);
      setAdminOrdersError("");
    } catch (err) {
      if (err.response?.status !== 401) {
        setAdminOrdersError("Could not load orders.");
      }
    } finally {
      setAdminOrdersLoading(false);
    }
  }, [user]);

  async function advanceOrderStatus(orderId, newStatus, currentPage = 1) {
    await api.put(`/orders/${orderId}/status`, { status: newStatus });
    await fetchAllOrders(currentPage);
  }

  const fetchMyOrders = useCallback(async (page = 1) => {
    if (!user) {
      setMyOrders([]);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get("/orders/my", { params: { page } });
      const orders = Array.isArray(response.data) ? response.data : response.data.orders || [];
      const pagination = response.data?.pagination || null;
      setMyOrders(orders);
      setMyOrdersPagination(pagination);
      setError("");
    } catch (err) {
      if (err.response?.status !== 401) {
        setError("Could not load your orders.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchDeliveryData = useCallback(async () => {
    if (!user || user.role !== "delivery") return;
    setDeliveryLoading(true);
    try {
      const [availableRes, myDeliveriesRes] = await Promise.all([
        api.get("/orders/available"),
        api.get("/orders/delivery/my"),
      ]);
      setAvailableOrders(availableRes.data);
      setMyDeliveries(myDeliveriesRes.data);
      setDeliveryError("");
    } catch (err) {
      if (err.response?.status !== 401) {
        setDeliveryError("Could not load delivery data.");
      }
    } finally {
      setDeliveryLoading(false);
    }
  }, [user]);

  async function acceptOrder(orderId) {
    await api.put(`/orders/${orderId}/accept`);
    await fetchDeliveryData(); 
  }

  async function markDelivered(orderId) {
    await api.put(`/orders/${orderId}/status`, { status: "delivered" });
    await fetchDeliveryData();
  }

  async function placeOrder(cartData) {
  const response = await api.post("/orders", {
    restaurant: cartData.restaurantId,
    deliveryAddress: cartData.deliveryAddress,
    latitude: cartData.latitude,
    longitude: cartData.longitude,
    items: cartData.items,
    paymentMethod: cartData.paymentMethod, 
  });
  return response.data;
}
async function verifyPayment(orderId, paymentData) {
  const response = await api.post(`/orders/${orderId}/verify-payment`, paymentData);
  return response.data;
}
async function markPickedUp(orderId) {
  await api.put(`/orders/${orderId}/pickup`);
  await fetchDeliveryData();
}

async function cancelAssignedOrder(orderId, reason, note) {
  await api.put(`/orders/${orderId}/cancel-delivery`, { reason, note });
  await fetchDeliveryData();
}

async function cancelOrder(orderId, reason, note, page = 1) {
  const response = await api.put(`/orders/${orderId}/cancel`, { reason, note });
  await fetchMyOrders(page);
  return response.data;
}

  return (
    <OrderContext.Provider
      value={{
        markPickedUp,
        cancelAssignedOrder,
        cancelOrder,
        verifyPayment,
        placeOrder,
        myOrders,
        myOrdersPagination,
        loading,
        error,
        fetchMyOrders,
        placeOrder,
        availableOrders,
        myDeliveries,
        deliveryLoading,
        deliveryError,
        fetchDeliveryData,
        acceptOrder,
        markDelivered,
        allOrders,
        allOrdersPagination,
        adminOrdersLoading,
        adminOrdersError,
        fetchAllOrders,
        advanceOrderStatus,
        removeAvailableOrderLocally,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrders must be used inside an OrderProvider");
  }
  return context;
}