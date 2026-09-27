"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";

export function useOrderAvailableListener(onNewAvailable) {
  const { socket } = useSocket();
  const callbackRef = useRef(onNewAvailable);

  useEffect(() => {
    callbackRef.current = onNewAvailable;
  }, [onNewAvailable]);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    socket.on("order:newAvailable", handler);

    return () => {
      socket.off("order:newAvailable", handler);
    };
  }, [socket]);
}