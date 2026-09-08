"use client";

import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";


export function useOrderClaimedListener(onClaimed) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("order:claimed", onClaimed);

    return () => {
      socket.off("order:claimed", onClaimed);
    };
  }, [socket, onClaimed]);
}