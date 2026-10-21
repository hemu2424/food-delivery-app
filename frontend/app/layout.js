import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { AddressProvider } from "@/context/AddressContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "FoodDelivery",
  description: "A modern food delivery experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <AddressProvider>
              <SocketProvider>
                <CartProvider>
                  <div className="min-h-screen bg-transparent text-slate-900">
                    <Navbar />
                    <main className="pb-16 pt-6 sm:pt-8">{children}</main>
                  </div>
                </CartProvider>
              </SocketProvider>
            </AddressProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
