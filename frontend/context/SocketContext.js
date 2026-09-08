"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "");
    const newSocket = io(socketUrl, { withCredentials: true });

    newSocket.on("connect_error", (err) => console.error("Socket connection error:", err.message));


    if (user.role === "user") {
      newSocket.on("order:statusUpdated", (update) => {
        showToast(`Your order is now: ${update.status.replace(/_/g, " ")}`);
      });
    }

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside a SocketProvider");
  }
  return context;
}