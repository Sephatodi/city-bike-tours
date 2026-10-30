import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router";
import Footer from "../components/Footer";
import { useCustomer } from "../auth/CustomerAuth";
import { backendUrl } from "../api/backend";
import Stamp from "../components/Stamp";

const actions = [
  { href: "/schedule#price-calculator", eyebrow: "Plan your ride", title: "Book a ride", body: "Choose a City Bike Tours experience and plan your next trip." },
  { href: "/heritage-trail", eyebrow: "Discover Gaborone", title: "Heritage trail", body: "Explore landmarks and stories along the route." },
  { href: "/connect", eyebrow: "Stay connected", title: "Messages & reviews", body: "Message our team, share feedback and keep in touch." },
  { href: "/gallery", eyebrow: "Explore", title: "Ride gallery", body: "Explore cycling moments and Gaborone heritage." },
];

export default function DashboardPage() {
  const { user, ready, isSignedIn, signOut, token } = useCustomer();
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (!isSignedIn || !token) return;
    const controller = new AbortController();
    fetch(backendUrl("/api/customer/reviews"), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Your reviews could not be loaded.");
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    }).catch((error) => {
      if (!controller.signal.aborted) setReviewError(error.message || "Your reviews could not be loaded.");
    });
    return () => controller.abort();
  }, [isSignedIn, token]);

  if (!ready) return <main className="auth-shell"><section className="auth-card glass"><p className="auth-sub">Loading your dashboard…</p></section></main>;
  if (!isSignedIn) return <Navigate to="/login?next=/dashboard" replace />;

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const initials = (user?.name || user?.email || "R").trim().slice(0, 1).toUpperCase();

  return (
    <>
      <main className="dashboard-page" style={{ minHeight: "65vh", padding: "clamp(28px, 5vw, 72px) 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <p className="auth-kicker">— CITY BIKE TOURS RIDER AREA</p>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", margin: "8px 0" }}>Welcome{firstName ? `, ${firstName}` : ""}.</h1>
          <p className="auth-sub" style={{ marginBottom: 28 }}>Your City Bike Tours dashboard. Manage your profile, explore Gaborone and keep track of your reviews.</p>

          <section className="connect-panel glass" style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap", padding: 22, marginBottom: 28 }}>
            {user?.image
              ? <img src={user.image} alt="" referrerPolicy="no-referrer" style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover" }} />
              : <div aria-hidden="true" style={{ width: 76, height: 76, borderRadius: "50%", display: "grid", placeItems: "center", background: "#D4A017", color: "#102A1C", fontSize: 28, fontWeight: 700 }}>{initials}</div>}
            <div style={{ flex: "1 1 240px" }}>
              <h2 className="font-display" style={{ margin: "0 0 6px" }}>{user?.name || "City Bike Tours Rider"}</h2>
              {user?.email && <p className="connect-lead" style={{ margin: "3px 0" }}>{user.email}</p>}
              {user?.phone && <p className="connect-lead" style={{ margin: "3px 0" }}>{user.phone}</p>}
            </div>
            <button className="auth-secondary" type="button" onClick={() => { signOut(); window.location.assign("/login"); }}>Sign out</button>
          </section>

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

          <section style={{ marginTop: 34 }}>
            <p className="auth-kicker">— YOUR ACTIVITY</p>
            <h2 className="font-display" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", margin: "8px 0 16px" }}>Your reviews</h2>
            {reviewError && <p className="auth-error" role="status">{reviewError}</p>}
            {!reviewError && reviews.length === 0 && <div className="connect-panel glass" style={{ padding: 20 }}><p className="connect-lead">You have no reviews yet. Share your experience after your ride.</p><Link className="auth-primary" to="/connect" style={{ display: "inline-block", marginTop: 10 }}>Write a review</Link></div>}
            <div style={{ display: "grid", gap: 12 }}>
              {reviews.map((review) => (
                <article key={review.id} className="connect-panel glass" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{"★".repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}{"☆".repeat(5 - Math.max(0, Math.min(5, Number(review.rating) || 0)))}</strong>
                    <span className="connect-kicker">{review.status || "Pending review"}</span>
                  </div>
                  <p className="connect-lead" style={{ margin: "10px 0" }}>{review.comment}</p>{review.createdAt && <Stamp value={review.createdAt} className="review-stamp" />}
                  {review.rideDate && <p className="connect-lead">Ride date: {review.rideDate}</p>}
                  {review.adminReply && <div style={{ marginTop: 12, padding: 14, borderLeft: "3px solid #D4A017", background: "rgba(212,160,23,.08)" }}><strong>Reply from our team</strong><p className="connect-lead" style={{ marginBottom: 0 }}>{review.adminReply}</p>{review.adminReplyAt && <Stamp value={review.adminReplyAt} className="review-stamp" />}</div>}
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
