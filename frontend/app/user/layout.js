import { AddressProvider } from "@/context/AddressContext";
import { LocationProvider } from "@/context/LocationContext";
import { OrderProvider } from "@/context/OrderContext";
import { RestaurantProvider } from "@/context/RestaurantContext";

export default function UserLayout({ children }) {
  return (
    <AddressProvider>
      <LocationProvider>
        <OrderProvider>
          <RestaurantProvider>
            {children}
          </RestaurantProvider>
        </OrderProvider>
      </LocationProvider>
    </AddressProvider>
  );
}