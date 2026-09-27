"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";

export function useOrderCancelledListener(onCancelled) {
  const { socket } = useSocket();
  const callbackRef = useRef(onCancelled);

  useEffect(() => {
    callbackRef.current = onCancelled;
  }, [onCancelled]);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    socket.on("order:cancelled", handler);

    return () => {
      socket.off("order:cancelled", handler);
    };
  }, [socket]);
}