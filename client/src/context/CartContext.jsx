import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "CART_ADD_ITEM":
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);

      if (existItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(
            (x) =>
              x._id === existItem._id ? { ...x, qty: x.qty + item.qty } : x, // This accumulates (Good for Product Page)
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, item],
        };
      }

    // --- NEW CASE: UPDATE QUANTITY DIRECTLY (For Cart Page) ---
    case "CART_UPDATE_QTY":
      return {
        ...state,
        cartItems: state.cartItems.map((x) =>
          x._id === action.payload.id ? { ...x, qty: action.payload.qty } : x,
        ),
      };
    // ---------------------------------------------------------

    case "CART_REMOVE_ITEM":
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x._id !== action.payload),
      };

    case "CART_SAVE_SHIPPING_ADDRESS":
      return {
        ...state,
        shippingAddress: action.payload,
      };

    case "CART_CLEAR":
      return {
        ...state,
        cartItems: [],
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    cartItems: JSON.parse(localStorage.getItem("cartItems")) || [],
    shippingAddress: JSON.parse(localStorage.getItem("shippingAddress")) || {},
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    localStorage.setItem(
      "shippingAddress",
      JSON.stringify(state.shippingAddress),
    );
  }, [state.cartItems, state.shippingAddress]);

  const addToCart = (product, qty) => {
    dispatch({
      type: "CART_ADD_ITEM",
      payload: { ...product, qty },
    });
  };

  // --- NEW FUNCTION ---
  const updateQuantity = (id, qty) => {
    dispatch({
      type: "CART_UPDATE_QTY",
      payload: { id, qty },
    });
  };
  // -------------------

  const removeFromCart = (id) => {
    dispatch({ type: "CART_REMOVE_ITEM", payload: id });
  };

  const saveShippingAddress = (data) => {
    dispatch({ type: "CART_SAVE_SHIPPING_ADDRESS", payload: data });
  };

  const clearCart = () => {
    dispatch({ type: "CART_CLEAR" });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        updateQuantity, // Export this
        removeFromCart,
        saveShippingAddress,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
