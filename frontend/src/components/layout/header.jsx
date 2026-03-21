import "../../assets/css/layout.css";
// ── Page title map ───────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard:    "Dashboard Overview",
  "add-product":    "Add Product",
  "add-category":   "Add Category",
  orders:       "Order Management",
  customers:    "Customer Management",
  reviews:      "Review Management",
  coupons:      "Coupon Management",
};

// ── Header Component ─────────────────────────────────────────────────────────
export default function Header({ activePage, onMenuToggle }) {
  const pageTitle = PAGE_TITLES[activePage] || "Dashboard";

  return (
    <header className="tuc-header">

      {/* Left: hamburger + breadcrumb */}
      <div className="tuc-header-left">
        <button className="tuc-hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>

        <div className="tuc-breadcrumb">
          <span className="tuc-breadcrumb-root">Admin</span>
          <span className="tuc-breadcrumb-sep">/</span>
          <span className="tuc-breadcrumb-current">{pageTitle}</span>
        </div>
      </div>

      {/* Right: search, actions, avatar */}
      <div className="tuc-header-right">

        {/* Search */}
        <div className="tuc-header-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search anything…" />
        </div>

        {/* Notification bell */}
        <button className="tuc-header-icon-btn" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="tuc-notif-dot" />
        </button>

        {/* Settings */}
        <button className="tuc-header-icon-btn" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93A10 10 0 0 1 19.07 19.07" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
          </svg>
        </button>

        <div className="tuc-header-divider" />

        {/* Admin avatar */}
        <div className="tuc-header-avatar">
          <div className="tuc-avatar-circle">A</div>
          <div className="tuc-avatar-info">
            <span className="tuc-avatar-name">Admin</span>
            <span className="tuc-avatar-role">Super Admin</span>
          </div>
        </div>

      </div>
    </header>
  );
}