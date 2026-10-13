import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router";
import { signOutAdmin } from "./adminAuth";

const adminNavigation = [
  { key: "overview", label: "Overview", icon: "📊", permissions: [] },
  { key: "users", label: "User Management", icon: "👥", permissions: ["users:read"] },
  { key: "teams", label: "Teams & Groups", icon: "🏢", permissions: ["teams:read"] },
  { key: "bookings", label: "Bookings", icon: "🎫", permissions: ["bookings:read"] },
  { key: "routes", label: "Routes & Pricing", icon: "🗺️", permissions: ["routes:read"] },
  { key: "requests", label: "Booking Requests", icon: "📝", permissions: ["bookings:read"] },
  { key: "content", label: "Content Management", icon: "📄", permissions: ["content:read"] },
  { key: "settings", label: "Website Settings", icon: "⚙️", permissions: ["settings:read"] },
  { key: "seo", label: "SEO Management", icon: "🔍", permissions: ["seo:read"] },
  { key: "integrations", label: "Integrations", icon: "🔗", permissions: ["integrations:read"] },
  { key: "analytics", label: "Analytics", icon: "📈", permissions: ["analytics:read"] },
  { key: "logs", label: "System Logs", icon: "📋", permissions: ["logs:read"] },
  { key: "backups", label: "Backups", icon: "💾", permissions: ["backups:read"] },
  { key: "security", label: "Security", icon: "🔒", permissions: ["security:read"] },
  { key: "updates", label: "Software Updates", icon: "🔄", permissions: ["updates:read"] },
  { key: "checkin", label: "Ride Check-in", icon: "✅", permissions: [] },
];

export function AdminDashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutAdmin();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const filteredNav = adminNavigation.filter(item => 
    item.permissions.length === 0 || window.adminPermissions?.includes(item.permissions[0])
  );

  return (
    <div className="admin-app-shell">
      <aside 
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`} 
        aria-label="Admin navigation"
      >
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <span className="admin-brand-mark">CB</span>
            <span>City Bike Tours<small>Admin Dashboard</small></span>
          </div>
          <button 
            className="admin-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>
        </div>

        <nav className="admin-side-nav" aria-label="Main navigation">
          {filteredNav.map((item) => (
            <NavLink
              key={item.key}
              to={`/admin/${item.key}`}
              className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              end={item.key === "overview"}
            >
              <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-avatar">TA</span>
            <div className="admin-user-details">
              <strong>Tour Admin</strong>
              <small>Super Admin</small>
            </div>
          </div>
          <button 
            className="admin-secondary-button admin-signout-btn"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button 
              className="admin-mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <div>
              <span className="admin-eyebrow">OPERATIONS / GABORONE</span>
              <h1 className="admin-page-title">Dashboard</h1>
            </div>
          </div>
          <div className="admin-topbar-right">
            <button className="admin-secondary-button" onClick={() => window.location.reload()}>
              Refresh
            </button>
          </div>
        </header>

        <main className="admin-workspace">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

export default AdminDashboardLayout;