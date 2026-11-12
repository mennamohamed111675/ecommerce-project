import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import ErrorState from "../components/ErrorState";
import ProductCard from "../components/ProductCard";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";

export default function Wishlist() {
  const { items, loading, refreshWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      await refreshWishlist();
    } catch (err) {
      setError(err.message || "Could not load wishlist");
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(product) {
    try {
      await toggleWishlist(product);
      showToast("Removed from wishlist");
    } catch (err) {
      showToast(err.message || "Could not remove item", "error");
    }
  }

  if (loading && items.length === 0) return <Loading label="Loading wishlist" />;
  return (
    <main className="page-shell">
      <div className="page-head">
        <span className="eyebrow">Wishlist</span>
        <h1>Saved products</h1>
      </div>
      {error ? <ErrorState message={error} onRetry={load} /> : items.length === 0 ? (
        <div className="empty-state">
          <h2>Your wishlist is empty</h2>
          <Link className="primary-button" to="/products">Browse products</Link>
        </div>
      ) : (
        <section className="products-grid">
          {items.map((product) => (
            <div className="wishlist-wrap" key={product.id || product._id}>
              <ProductCard product={product} />
              <button className="danger-button wide" onClick={() => remove(product)}>Remove from wishlist</button>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
