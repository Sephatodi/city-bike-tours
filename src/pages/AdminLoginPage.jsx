import { useEffect } from "react";
import { useNavigate } from "react-router";
import AdminLoginForm from "../components/AdminLoginForm";
import { getAdminSession } from "../components/adminAuth";
import { BACKEND_BASE_URL } from "../api/backend";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (BACKEND_BASE_URL) {
      window.location.replace(`${BACKEND_BASE_URL}/admin/login`);
      return;
    }
    let isMounted = true;
    getAdminSession()
      .then((session) => {
        if (isMounted && session?.user?.isAdmin) navigate("/admin", { replace: true });
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [navigate]);

  if (BACKEND_BASE_URL) return <main className="admin-shell"><div className="wrap">Opening backend sign in...</div></main>;
  return <main className="admin-shell"><div className="wrap"><AdminLoginForm /></div></main>;
}