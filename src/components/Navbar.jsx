import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, LogOut, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../services/api";
import { formatPrice, productMatches } from "../utils/format";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, userName, logout } = useAuth();
  const { cart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState([]);
  const cartCount = cart?.numOfCartItems || cart?.products?.reduce((sum, item) => sum + item.count, 0) || 0;

  function closeMenu() {
    setMenuOpen(false);
  }

  function openSearch() {
    setMenuOpen(false);
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  function submitSearch(event) {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
    closeSearch();
    closeMenu();
  }

  const results = useMemo(() => {
    const term = query.trim();
    if (!term) return [];
    return catalog.filter((product) => productMatches(product, term)).slice(0, 6);
  }, [catalog, query]);

  useEffect(() => {
    function closeOnResize() {
      if (window.innerWidth > 980) setMenuOpen(false);
    }
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-lock", menuOpen);
    return () => document.body.classList.remove("menu-lock");
  }, [menuOpen]);

  useEffect(() => {
    let active = true;
    api.allProducts()
      .then((payload) => { if (active) setCatalog(payload.data || []); })
      .catch(() => { if (active) setCatalog([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!searchOpen) return undefined;
    function onKey(event) {
      if (event.key === "Escape") closeSearch();
    }
    function onPointer(event) {
      if (!event.target.closest(".search-layer") && !event.target.closest(".search-toggle")) closeSearch();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [searchOpen]);

  const promo = ["Good things inside", "Delivery across Egypt", "Secure checkout", "Easy returns", "Free over 500 EGP"];

  return (
    <>
      <div className="site-head">
      <div className="promo-bar" aria-hidden="true">
        <div className="promo-track">
          {[...promo, ...promo].map((item, index) => <span key={`${item}-${index}`}>{item}</span>)}
        </div>
      </div>
      <header className="navbar">
        <div className="nav-left">
          <button className={`menu-button ${menuOpen ? "active" : ""}`} aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className="nav-links desktop-nav">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/products">Products</NavLink>
            <NavLink to="/categories">Categories</NavLink>
            <NavLink to="/brands">Brands</NavLink>
          </nav>
        </div>

        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="brand-mark">F</span>
          <span className="brand-name">FreshCart</span>
        </Link>

        <div className="nav-actions">
          <button className={`icon-link search-toggle ${searchOpen ? "active" : ""}`} aria-label="Search" aria-expanded={searchOpen} onClick={() => (searchOpen ? closeSearch() : openSearch())}><Search size={19} /></button>
          <Link className="icon-link" to="/wishlist" aria-label="Wishlist"><Heart size={19} /></Link>
          <Link className="icon-link count-link" to="/cart" aria-label="Cart"><ShoppingCart size={19} />{cartCount > 0 && <span>{cartCount}</span>}</Link>
          {isAuthenticated ? (
            <button className="ghost-button account-button" onClick={logout} title={userName || "Logout"}><LogOut size={18} /> Logout</button>
          ) : (
            <Link className="login-link account-button" to="/login"><User size={17} /> Login</Link>
          )}
        </div>
      </header>
      {searchOpen && (
        <div className="search-layer">
          <form className="search-bar" onSubmit={submitSearch}>
            <Search size={18} />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, brands, categories" aria-label="Search products" />
            <button type="button" aria-label="Close search" onClick={closeSearch}><X size={18} /></button>
          </form>
          {query.trim() && (
            <div className="search-results">
              {results.length === 0 ? <p className="search-empty">No products found</p> : results.map((product) => (
                <Link className="search-hit" to={`/products/${product.id || product._id}`} key={product.id || product._id} onClick={closeSearch}>
                  <img src={product.imageCover} alt="" />
                  <span><strong>{product.title}</strong><small>{product.category?.name}</small></span>
                  <b>{formatPrice(product.price)}</b>
                </Link>
              ))}
              {results.length > 0 && <Link className="search-all" to={`/products?search=${encodeURIComponent(query.trim())}`} onClick={closeSearch}>View all results</Link>}
            </div>
          )}
        </div>
      )}
      </div>

      <div className={`mobile-menu-backdrop ${menuOpen ? "active" : ""}`} onClick={closeMenu} />
      <aside className={`mobile-menu ${menuOpen ? "active" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-head">
          <Link className="brand" to="/" onClick={closeMenu}><span className="brand-mark">F</span><span className="brand-name">FreshCart</span></Link>
          <button className="menu-close" onClick={closeMenu} aria-label="Close menu"><X size={22} /></button>
        </div>

        <button className="mobile-search" onClick={openSearch}><Search size={18} /> Search products</button>

        <nav className="mobile-nav-links">
          <NavLink to="/" onClick={closeMenu}>Home</NavLink>
          <NavLink to="/products" onClick={closeMenu}>Products</NavLink>
          <NavLink to="/categories" onClick={closeMenu}>Categories</NavLink>
          <NavLink to="/brands" onClick={closeMenu}>Brands</NavLink>
          <NavLink to="/wishlist" onClick={closeMenu}>Wishlist</NavLink>
          <NavLink to="/cart" onClick={closeMenu}>Cart {cartCount > 0 ? `(${cartCount})` : ""}</NavLink>
        </nav>

        <div className="mobile-auth-actions">
          {isAuthenticated ? (
            <button className="ghost-button wide" onClick={() => { logout(); closeMenu(); }}><LogOut size={18} /> Logout</button>
          ) : (
            <Link className="primary-button wide" to="/login" onClick={closeMenu}><User size={17} /> Login</Link>
          )}
        </div>
      </aside>
    </>
  );
}
