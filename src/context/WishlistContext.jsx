import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);
const GUEST_WISH_KEY = "freshcart_guest_wishlist";

function withId(product) {
  return { ...product, id: product.id || product._id };
}

function readGuestWishlist() {
  try {
    const raw = JSON.parse(localStorage.getItem(GUEST_WISH_KEY) || "[]");
    return Array.isArray(raw) ? raw.map(withId) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => (isAuthenticated ? [] : readGuestWishlist()));
  const [loading, setLoading] = useState(false);

  async function refreshWishlist() {
    if (!isAuthenticated) {
      const nextItems = readGuestWishlist();
      setItems(nextItems);
      return nextItems;
    }
    setLoading(true);
    try {
      const data = await api.wishlist();
      const nextItems = (data.data || []).map(withId);
      setItems(nextItems);
      return nextItems;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshWishlist().catch(() => setItems([]));
  }, [isAuthenticated]);

  function isWishlisted(productId) {
    return items.some((item) => item.id === productId || item._id === productId);
  }

  async function toggleWishlist(product) {
    const productId = product.id || product._id;
    if (!isAuthenticated) {
      const current = readGuestWishlist();
      const exists = current.some((item) => item.id === productId || item._id === productId);
      const next = exists
        ? current.filter((item) => item.id !== productId && item._id !== productId)
        : [withId(product), ...current];
      localStorage.setItem(GUEST_WISH_KEY, JSON.stringify(next));
      setItems(next);
      return { active: !exists, message: exists ? "Removed from wishlist" : "Added to wishlist" };
    }
    if (isWishlisted(productId)) {
      await api.removeWishlist(productId);
      setItems((current) => current.filter((item) => item.id !== productId && item._id !== productId));
      return { active: false, message: "Removed from wishlist" };
    }
    await api.addWishlist(productId);
    setItems((current) => (current.some((item) => item.id === productId || item._id === productId) ? current : [withId(product), ...current]));
    return { active: true, message: "Added to wishlist" };
  }

  const value = useMemo(
    () => ({ items, loading, refreshWishlist, isWishlisted, toggleWishlist }),
    [items, loading, isAuthenticated]
  );
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
