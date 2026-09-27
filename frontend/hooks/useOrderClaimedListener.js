"use client";

import { useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";

export function useOrderClaimedListener(onClaimed) {
  const { socket } = useSocket();
  const callbackRef = useRef(onClaimed);

  useEffect(() => {
    callbackRef.current = onClaimed;
  }, [onClaimed]);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    socket.on("order:claimed", handler);

    return () => {
      socket.off("order:claimed", handler);
    };
  }, [socket]);
}