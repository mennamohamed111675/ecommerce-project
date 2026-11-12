import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-pro clean-footer">
      <div className="footer-grid compact-footer">
        <div className="footer-brand">
          <Link className="brand" to="/">
            <span className="brand-mark">F</span>
            <span className="brand-name">FreshCart</span>
          </Link>
          <p>A React storefront with catalog, auth, cart, wishlist, and checkout.</p>
        </div>
        <div>
          <h3>Shop</h3>
          <Link to="/products">Products</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/brands">Brands</Link>
        </div>
        <div>
          <h3>Account</h3>
          <Link to="/login">Login</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/wishlist">Wishlist</Link>
        </div>
        <div>
          <h3>Contact</h3>
          <a href="" target="_blank" rel="noreferrer">GitHub</a>
          <a href="" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="">Email</a>
        </div>
      </div>
    </footer>
  );
}
