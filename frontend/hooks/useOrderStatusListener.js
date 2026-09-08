"use client";

import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";


export function useOrderStatusListener(onUpdate) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("order:statusUpdated", onUpdate);


    return () => {
      socket.off("order:statusUpdated", onUpdate);
    };
  }, [socket, onUpdate]);
}