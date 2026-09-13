import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../assets/css/layout.css";
import { fetchApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { refetchUser } = useAuth();

  const activePage = location.pathname;   // URL based active page

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
    <div className="tuc-layout">

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
    </div>
  );
}