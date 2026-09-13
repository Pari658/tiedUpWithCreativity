import { useEffect, useState } from "react";
import "../../assets/css/User.css";
import { useNavigate } from 'react-router-dom';
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// Icons Object (Keeping your existing SVG definitions)
const Icons = {
  Bracelet: () => (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="16" cy="7" r="2" fill="white" />
      <circle cx="23.2" cy="20.6" r="1.5" fill="white" />
      <circle cx="8.8" cy="20.6" r="1.5" fill="white" />
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  CartPlus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      <line x1="12" y1="9" x2="12" y2="15" /><line x1="9" y1="12" x2="15" y2="12" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Grid: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
};

function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (loading || added) return;
    setLoading(true);
    const success = await onAddToCart(product);
    setLoading(false);
    if (success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  return (
    <div className="ud-product-card">
      <div className="ud-card-image-wrap">
        {!product.stock && (
          <div className="ud-out-of-stock"><span className="ud-oos-label">Out of Stock</span></div>
        )}
        {product.product_images?.length > 0 ? (
          <img src={product.product_images[0].image_url} alt={product.product_name} className="ud-card-img" />
        ) : (
          <div className="ud-card-img-placeholder">No Image</div>
        )}
      </div>
      <div className="ud-card-body">
        <p className="ud-card-category">{product.product_name}</p>
        <h3 className="ud-card-name">{product.description}</h3>
        <div className="ud-card-price-row"><span className="ud-price-current">₹{product.price}</span></div>
        <button 
          className={`ud-card-atc${added ? " added" : ""}`} 
          onClick={handleAction} 
          disabled={!product.stock || loading}
        >
          {added ? <><Icons.Check /> Added!</> : <><Icons.CartPlus /> {loading ? "Adding..." : "Add to Cart"}</>}
        </button>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeNav, setActiveNav] = useState("home");
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [userName, setName] = useState(null);

  const fetchUser = async () => {
    if (!user) { navigate('/login'); return; }
    setName(user.name)
  };

  const fetchCategories = async () => {
    try {
      const data = await fetchApi('/api/categories')
      if (data) setCategories(data)
    } catch (err) {
      console.error(err)
    }
  };

  const fetchProducts = async (categoryId) => {
    try {
      const query = categoryId !== 'all' ? `?category=${categoryId}` : ''
      const data = await fetchApi(`/api/products${query}`)
      if (data) setFilteredProducts(data)
    } catch (err) {
      console.error(err)
    }
  };

  useEffect(() => { fetchUser(); fetchCategories(); }, [user]);
  useEffect(() => { fetchProducts(activeCategory); }, [activeCategory]);

  const handleAddToCartAction = async (product) => {
    try {
      await fetchApi('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.product_id }),
      })
      setCartCount(prev => prev + 1)
      setToast(product.product_name)
      setTimeout(() => setToast(null), 2600)
      return true
    } catch (err) {
      if (err.status === 401) {
        navigate('/login')
      } else {
        alert('Error: ' + err.message)
      }
      return false
    }
  };

  return (
    <div className="ud-page">
      <header className="ud-header">
        <div className="ud-header-top">
          <div className="ud-brand">
            <div className="ud-brand-blob"><Icons.Bracelet /></div>
            <div className="ud-brand-text">
              <div className="ud-brand-name">TIED UP <span>with</span> CREATIVITY</div>
              <div className="ud-brand-tagline">Made to make you smile</div>
            </div>
          </div>
          <div className="ud-header-actions">
            <button className="ud-icon-btn"><Icons.Bell /><span className="ud-notif-dot" /></button>
            <button className="ud-icon-btn" onClick={() => navigate('/dashboard/cart')}>
              <Icons.Cart />
              {cartCount > 0 && <span className="ud-cart-count">{cartCount}</span>}
            </button>
            <div className="ud-profile-chip">
              <div className="ud-avatar">{userName ? userName[0].toUpperCase() : "P"}</div>
              <button onClick={() => navigate('/dashboard/profile')} className="ud-profile-btn-reset">
                <span className="ud-profile-name">{userName || "User"}</span>
              </button>
            </div>
          </div>
        </div>
        <div className="ud-search-row">
          <div className="ud-search"><Icons.Search /><input type="text" placeholder="Search..." readOnly /></div>
        </div>
        <div className="ud-cats-row">
          <button className={`ud-cat-chip ${activeCategory === "all" ? "active" : ""}`} onClick={() => setActiveCategory("all")}>All</button>
          {categories.map(cat => (
            <button key={cat.category_id} className={`ud-cat-chip ${activeCategory === cat.category_id ? "active" : ""}`} onClick={() => setActiveCategory(cat.category_id)}>{cat.name}</button>
          ))}
        </div>
      </header>

      <div className="ud-products-section">
        <div className="ud-product-grid">
          {filteredProducts.map(product => (
            <ProductCard key={product.product_id} product={product} onAddToCart={handleAddToCartAction} />
          ))}
        </div>
      </div>

      {toast && <div className="ud-atc-toast"><Icons.Check /> "{toast}" added to cart!</div>}
    </div>
  );
}