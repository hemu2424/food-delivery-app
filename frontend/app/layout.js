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
  title: "Food delivery",
  description: "Food delivery app ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ToastProvider>
          <AuthProvider>
            <AddressProvider>
              <SocketProvider>
                <CartProvider>
                  <Navbar />
                  {children}
                </CartProvider>
              </SocketProvider>
            </AddressProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
