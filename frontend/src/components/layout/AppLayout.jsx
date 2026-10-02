import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../assets/css/layout.css";
import "../../assets/css/User.css";
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

// ── Bottom‑nav Icons (same as DashboardLayout) ─────────────────────────────
const BottomIcons = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Cart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { refetchUser } = useAuth();

  const activePage = location.pathname;   // URL based active page

  // Determine active bottom‑nav tab
  const getActiveBottomTab = () => {
    if (activePage.startsWith("/admin")) return "admin";
    if (activePage.endsWith("/orders")) return "orders";
    if (activePage.endsWith("/profile")) return "account";
    if (activePage.endsWith("/cart")) return "cart";
    return "home";
  };

  const activeBottomTab = getActiveBottomTab();

  const handleLogout = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore
    }
    await refetchUser()
    navigate('/login')
  }

  return (
    <div className="tuc-layout" style={{ paddingBottom: "70px" }}>

      <Sidebar
        activePage={activePage}
        onNavigate={(path) => navigate(path)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <Header
        activePage={activePage}
        onMenuToggle={() => setSidebarOpen((v) => !v)}
      />

      <main className="tuc-main">
        <Outlet />
      </main>

      {/* ── Bottom Navigation Bar (same as DashboardLayout) ── */}
      <nav className="ud-bottom-nav">
        {[
          { id: "home", label: "Home", Icon: BottomIcons.Home, path: "/dashboard" },
          { id: "orders", label: "Orders", Icon: BottomIcons.Package, path: "/dashboard/orders" },
          { id: "account", label: "Account", Icon: BottomIcons.User, path: "/dashboard/profile" },
          { id: "cart", label: "Cart", Icon: BottomIcons.Cart, path: "/dashboard/cart" },
          { id: "admin", label: "Admin", Icon: BottomIcons.Shield, path: "/admin/dashboard" },
        ].map(({ id, label, Icon, path }) => (
          <button
            key={id}
            className={`ud-nav-item${activeBottomTab === id ? " active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon />
            <span className="ud-nav-label">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}