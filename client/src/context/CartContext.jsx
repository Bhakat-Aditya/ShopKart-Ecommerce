import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // 1. Load cart from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem("cartItems");
    return localData ? JSON.parse(localData) : [];
  });

  // 2. Load Shipping Address from localStorage
  const [shippingAddress, setShippingAddress] = useState(() => {
    const localData = localStorage.getItem("shippingAddress");
    return localData ? JSON.parse(localData) : {};
  });

  // Save Cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Save Shipping Address to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));
  }, [shippingAddress]);

  // --- Actions ---

  const addToCart = (product, qty) => {
    setCartItems((prevItems) => {
      const existItem = prevItems.find((x) => x._id === product._id);

      if (existItem) {
        return prevItems.map((x) =>
          x._id === product._id ? { ...x, qty: existItem.qty + qty } : x
        );
      } else {
        return [...prevItems, { ...product, qty }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((x) => x._id !== id));
  };

  const saveShippingAddress = (data) => {
    setShippingAddress(data);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        shippingAddress,    
        saveShippingAddress 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};