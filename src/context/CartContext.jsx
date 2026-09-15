import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

function getSavedCart() {
  try {
    const savedCart = localStorage.getItem("beunique-cart");

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getSavedCart);

  useEffect(() => {
    localStorage.setItem("beunique-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, size, quantity = 1) => {
    if (!product || product.stock <= 0 || !size || quantity <= 0) {
      return false;
    }

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id && item.size === size,
      );

      if (existingItem) {
        const nextQuantity = Math.min(
          existingItem.quantity + quantity,
          product.stock,
        );

        if (nextQuantity === existingItem.quantity) {
          return currentItems;
        }

        return currentItems.map((item) =>
          item.id === product.id && item.size === size
            ? {
                ...item,
                quantity: nextQuantity,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          size,
          quantity: Math.min(quantity, product.stock),
        },
      ];
    });

    return true;
  };

  const removeFromCart = (productId, size) => {
    setCartItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.id === productId && item.size === size),
      ),
    );
  };

  const updateQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== productId || item.size !== size) {
          return item;
        }

        const safeQuantity = Math.min(quantity, item.stock);

        return {
          ...item,
          quantity: safeQuantity,
        };
      }),
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }

  return context;
}