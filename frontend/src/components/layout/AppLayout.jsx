import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../../assets/css/layout.css";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activePage = location.pathname;   // URL based active page

  return (
    <div className="tuc-layout">

      <Sidebar
        activePage={activePage}
        onNavigate={(path) => navigate(path)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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