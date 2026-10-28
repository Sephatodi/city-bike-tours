import { Link, Navigate } from "react-router";
import Footer from "../components/Footer";
import { useCustomer } from "../auth/CustomerAuth";

const actions = [
  { href: "/book", eyebrow: "Plan your ride", title: "Book a ride", body: "Choose a City Bike Tours experience and plan your next trip." },
  { href: "/connect", eyebrow: "Stay connected", title: "Messages & reviews", body: "Message our team, share feedback and keep in touch." },
  { href: "/gallery", eyebrow: "Explore", title: "Ride gallery", body: "Explore cycling moments and Gaborone heritage." },
  { href: "/heritage-trail", eyebrow: "Discover Gaborone", title: "Heritage trail", body: "Discover landmarks and stories along the route." },
];

export default function DashboardPage() {
  const { user, ready, isSignedIn, signOut } = useCustomer();

  if (!ready) {
    return <main className="auth-shell"><section className="auth-card glass"><p className="auth-sub">Loading your dashboard…</p></section></main>;
  }
  if (!isSignedIn) return <Navigate to="/login?next=/dashboard" replace />;

  return (
    <>
      <main className="dashboard-page" style={{ minHeight: "65vh", padding: "clamp(28px, 5vw, 72px) 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p className="auth-kicker">— CITY BIKE TOURS RIDER AREA</p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18, marginBottom: 28 }}>
            <div>
              <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "8px 0" }}>Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1>
              <p className="auth-sub">Your City Bike Tours dashboard. Plan a ride, explore Gaborone, or contact our team.</p>
            </div>
            <button className="auth-secondary" type="button" onClick={() => { signOut(); window.location.assign("/login"); }}>Sign out</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", gap: 16 }}>
            {actions.map((action) => (
              <Link key={action.href} to={action.href} className="connect-panel glass" style={{ display: "block", textDecoration: "none", minHeight: 170 }}>
                <p className="connect-kicker">{action.eyebrow}</p>
                <h2 className="font-display" style={{ margin: "10px 0" }}>{action.title}</h2>
                <p className="connect-lead">{action.body}</p>
                <span className="auth-primary" style={{ display: "inline-block", marginTop: 12 }}>Open <span aria-hidden="true">→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
