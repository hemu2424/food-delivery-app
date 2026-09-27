"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";

export function useOrderCreatedListener(onCreated) {
  const { socket } = useSocket();
  const callbackRef = useRef(onCreated);

  useEffect(() => {
    callbackRef.current = onCreated;
  }, [onCreated]);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    socket.on("order:created", handler);

    return () => {
      socket.off("order:created", handler);
    };
  }, [socket]);
}
