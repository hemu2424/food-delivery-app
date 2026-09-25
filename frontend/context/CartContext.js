"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return null;
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : null;
  });

  useEffect(() => {
    if (cart !== null) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  const addItem = useCallback((restaurantId, restaurantName, menuItem) => {
    setCart((prevCart) => {
      if (prevCart && prevCart.restaurantId !== restaurantId) {
        const shouldReplace = window.confirm(
          "Your cart has items from another restaurant. Start a new cart?"
        );
        if (!shouldReplace) return prevCart;
        return {
          restaurantId,
          restaurantName,
          items: [{ menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1 }],
        };
      }

      const existingItems = prevCart ? prevCart.items : [];
      const alreadyInCart = existingItems.find((item) => item.menuItem === menuItem._id);

      let updatedItems;
      if (alreadyInCart) {
        updatedItems = existingItems.map((item) =>
          item.menuItem === menuItem._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedItems = [
          ...existingItems,
          { menuItem: menuItem._id, name: menuItem.name, price: menuItem.price, quantity: 1 },
        ];
      }

      return { restaurantId, restaurantName, items: updatedItems };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId, quantity) => {
    setCart((prevCart) => {
      if (!prevCart) return prevCart;
      if (quantity <= 0) {
        const remainingItems = prevCart.items.filter((item) => item.menuItem !== menuItemId);
        return remainingItems.length > 0 ? { ...prevCart, items: remainingItems } : null;
      }
      const updatedItems = prevCart.items.map((item) =>
        item.menuItem === menuItemId ? { ...item, quantity } : item
      );
      return { ...prevCart, items: updatedItems };
    });
  }, []);

  const clearCart = useCallback(() => setCart(null), []);

  const totalAmount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0,
    [cart]
  );
  const itemCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [cart]
  );

  const value = useMemo(
    () => ({ cart, addItem, updateQuantity, clearCart, totalAmount, itemCount }),
    [cart, addItem, updateQuantity, clearCart, totalAmount, itemCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside a CartProvider");
  return context;
}