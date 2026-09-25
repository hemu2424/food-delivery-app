import { SocketProvider } from "@/context/SocketContext";
import { OrderProvider } from "@/context/OrderContext";

export default function DeliveryLayout({ children }) {
  return (
    <SocketProvider>
      <OrderProvider>
        {children}
      </OrderProvider>
    </SocketProvider>
  );
}