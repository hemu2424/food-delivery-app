import { AddressProvider } from "@/context/AddressContext";
import { LocationProvider } from "@/context/LocationContext";
import { SocketProvider } from "@/context/SocketContext";
import { OrderProvider } from "@/context/OrderContext";
import { RestaurantProvider } from "@/context/RestaurantContext";

export default function UserLayout({ children }) {
  return (
    <AddressProvider>
      <LocationProvider>
        <SocketProvider>
          <OrderProvider>
            <RestaurantProvider>
              {children}
            </RestaurantProvider>
          </OrderProvider>
        </SocketProvider>
      </LocationProvider>
    </AddressProvider>
  );
}