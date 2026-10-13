import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router";
import { getAdminSession } from "../components/adminAuth";
import { BACKEND_BASE_URL } from "../api/backend";

export default function AdminPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (BACKEND_BASE_URL) {
      window.location.replace(`${BACKEND_BASE_URL}/admin`);
      return;
    }
    let isMounted = true;
    getAdminSession()
      .then((sessionData) => {
        if (!isMounted) return;
        if (sessionData?.user?.isAdmin || sessionData?.user?.adminRole) {
          setSession(sessionData);
          setStatus("allowed");
        } else {
          navigate("/admin/login", { replace: true });
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus("error");
        }
      });

    return () => { isMounted = false; };
  }, [navigate]);

  if (BACKEND_BASE_URL) return <main className="admin-shell"><div className="wrap">Opening backend dashboard...</div></main>;
  
  if (status === "allowed") {
    // Store session in window for component access
    if (session?.user) {
      window.currentAdminUser = session.user;
      window.adminPermissions = session.user.adminRole ? getPermissionsForRole(session.user.adminRole) : [];
    }
    return <Outlet />;
  }

  return (
    <main className="admin-shell">
      <div className="wrap">
        {status === "error" ? (
          <p className="admin-error" role="alert">Could not verify administrator access. Check the backend connection and try again.</p>
        ) : <p className="admin-empty">Checking administrator access...</p>}
      </div>
    </main>
  );
}

function getPermissionsForRole(role) {
  const permissions = {
    super_admin: [
      "users:create", "users:read", "users:update", "users:delete",
      "teams:create", "teams:read", "teams:update", "teams:delete",
      "content:create", "content:read", "content:update", "content:delete",
      "settings:read", "settings:update", "seo:read", "seo:update",
      "integrations:read", "integrations:update", "analytics:read",
      "logs:read", "backups:create", "backups:read", "backups:delete",
      "security:read", "security:update", "updates:read", "updates:update",
      "bookings:read", "bookings:update", "routes:read", "routes:update",
    ],
    editor: [
      "users:read", "content:create", "content:read", "content:update", "content:delete",
      "settings:read", "seo:read", "seo:update", "analytics:read",
      "bookings:read", "routes:read", "routes:update",
    ],
    viewer: [
      "users:read", "content:read", "settings:read", "seo:read",
      "analytics:read", "bookings:read", "routes:read",
    ],
  };
  return permissions[role] || [];
}