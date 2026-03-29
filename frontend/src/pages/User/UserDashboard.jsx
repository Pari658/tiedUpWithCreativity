import { useEffect, useState } from "react";
import "../../assets/css/User.css";
import { useNavigate } from 'react-router-dom'
import { supabase } from "../../supabase/supabaseClient";
// ══════════════════════════════════════════════════════════════
// ICONS
// ══════════════════════════════════════════════════════════════
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
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Heart: ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ArrowRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  SortAsc: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="9" y2="18" />
    </svg>
  ),
  Filter: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
};

// ══════════════════════════════════════════════════════════════
// STAR RATING
// ══════════════════════════════════════════════════════════════
function StarRating({ rating }) {
  return (
    <div className="ud-stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`ud-star ${s <= Math.floor(rating) ? "filled" : s - 0.5 <= rating ? "half" : "empty"}`}
          viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PRODUCT CARD
// ══════════════════════════════════════════════════════════════
function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
  };

  return (
    <div className="ud-product-card">
      {/* Image */}
      <div className="ud-card-image-wrap">
        {!product.stock && (
          <div className="ud-out-of-stock">
            <span className="ud-oos-label">Out of Stock</span>
          </div>
        )}

        {product.product_images?.length > 0 ? (
          <img
            src={product.product_images[0].image_url}
            alt={product.product_name}
            className="ud-card-img"
          />
        ) : (
          <div className="ud-card-img-placeholder">No Image</div>
        )}
        </div>

      {/* Body */}
      <div className="ud-card-body">
        <p className="ud-card-category">{product.product_name}</p>
        <h3 className="ud-card-name">{product.description}</h3>

        {/* <div className="ud-card-rating">
          <StarRating rating={product.rating} />
          <span className="ud-rating-val">{product.rating}</span>
          <span className="ud-rating-count">({product.reviewCount})</span>
        </div> */}

        <div className="ud-card-price-row">
          <span className="ud-price-current">₹{product.price}</span>
        </div>

        <button
          className={`ud-card-atc${added ? " added" : ""}`}
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          {added ? <><Icons.Check /> Added!</> : <><Icons.CartPlus /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function UserDashboard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeNav, setActiveNav]           = useState("home");
  const [cartCount, setCartCount]           = useState(0);
  const [toast, setToast]                   = useState(null);
  // Fetch categories
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .order("name");

    if (error) {
      console.log(error);
    } else {
      setCategories(data);
    }
  };

const fetchProducts = async (categoryId) => {
  console.log("Fetching products and images...");

  // 1. Fetch products
  let productQuery = supabase.from("product").select("*");

  if (categoryId !== "all") {
    productQuery = productQuery.eq("category_id", categoryId);
  }

  const { data: products, error: productError } = await productQuery;

  if (productError) {
    console.log("Product Error:", productError);
    return;
  }

  // 2. Fetch images
  const { data: images, error: imageError } = await supabase
    .from("product_images")
    .select("*");

  if (imageError) {
    console.log("Image Error:", imageError);
    return;
  }

  console.log("Products:", products);
  console.log("Images:", images);

  // 3. Match images with product_id
  const productsWithImages = products.map((product) => {
    const matchedImages = images.filter(
      (img) => img.product_id === product.product_id
    );

    return {
      ...product,
      product_images: matchedImages,
    };
  });

  console.log("Final Combined:", productsWithImages);

  setFilteredProducts(productsWithImages);
};
// CLEAN UP YOUR EFFECTS:
useEffect(() => {
  fetchCategories();
}, []); // Fetch categories once

useEffect(() => {
  // This will handle the initial "all" fetch AND any category changes
  fetchProducts(activeCategory);
}, [activeCategory]);

  const handleAddToCart = (product) => {
    setCartCount((c) => c + 1);
    setToast(product.name);
    setTimeout(() => setToast(null), 2600);
  };

  return (
    <div className="ud-page">

      {/* ══ STICKY HEADER ════════════════════════════════════════════════════ */}
      <header className="ud-header">

        {/* Top row */}
        <div className="ud-header-top">
          <div className="ud-brand">
            <div className="ud-brand-blob">
              <Icons.Bracelet />
            </div>
            <div className="ud-brand-text">
              <div className="ud-brand-name">TIED UP <span>with</span> CREATIVITY</div>
              <div className="ud-brand-tagline">Made to make you smile</div>
            </div>
          </div>

          <div className="ud-header-actions">
            <button className="ud-icon-btn" aria-label="Notifications">
              <Icons.Bell />
              <span className="ud-notif-dot" />
            </button>

            <button className="ud-icon-btn" aria-label="Cart" onClick={() => {navigate('/dashboard/cart')}} >
              <Icons.Cart />
              {cartCount > 0 && <span className="ud-cart-count">{cartCount}</span>}
            </button>

            <div className="ud-profile-chip">
              <div className="ud-avatar">P</div>
              <button 
              onClick={() => {navigate('/dashboard/profile')}} 
              style={{ 
                border: "none", 
                outline: "none", 
                background: "transparent", 
                cursor: "pointer" 
              }}
            >
              <span className="ud-profile-name">Priya</span>
            </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="ud-search-row">
          <div className="ud-search">
            <Icons.Search />
            <input type="text" placeholder="Search bracelets, anklets, gifts…" readOnly />
          </div>
        </div>

            {/* Category chips */}
        <div className="ud-cats-row">
          {/* ALL button */}
          <button
            type="button"
            className={`ud-cat-chip ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>

          {/* Categories from DB */}
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.category_id}
              className={`ud-cat-chip ${
                activeCategory === cat.category_id ? "active" : ""
              }`}
              onClick={() => setActiveCategory(cat.category_id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* ══ HERO BANNER ══════════════════════════════════════════════════════ */}
      <div className="ud-hero">
        <div className="ud-hero-bg" />
        <div className="ud-hero-content">
          <p className="ud-hero-eyebrow">New Collection · Spring 2026</p>
          <h1 className="ud-hero-title">
            Tied up in <em>joy</em>
          </h1>
          <p className="ud-hero-sub">Handcrafted bracelets & anklets — made with love</p>
          <button className="ud-hero-cta" onClick={() => navigate('/dashboard/customize')}>
            
            Customize <Icons.ArrowRight />
          </button>
        </div>
        <div className="ud-hero-dots">
          <div className="ud-hero-dot active" />
          <div className="ud-hero-dot" />
          <div className="ud-hero-dot" />
        </div>
      </div>

      {/* ══ PRODUCTS SECTION ════════════════════════════════════════════════ */}
      <div className="ud-products-section">

        {/* Sort bar */}
        <div className="ud-sort-bar">
          <p className="ud-results-count">
            <strong>{filteredProducts.length}</strong> products
          </p>
          <div className="ud-sort-filter-row">
            <button className="ud-sort-btn">
              <Icons.SortAsc /> Sort
            </button>
            <button className="ud-filter-btn">
              <Icons.Filter /> Filter
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="ud-product-grid">
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: "var(--ink-light)" }}>
              <Icons.Package />
              <p style={{ marginTop: 12, fontSize: 14 }}>No products in this category yet.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </div>
      </div>

      {/* ══ BOTTOM NAV ═══════════════════════════════════════════════════════ */}
      <nav className="ud-bottom-nav">
        {[
          { id: "home",       label: "Home",       Icon: Icons.Home  },
          { id: "categories", label: "Categories", Icon: Icons.Grid  },
          { id: "orders",     label: "Orders",     Icon: Icons.Package },
          { id: "account",    label: "Account",    Icon: Icons.User  },
          { id: "cart",       label: "Cart",       Icon: Icons.Cart, badge: cartCount },
        ].map(({ id, label, Icon, badge }) => (
          <button
            key={id}
            className={`ud-nav-item${activeNav === id ? " active" : ""}`}
            onClick={() => setActiveNav(id)}
          >
            <Icon />
            <span className="ud-nav-label">{label}</span>
            {badge > 0 && <span className="ud-nav-badge">{badge}</span>}
          </button>
        ))}
      </nav>

      {/* ══ ADD TO CART TOAST ════════════════════════════════════════════════ */}
      {toast && (
        <div className="ud-atc-toast">
          <Icons.Check />
          "{toast}" added to cart!
        </div>
      )}

    </div>
  );
}