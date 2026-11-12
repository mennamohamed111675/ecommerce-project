import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { api } from "../services/api";
import { normalizeProducts } from "../utils/format";

function uniqueProducts(list) {
  const seen = new Set();
  return list.filter((product) => {
    const key = product?.id || product?._id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(0);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [catPayload, productPayload] = await Promise.all([api.categories(), api.allProducts()]);
        setCategories(catPayload.data || []);
        setProducts(uniqueProducts(normalizeProducts(productPayload)));
      } catch {
        setCategories([]);
        setProducts([]);
      }
    }
    loadHomeData();
  }, []);

  const spotlight = useMemo(() => products.slice(0, 5), [products]);

  useEffect(() => {
    if (spotlight.length < 2) return undefined;
    const timer = setInterval(() => {
      setActiveProduct((current) => (current + 1) % spotlight.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [spotlight.length]);

  const heroProduct = spotlight[activeProduct] || spotlight[0];
  const worlds = categories.slice(0, 6);
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const product of products) {
      const id = product.category?._id;
      if (!id) continue;
      counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
  }, [products]);
  const bestSellers = useMemo(() => {
    const seen = new Set();
    return [...products]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .filter((product) => {
        const title = product.title || product.id;
        if (seen.has(title)) return false;
        seen.add(title);
        return true;
      })
      .slice(0, 4);
  }, [products]);
  const bestTitles = new Set(bestSellers.map((product) => product.title));
  const justArrived = products.filter((product) => !bestTitles.has(product.title)).slice(0, 8);

  return (
    <main className="home">
      <svg className="hero-clip" aria-hidden="true">
        <clipPath id="hero-wave" clipPathUnits="objectBoundingBox">
          <path d="M0.16,0 C0.02,0.16 0.24,0.28 0.06,0.46 C-0.02,0.6 0.22,0.72 0.05,0.88 C0.01,0.96 0.08,1 0,1 L1,1 L1,0 Z" />
        </clipPath>
      </svg>
      <section className="stage">
        <div className="stage-copy">
          <h1>The new everyday edit.</h1>
          <p className="stage-lead">Soft layers across fashion, home, and tech. The shop is open — come see what’s inside.</p>
          <div className="hero-actions">
            <Link className="primary-button luxe-cta" to="/products">Shop the collection <ArrowRight size={18} /></Link>
            <Link className="secondary-button glass-cta" to="/categories">Shop categories</Link>
          </div>
        </div>
        <Link to={heroProduct ? `/products/${heroProduct.id}` : "/products"} className="stage-panel">
          {heroProduct ? <img src={heroProduct.imageCover} alt={heroProduct.title} /> : <div className="product-placeholder" />}
        </Link>
      </section>

      <div className="trust-strip">
        <span>Delivery across Egypt</span>
        <span>Cash on delivery</span>
        <span>14-day exchange</span>
        <span>Free over 500 EGP</span>
      </div>

      {worlds.length > 0 && (
        <section className="home-block">
          <div className="section-topline">
            <div>
              <span className="lux-eyebrow">Categories</span>
              <h2>Find your world</h2>
            </div>
            <Link className="secondary-button" to="/categories">All categories</Link>
          </div>
          <div className="cat-row">
            {worlds.map((category) => (
              <Link to={`/products?category=${category._id}`} className="cat-tile" key={category._id}>
                <img src={category.image} alt="" />
                <span>
                  <strong>{category.name}</strong>
                  {categoryCounts[category._id] ? <small>{categoryCounts[category._id]} pieces</small> : null}
                  <ArrowRight size={16} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {bestSellers.length > 0 && (
        <section className="home-block">
          <div className="section-topline">
            <div>
              <span className="lux-eyebrow">Most loved</span>
              <h2>Best sellers</h2>
            </div>
            <Link className="secondary-button" to="/products">View all</Link>
          </div>
          <div className="home-grid">
            {bestSellers.map((product) => <ProductCard product={product} key={product.id || product._id} />)}
          </div>
        </section>
      )}

      {justArrived.length > 0 && (
        <section className="home-block">
          <div className="section-topline">
            <div>
              <span className="lux-eyebrow">New in</span>
              <h2>Just arrived</h2>
            </div>
            <Link className="secondary-button" to="/products">Shop the edit</Link>
          </div>
          <div className="home-grid">
            {justArrived.map((product) => <ProductCard product={product} key={product.id || product._id} />)}
          </div>
        </section>
      )}

      <section className="home-note">
        <span className="lux-eyebrow">FreshCart</span>
        <h2>Everyday pieces, ready when you are.</h2>
        <Link className="primary-button" to="/products">Shop the collection</Link>
      </section>
    </main>
  );
}
