"use client";

import { createContext, useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const showOrderStatusToast = useEffectEvent((update) => {
    showToast(`Your order is now: ${update.status.replace(/_/g, " ")}`);
  });

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socketUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace("/api", "");
    const newSocket = io(socketUrl, { withCredentials: true });
    socketRef.current = newSocket;

    newSocket.on("connect_error", (err) => console.error("Socket connection error:", err.message));
    newSocket.on("connect", () => setSocket(newSocket));


    if (user.role === "user") {
      newSocket.on("order:statusUpdated", showOrderStatusToast);
    }

    return () => {
      newSocket.disconnect();
      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }
    };
  }, [user, showToast]);

  return <SocketContext.Provider value={{ socket: user ? socket : null }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used inside a SocketProvider");
  }
  return context;
}
