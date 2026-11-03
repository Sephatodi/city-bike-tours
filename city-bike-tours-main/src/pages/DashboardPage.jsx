import { useState } from "react";
import { Link, Navigate } from "react-router";
import { useCustomer } from "../auth/CustomerAuth";
import Footer from "../components/Footer";
import SiteClock from "../components/SiteClock";
import Stamp from "../components/Stamp";
import { usePolling } from "../hooks/usePolling";
import { downloadMedia } from "../utils/download";

const TILES = [
  { to: "/schedule#price-calculator", title: "Book a ride", text: "Pick a ride, a date and your group size.", icon: "🚲" },
  { to: "/heritage-trail", title: "Heritage trail", text: "The six sites, photos and food stops along the way.", icon: "🏛️" },
  { to: "/connect", title: "Messages & reviews", text: "Talk to our team and share how your ride went.", icon: "💬" },
  { to: "/gallery", title: "Gallery", text: "Photos from rides around Gaborone.", icon: "📷" },
];

const STATUS = { approved: "Published", pending: "Waiting for approval", rejected: "Not published" };

// Where customers land after signing in (email, phone, Google, Facebook or Apple).
export default function DashboardPage() {
  const { ready, isSignedIn, user, api, signOut } = useCustomer();
  const [reviews, setReviews] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [photoError, setPhotoError] = useState("");

  usePolling(async () => {
    try { setReviews((await api("/api/customer/reviews")).reviews || []); } catch { setReviews((current) => current ?? []); }
  }, 60000, isSignedIn);
  usePolling(async () => {
    try {
      setPhotos((await api("/api/community/photos")).photos.filter((photo) => photo.mine));
      setPhotoError("");
    } catch (error) {
      setPhotos((current) => current ?? []);
      setPhotoError(error.message);
    }
  }, 60000, isSignedIn);

  if (!ready) return <main className="legal-page"><p className="dash-loading">Loading your dashboard…</p></main>;
  if (!isSignedIn) return <Navigate to="/login?next=/dashboard" replace />;

  const first = (user?.name || "").split(" ")[0] || "rider";
  return (
    <main className="legal-page dashboard-page">
      <header className="page-hero">
        <p className="schedule-section-kicker">YOUR DASHBOARD</p>
        <h1 className="font-display font-bold" style={{ color: "#F5EDD9", fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>Welcome back, {first}</h1>
        <p className="dash-sub">Everything for your City Bike Tours rides in one place.</p>
        <p className="dash-sub"><SiteClock /></p>
      </header>

      <div className="dash-wrap">
        <section className="dash-profile glass" aria-label="Your account">
          {user?.image ? <img className="dash-avatar" src={user.image} alt="" referrerPolicy="no-referrer" /> : <span className="dash-avatar dash-initial" aria-hidden="true">{first.charAt(0).toUpperCase()}</span>}
          <div className="dash-profile-text">
            <h2 className="font-display">{user?.name || "Your account"}</h2>
            {user?.email && <p>{user.email}</p>}
            {user?.phone && <p>{user.phone}</p>}
          </div>
          <button type="button" className="dash-signout" onClick={signOut}>Sign out</button>
        </section>

        <section aria-label="Quick links">
          <div className="dash-grid">
            {TILES.map((tile) => (
              <Link key={tile.to} to={tile.to} className="dash-tile glass">
                <span className="dash-tile-icon" aria-hidden="true">{tile.icon}</span>
                <h3 className="font-display">{tile.title}</h3>
                <p>{tile.text}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="dash-reviews glass" aria-labelledby="dash-reviews-heading">
          <div className="dash-reviews-head">
            <h2 id="dash-reviews-heading" className="font-display">Your reviews</h2>
            <Link to="/connect" className="food-directions">Write a review →</Link>
          </div>
          {reviews === null && <p className="dash-muted">Loading…</p>}
          {reviews && reviews.length === 0 && <p className="dash-muted">You haven’t written a review yet. After your ride, tell other riders what it was like.</p>}
          {reviews && reviews.slice(0, 3).map((review) => (
            <article key={review.id} className="dash-review">
              <p className="dash-stars" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
              <p>{review.comment}</p>
              <p className="dash-muted">{STATUS[review.status] || review.status} · <Stamp value={review.createdAt} /></p>
              {review.adminReply && <p className="dash-reply"><strong>City Bike Tours:</strong> {review.adminReply}</p>}
            </article>
          ))}
        </section>

        <section className="dash-reviews glass" aria-labelledby="dash-photos-heading">
          <div className="dash-reviews-head">
            <h2 id="dash-photos-heading" className="font-display">Your photos &amp; videos</h2>
            <Link to="/gallery#rider-stories" className="food-directions">Share a photo →</Link>
          </div>
          {photos === null && <p className="dash-muted">Loading…</p>}
          {photoError && <p className="dash-photo-error" role="alert">{photoError}</p>}
          {photos && photos.length === 0 && !photoError && <p className="dash-muted">You haven’t shared any photos or videos yet.</p>}
          {photos?.length > 0 && (
            <div className="dash-photo-grid">
              {photos.map((photo) => (
                <article key={photo.id} className="dash-photo-card">
                  {photo.mediaType === "video"
                    ? <video src={photo.imageUrl} controls preload="metadata" aria-label={photo.title} />
                    : <img src={photo.imageUrl} alt={photo.title} loading="lazy" />}
                  <div className="dash-photo-copy">
                    <strong>{photo.title}</strong>
                    {photo.story && <p>{photo.story}</p>}
                    <p className="dash-muted">{STATUS[photo.status] || photo.status} · <Stamp value={photo.createdAt} /></p>
                    {photo.status === "approved" && photo.visibility !== "private" && photo.downloadable && (
                      <button type="button" className="dash-photo-download" onClick={async () => {
                        try { await downloadMedia({ kind: "community", id: photo.id, name: photo.title }); }
                        catch (error) { setPhotoError(error.message); }
                      }}>Download</button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
