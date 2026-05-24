import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('hotelqr_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [tableNumber, setTableNumber] = useState(() => {
    return localStorage.getItem('hotelqr_table') || '';
  });

  const [specialInstructions, setSpecialInstructions] = useState('');

  // Persist cart items
  useEffect(() => {
    localStorage.setItem('hotelqr_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist table number
  useEffect(() => {
    if (tableNumber) {
      localStorage.setItem('hotelqr_table', tableNumber);
    } else {
      localStorage.removeItem('hotelqr_table');
    }
  }, [tableNumber]);

  // Helper: Add item to cart
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c._id === item._id);
      if (existing) {
        return prevCart.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  // Helper: Remove/Decrease quantity
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c._id === itemId);
      if (!existing) return prevCart;
      
      if (existing.quantity === 1) {
        return prevCart.filter((c) => c._id !== itemId);
      }
      return prevCart.map((c) =>
        c._id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  };

  // Helper: Entirely delete item from cart
  const deleteItem = (itemId) => {
    setCart((prevCart) => prevCart.filter((c) => c._id !== itemId));
  };

  // Helper: Clear entire cart
  const clearCart = () => {
    setCart([]);
    setSpecialInstructions('');
  };

  // Helper: Calculate total items count
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Helper: Calculate total cart price
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        tableNumber,
        setTableNumber,
        specialInstructions,
        setSpecialInstructions,
        addToCart,
        removeFromCart,
        deleteItem,
        clearCart,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
