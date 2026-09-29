import { LocationProvider } from "@/context/LocationContext";
import { OrderProvider } from "@/context/OrderContext";
import { RestaurantProvider } from "@/context/RestaurantContext";

export default function UserLayout({ children }) {
  return (
    <LocationProvider>
      <OrderProvider>
        <RestaurantProvider>
          {children}
        </RestaurantProvider>
      </OrderProvider>
    </LocationProvider>
  );
}
