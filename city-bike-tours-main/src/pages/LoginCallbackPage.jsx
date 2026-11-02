import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { backendUrl } from "../api/backend";
import { takeNext, useCustomer } from "../auth/CustomerAuth";

const ERRORS = {
  signin_failed: "The sign-in didn't finish. Please try again.",
  account_unavailable: "That account can't sign in right now.",
  staff_account: "Staff accounts sign in from the admin dashboard.",
};

// Google / Facebook / Apple send people back here with a one-time token in the URL fragment.
export default function LoginCallbackPage() {
  const { signIn } = useCustomer();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    window.history.replaceState(null, "", window.location.pathname);
    const token = params.get("token");
    if (!token) { setError(ERRORS[params.get("error")] || "The sign-in didn't finish. Please try again."); return; }
    fetch(backendUrl("/api/customer/me"), { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then(async (response) => {
        const result = await response.json().catch(() => null);
        if (!response.ok || !result?.user) throw new Error();
        signIn(token, result.user);
        navigate(takeNext(), { replace: true });
      })
      .catch(() => setError("We couldn't finish signing you in. Please try again."));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="auth-shell">
      <div className="auth-card glass" style={{ textAlign: "center" }}>
        {error ? (
          <>
            <h1 className="font-display">Sign-in problem</h1>
            <p className="auth-sub">{error}</p>
            <Link to="/login" className="auth-primary" style={{ display: "inline-block", marginTop: 16 }}>Back to sign in</Link>
          </>
        ) : <p className="auth-sub">Signing you in…</p>}
      </div>
    </main>
  );
}
