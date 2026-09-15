import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { MenuItemProvider } from "@/context/MenuItemContext";
import { CartProvider } from "@/context/CartContext";
import { OrderProvider } from "@/context/OrderContext";
import { AdminProvider } from "@/context/AdminContext";
import { ToastProvider } from "@/context/ToastContext";
import { SocketProvider } from "@/context/SocketContext";
import { LocationProvider } from "@/context/LocationContext";
import { AddressProvider } from "@/context/AddressContext";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Food delivery",
  description: "Food delivery app ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js" 
          strategy="afterInteractive" 
        />

        <ToastProvider>
          <AuthProvider>
            <AddressProvider>
              <LocationProvider>
                <SocketProvider>
                  <CartProvider>
                    <OrderProvider>
                      <RestaurantProvider>
                        <MenuItemProvider>
                          <AdminProvider>
                            <Navbar />
                            {children}
                          </AdminProvider>
                        </MenuItemProvider>
                      </RestaurantProvider>
                    </OrderProvider>
                  </CartProvider>
                </SocketProvider>
              </LocationProvider>
            </AddressProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
