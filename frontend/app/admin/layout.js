import { OrderProvider } from "@/context/OrderContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { MenuItemProvider } from "@/context/MenuItemContext";
import { AdminProvider } from "@/context/AdminContext";

export default function AdminLayout({ children }) {
  return (
    <OrderProvider>
      <RestaurantProvider>
        <MenuItemProvider>
          <AdminProvider>
            {children}
          </AdminProvider>
        </MenuItemProvider>
      </RestaurantProvider>
    </OrderProvider>
  );
}