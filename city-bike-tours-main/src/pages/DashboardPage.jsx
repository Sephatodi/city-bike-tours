import { useEffect } from "react";
import { Link, useLocation } from "react-router";
import { useCustomer } from "../auth/CustomerAuth";
import Footer from "../components/Footer";

export default function DashboardPage() {
  const { ready, isSignedIn, user, signOut } = useCustomer();
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    return () => clearTimeout(timer);
  }, [hash]);

  if (!ready) return <main className="legal-page"><p className="dash-loading">Loading…</p></main>;
  if (!isSignedIn) return <Link to="/login?next=/dashboard" className="auth-primary">Sign in</Link>;

  const first = (user?.name || "").split(" ")[0] || "rider";

  return (
    <main className="legal-page">
      <div className="dash-wrap" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h1 className="font-display font-bold" style={{ color: "#F5EDD9", fontSize: "clamp(2.4rem, 5vw, 3.6rem)", marginBottom: "1rem" }}>
          Welcome back, {first}
        </h1>
        <p style={{ color: "rgba(245,237,217,0.7)", marginBottom: "2rem" }}>
          You're signed in as {user?.name}. Sign in is only used when you book a ride — we'll use your details to send your booking confirmation.
        </p>
        <button type="button" onClick={signOut} className="dash-signout" style={{
          backgroundColor: "#D4A017",
          color: "#0D0805",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "4px",
          fontWeight: 700,
          cursor: "pointer",
        }}>
          Sign out
        </button>
      </div>
      <Footer />
    </main>
  );
}
