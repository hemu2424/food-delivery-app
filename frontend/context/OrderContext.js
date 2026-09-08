"use client";

import { createContext, useContext, useState, useCallback } from "react";
import api from "@/lib/api";

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Delivery mate na state
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

  const [allOrders, setAllOrders] = useState([]);
const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
const [adminOrdersError, setAdminOrdersError] = useState("");

function removeAvailableOrderLocally(orderId) {
  setAvailableOrders((prev) => prev.filter((order) => order._id !== orderId));
}

const fetchAllOrders = useCallback(async () => {
  setAdminOrdersLoading(true);
  try {
    const response = await api.get("/orders");
    setAllOrders(response.data);
    setAdminOrdersError("");
  } catch (err) {
    setAdminOrdersError("Could not load orders.");
  } finally {
    setAdminOrdersLoading(false);
  }
}, []);

async function advanceOrderStatus(orderId, newStatus, currentPage = 1) {
  await api.put(`/orders/${orderId}/status`, { status: newStatus });
  await fetchAllOrders(currentPage);
}
//   ---

  const fetchMyOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/orders/my");
      setMyOrders(response.data);
      setError("");
    } catch (err) {
      setError("Could not load your orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function placeOrder(cartData) {
    const response = await api.post("/orders", {
      restaurant: cartData.restaurantId,
      deliveryAddress: cartData.deliveryAddress,
      items: cartData.items,
    });
    return response.data;
  }


  const fetchDeliveryData = useCallback(async () => {
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
      setDeliveryError("Could not load delivery data.");
    } finally {
      setDeliveryLoading(false);
    }
  }, []);

  async function acceptOrder(orderId) {
    await api.put(`/orders/${orderId}/accept`);
    await fetchDeliveryData(); 
  }

  async function markDelivered(orderId) {
    await api.put(`/orders/${orderId}/status`, { status: "delivered" });
    await fetchDeliveryData();
  }

  return (
    <OrderContext.Provider
      value={{
        myOrders, loading, error, fetchMyOrders, placeOrder,
        availableOrders, myDeliveries, deliveryLoading, deliveryError,
        fetchDeliveryData, acceptOrder, markDelivered,
        allOrders, adminOrdersLoading, adminOrdersError, fetchAllOrders, advanceOrderStatus, removeAvailableOrderLocally
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