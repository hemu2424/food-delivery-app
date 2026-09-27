import { OrderProvider } from "@/context/OrderContext";

export default function DeliveryLayout({ children }) {
  return (
    <OrderProvider>
      {children}
    </OrderProvider>
  );
}