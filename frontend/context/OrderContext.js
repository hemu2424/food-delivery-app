"use client";

import { createContext, useContext, useState, useCallback, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { user } = useAuth();

  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  const removeAvailableOrderLocally = useCallback((orderId) => {
    setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId));
  }, []);

  const advanceOrderStatus = useCallback(async (orderId, newStatus) => {
    const response = await api.put(`/orders/${orderId}/status`, { status: newStatus });
    return response.data;
  }, []);

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
      if (err.response?.status !== 401) setDeliveryError("Could not load delivery data.");
    } finally {
      setDeliveryLoading(false);
    }
  }, [user]);

  const acceptOrder = useCallback(async (orderId) => {
    await api.put(`/orders/${orderId}/accept`);
    await fetchDeliveryData();
  }, [fetchDeliveryData]);

  const markDelivered = useCallback(async (orderId) => {
    await api.put(`/orders/${orderId}/status`, { status: "delivered" });
    await fetchDeliveryData();
  }, [fetchDeliveryData]);

  const placeOrder = useCallback(async (cartData) => {
    const response = await api.post("/orders", {
      restaurant: cartData.restaurantId,
      deliveryAddress: cartData.deliveryAddress,
      latitude: cartData.latitude,
      longitude: cartData.longitude,
      items: cartData.items,
      paymentMethod: cartData.paymentMethod,
    });
    return response.data;
  }, []);

  const verifyPayment = useCallback(async (orderId, paymentData) => {
    const response = await api.post(`/orders/${orderId}/verify-payment`, paymentData);
    return response.data;
  }, []);

  const markPickedUp = useCallback(async (orderId) => {
    await api.put(`/orders/${orderId}/pickup`);
    await fetchDeliveryData();
  }, [fetchDeliveryData]);

  const cancelAssignedOrder = useCallback(async (orderId, reason, note) => {
    await api.put(`/orders/${orderId}/cancel-delivery`, { reason, note });
    await fetchDeliveryData();
  }, [fetchDeliveryData]);

  const cancelOrder = useCallback(async (orderId, reason, note) => {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason, note });
    return response.data;
  }, []);

  const value = useMemo(() => ({
    markPickedUp, cancelAssignedOrder, cancelOrder, verifyPayment, placeOrder,
    availableOrders, myDeliveries, deliveryLoading, deliveryError, fetchDeliveryData,
    acceptOrder, markDelivered,
    advanceOrderStatus, removeAvailableOrderLocally,
  }), [
    markPickedUp, cancelAssignedOrder, cancelOrder, verifyPayment, placeOrder,
    availableOrders, myDeliveries, deliveryLoading, deliveryError, fetchDeliveryData,
    acceptOrder, markDelivered,
    advanceOrderStatus, removeAvailableOrderLocally,
  ]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used inside an OrderProvider");
  return context;
}