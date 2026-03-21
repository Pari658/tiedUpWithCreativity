import '../../assets/css/layout.css';

// ── Nav Items Config ─────────────────────────────────────────────────────────
// key    — unique identifier, matches activePage state
// label  — display name
// icon   — emoji icon shown in the icon box
// path   — route path (for use with React Router if needed)
// desc   — short subtitle shown below label
// badge  — optional notification count (null to hide)

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard Overview",
    icon: "📊",
    path: "/admin/dashboard",
    desc: "Live store vitals",
    badge: null,
  },
  {
    key: "add-product",
    label: "Add Product",
    icon: "💍",
    path: "/admin/add-product",
    desc: "List bracelets & anklets",
    badge: null,
  },
  {
    key: "add-category",
    label: "Add Category",
    icon: "🗂️",
    path: "/admin/add-category",
    desc: "Organise collections",
    badge: null,
  },
  {
    key: "orders",
    label: "Order Management",
    icon: "📦",
    path: "/admin/orders",
    desc: "Track & fulfil orders",
    badge: "5",
  },
  {
    key: "customers",
    label: "Customer Management",
    icon: "🧑‍🤝‍🧑",
    path: "/admin/customers",
    desc: "Profiles & history",
    badge: null,
  },
  {
    key: "reviews",
    label: "Review Management",
    icon: "⭐",
    path: "/admin/reviews",
    desc: "Moderate feedback",
    badge: "3",
  },
  {
    key: "coupons",
    label: "Coupon Management",
    icon: "🏷️",
    path: "/admin/coupons",
    desc: "Discounts & promos",
    badge: null,
  },
];

// ── Bracelet SVG Logo ────────────────────────────────────────────────────────
const BraceletIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="9" stroke="white" strokeWidth="2.5" fill="none" />
    <circle cx="16" cy="7"    r="2"   fill="white" />
    <circle cx="23.2" cy="20.6" r="1.5" fill="white" />
    <circle cx="8.8"  cy="20.6" r="1.5" fill="white" />
  </svg>
);

// ── Sidebar Component ────────────────────────────────────────────────────────
export default function Sidebar({ activePage, onNavigate, isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`tuc-sidebar-overlay${isOpen ? " visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`tuc-sidebar${isOpen ? " open" : ""}`}>

        {/* ── Brand ── */}
        <div className="tuc-sidebar-brand">
          <div className="tuc-sidebar-blob">
            <BraceletIcon />
          </div>
          <div>
            <div className="tuc-sidebar-brandname">
              TIED UP <span>with</span> CREATIVITY
            </div>
            <div className="tuc-sidebar-sub">Made to make you smile</div>
          </div>
        </div>

        {/* ── Admin badge ── */}
        <div className="tuc-sidebar-admin-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="#c9a227" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Admin Panel</span>
        </div>

        {/* ── Section label ── */}
        <p className="tuc-nav-section-label">Navigation</p>

        {/* ── Nav list (scrollable) ── */}
        <div className="tuc-nav-scroll">
          <ul className="tuc-nav">
            {navItems.map((item) => (
              <li key={item.key} className="tuc-nav-item">
                <button
                  className={`tuc-nav-link${activePage === item.key ? " active" : ""}`}
                  onClick={() => { onNavigate(item.path); onClose(); }}
                >
                  {/* Icon box */}
                  <span className="tuc-nav-icon-box">{item.icon}</span>

                  {/* Label + desc */}
                  <span className="tuc-nav-text-block">
                    <span className="tuc-nav-label">{item.label}</span>
                    <span className="tuc-nav-desc">{item.desc}</span>
                  </span>

                  {/* Optional badge */}
                  {item.badge && (
                    <span className="tuc-nav-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ── Footer / Logout ── */}
        <div className="tuc-sidebar-footer">
          <button className="tuc-sidebar-logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>

      </aside>
    </>
  );
}