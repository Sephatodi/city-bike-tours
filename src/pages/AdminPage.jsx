import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AdminBookings from "../components/AdminBookings";
import { getAdminSession } from "../components/adminAuth";
import { BACKEND_BASE_URL } from "../api/backend";

export default function AdminPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (BACKEND_BASE_URL) {
      window.location.replace(`${BACKEND_BASE_URL}/admin`);
      return;
    }
    let isMounted = true;
    getAdminSession()
      .then((session) => {
        if (!isMounted) return;
        if (session?.user?.isAdmin) setStatus("allowed");
        else navigate("/admin/login", { replace: true });
      })
      .catch(() => {
        if (isMounted) setStatus("error");
      });

    return () => { isMounted = false; };
  }, [navigate]);

  if (BACKEND_BASE_URL) return <main className="admin-shell"><div className="wrap">Opening backend dashboard...</div></main>;
  if (status === "allowed") return <AdminBookings />;
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