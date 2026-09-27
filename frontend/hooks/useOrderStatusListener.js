"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";

export function useOrderStatusListener(onUpdate) {
  const { socket } = useSocket();
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    socket.on("order:statusUpdated", handler);

    return () => {
      socket.off("order:statusUpdated", handler);
    };
  }, [socket]);
}