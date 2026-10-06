import { useEffect } from "react";
import { useNavigate } from "react-router";
import AdminLoginForm from "../components/AdminLoginForm";
import { getAdminSession } from "../components/adminAuth";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    getAdminSession()
      .then((session) => {
        if (isMounted && session?.user?.isAdmin) navigate("/admin", { replace: true });
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [navigate]);

  return <main className="admin-shell"><div className="wrap"><AdminLoginForm /></div></main>;
}