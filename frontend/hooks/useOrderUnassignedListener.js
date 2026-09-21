"use client";

import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";

export function useOrderUnassignedListener(onUnassigned) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on("order:unassigned", onUnassigned);
    return () => {
      socket.off("order:unassigned", onUnassigned);
    };
  }, [socket, onUnassigned]);
}