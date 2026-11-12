import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const GUEST_CART_KEY = "freshcart_guest_cart";

function readGuestItems() {
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeGuestItems(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function toGuestCart(items) {
  const products = items.map((item) => ({
    product: item.product,
    price: item.price,
    count: item.count,
  }));
  return {
    _id: "guest",
    products,
    totalCartPrice: products.reduce((sum, item) => sum + item.price * item.count, 0),
    numOfCartItems: products.reduce((sum, item) => sum + item.count, 0),
  };
}

function productIdOf(product) {
  return product?.id || product?._id;
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(() => (isAuthenticated ? null : toGuestCart(readGuestItems())));
  const [loading, setLoading] = useState(false);

  function saveGuest(items) {
    writeGuestItems(items);
    const next = toGuestCart(items);
    setCart(next);
    return next;
  }

  async function refreshCart() {
    if (!isAuthenticated) {
      const next = toGuestCart(readGuestItems());
      setCart(next);
      return next;
    }
    setLoading(true);
    try {
      const data = await api.getCart();
      setCart(data.data);
      return data.data;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshCart().catch(() => setCart(isAuthenticated ? null : toGuestCart([])));
  }, [isAuthenticated]);

  async function resolveProduct(productOrId) {
    if (productOrId && typeof productOrId === "object") {
      const id = productIdOf(productOrId);
      return { ...productOrId, id };
    }
    const data = await api.product(productOrId);
    const product = data.data || {};
    return { ...product, id: product.id || product._id || productOrId };
  }

  async function addToCart(productOrId, count = 1) {
    const amount = Math.max(1, count);
    if (!isAuthenticated) {
      const product = await resolveProduct(productOrId);
      const id = productIdOf(product);
      const items = readGuestItems();
      const found = items.find((item) => productIdOf(item.product) === id);
      if (found) found.count += amount;
      else items.unshift({ product, price: product.price || 0, count: amount });
      return saveGuest(items);
    }
    let data;
    for (let i = 0; i < amount; i += 1) data = await api.addToCart(productIdOf(productOrId) || productOrId);
    await refreshCart();
    return data;
  }

  async function updateQuantity(productId, count) {
    if (!isAuthenticated) {
      const items = readGuestItems()
        .map((item) => (productIdOf(item.product) === productId ? { ...item, count } : item))
        .filter((item) => item.count > 0);
      return saveGuest(items);
    }
    const data = await api.updateCartQuantity(productId, count);
    setCart(data.data);
    return data;
  }

  async function removeItem(productId) {
    if (!isAuthenticated) {
      return saveGuest(readGuestItems().filter((item) => productIdOf(item.product) !== productId));
    }
    const data = await api.removeCartItem(productId);
    setCart(data.data);
    return data;
  }

  async function clearCart() {
    if (!isAuthenticated) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart(null);
      return null;
    }
    const data = await api.clearCart();
    setCart(null);
    return data;
  }

  const value = useMemo(
    () => ({ cart, loading, refreshCart, addToCart, updateQuantity, removeItem, clearCart }),
    [cart, loading, isAuthenticated]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
