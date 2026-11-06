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
  { to: "/gallery", title: "Gallery", text: "Photos from rides around Gaborone.", icon: "📷" },
];

const STATUS = { approved: "Published", pending: "Waiting for approval", rejected: "Not published" };

// Where customers land after signing in (email, phone, Google, Facebook or Apple).
export default function DashboardPage() {
  const { ready, isSignedIn, user, api, signOut } = useCustomer();
  const [reviews, setReviews] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [bookings, setBookings] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [cancellationHours, setCancellationHours] = useState(24);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBusy, setCancelBusy] = useState(false);

  usePolling(async () => {
    try {
      const result = await api("/api/customer/bookings");
      setBookings(result.bookings || []);
      setCancellationHours(Number(result.cancellationHours) || 0);
      setBookingError("");
    } catch (error) {
      setBookings((current) => current ?? []);
      setBookingError(error.message);
    }
  }, 60000, isSignedIn);

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
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Gaborone" }).format(new Date());
  const upcoming = (bookings || []).filter((booking) => booking.rideDate >= today && ["pending", "confirmed"].includes(booking.status));
  const past = (bookings || []).filter((booking) => !upcoming.includes(booking));
  const displayDate = (date) => new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Gaborone", dateStyle: "full" })
    .format(new Date(`${date}T12:00:00.000Z`));

  async function cancelBooking() {
    if (!cancelTarget) return;
    setCancelBusy(true);
    setBookingError("");
    try {
      await api(`/api/customer/bookings/${encodeURIComponent(cancelTarget.id)}/cancel`, {
        method: "POST",
        body: { reason: cancelReason },
      });
      setCancelTarget(null);
      setCancelReason("");
      const result = await api("/api/customer/bookings");
      setBookings(result.bookings || []);
      setCancellationHours(Number(result.cancellationHours) || 0);
    } catch (error) {
      setBookingError(error.message);
    } finally {
      setCancelBusy(false);
    }
  }

  function downloadCalendar(booking) {
    const escape = (value) => String(value || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
    const start = new Date(`${booking.rideDate}T${booking.time || "09:00"}:00+02:00`);
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const utc = (date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const content = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//City Bike Tours//Bookings//EN",
      "BEGIN:VEVENT", `UID:${escape(booking.id)}@citybiketours`, `DTSTAMP:${utc(new Date())}`,
      `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`,
      `SUMMARY:${escape(`City Bike Tours · ${booking.routeName || booking.routeId}`)}`,
      `DESCRIPTION:${escape(`${booking.riders} rider(s). P${booking.priceTotal || "0"} payable on the day. ${booking.ridePassUrl || ""}`)}`,
      "LOCATION:Main Mall, Gaborone", "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const href = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `city-bike-tours-${booking.rideDate}.ics`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  const renderBooking = (booking) => (
    <article key={booking.id} className="dash-booking">
      <div className="dash-booking-heading">
        <div><h3 className="font-display">{booking.routeName || booking.routeId}</h3><p>{displayDate(booking.rideDate)} · {booking.time || "09:00"} Gaborone time</p></div>
        <span className={`dash-status dash-status-${booking.status}`}>{booking.status}</span>
      </div>
      <p>{booking.riders} rider{booking.riders === 1 ? "" : "s"} · P{Number(booking.priceTotal || 0).toFixed(2).replace(/\.00$/, "")} · pay on the day</p>
      <p className="dash-muted">Payment: {String(booking.paymentStatus || "unpaid").replaceAll("_", " ")}</p>
      <div className="dash-booking-actions">
        {booking.ridePassUrl && <a className="dash-photo-download" href={booking.ridePassUrl} target="_blank" rel="noreferrer">Ride pass</a>}
        <button type="button" className="dash-photo-download" onClick={() => downloadCalendar(booking)}>Add to calendar</button>
        {["pending", "confirmed"].includes(booking.status) && booking.cancellable
          ? <button type="button" className="dash-cancel-button" onClick={() => setCancelTarget(booking)}>Cancel booking</button>
          : ["pending", "confirmed"].includes(booking.status) && <span className="dash-muted">Cancellation is no longer available within {cancellationHours} hours of the ride.</span>}
      </div>
    </article>
  );
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

        <section className="dash-reviews glass" aria-labelledby="dash-bookings-heading">
          <div className="dash-reviews-head"><h2 id="dash-bookings-heading" className="font-display">My bookings</h2><Link to="/book" className="food-directions">Book a ride →</Link></div>
          {bookingError && <p className="dash-photo-error" role="alert">{bookingError}</p>}
          {bookings === null && <p className="dash-muted">Loading your bookings…</p>}
          {bookings && bookings.length === 0 && <p className="dash-muted">You have no bookings yet.</p>}
          {bookings && <>
            <h3 className="dash-booking-group-title">Upcoming</h3>
            {upcoming.length ? upcoming.map(renderBooking) : <p className="dash-muted">No upcoming rides.</p>}
            <h3 className="dash-booking-group-title">Past</h3>
            {past.length ? past.map(renderBooking) : <p className="dash-muted">No past rides.</p>}
          </>}
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
      {cancelTarget && (
        <div className="dash-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !cancelBusy) setCancelTarget(null); }}>
          <section className="dash-cancel-dialog glass" role="dialog" aria-modal="true" aria-labelledby="cancel-dialog-heading">
            <h2 className="font-display" id="cancel-dialog-heading">Cancel this booking?</h2>
            <p>{cancelTarget.routeName || cancelTarget.routeId} · {displayDate(cancelTarget.rideDate)} at {cancelTarget.time || "09:00"}.</p>
            <p>You can cancel only more than {cancellationHours} hours before the ride starts. When there are {cancellationHours} hours or less remaining, cancellation is no longer possible.</p>
            <label>Reason <span className="booking-optional">Optional</span><textarea rows={3} maxLength={500} value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /></label>
            <div className="dash-booking-actions">
              <button type="button" className="dash-cancel-button" disabled={cancelBusy} onClick={() => setCancelTarget(null)}>Keep booking</button>
              <button type="button" className="dash-photo-download" disabled={cancelBusy} onClick={cancelBooking}>{cancelBusy ? "Cancelling…" : "Confirm cancellation"}</button>
            </div>
          </section>
        </div>
      )}
      <Footer />
    </main>
  );
}
