import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { signOutAdmin } from "./adminAuth";

const BookingScanner = lazy(() => import("./BookingScanner"));

const emptyData = { bookings: [], bookingRequests: [], summary: {}, monthlyStats: [], routesConfig: [], content: [] };
const editableRouteIds = new Set(["complete", "loop", "own"]);
const dashboardViews = {
  overview: { title: "Dashboard", subtitle: "A quick view of tour operations." },
  routes: { title: "Routes & pricing", subtitle: "Manage the three routes available to riders." },
  requests: { title: "Booking requests", subtitle: "Review and update website reservation requests." },
  bookings: { title: "Registered bookings", subtitle: "Manage confirmed account bookings." },
  content: { title: "Site content", subtitle: "Publish media and updates to the website." },
  checkin: { title: "Ride check-in", subtitle: "Scan confirmed rider passes on ride day." },
};

export default function AdminBookings() {
  const navigate = useNavigate();
  const [data, setData] = useState(emptyData);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [savingRequest, setSavingRequest] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [editingRoute, setEditingRoute] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [contentForm, setContentForm] = useState({ contentType: "picture", title: "", mediaUrl: "", bodyText: "", isFeatured: false });

  async function syncAdminState() {
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard-summary", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Could not load operations data.");
      setData({ ...emptyData, ...result });
    } catch (reason) {
      setError(reason.message || "Could not load operations data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { syncAdminState(); }, []);

  async function adminFetch(url, options, fallback) {
    const response = await fetch(url, options);
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || fallback);
    return result;
  }

  async function updateStatus(resource, id, status) {
    setNotice("");
    setError("");
    try {
      const result = await adminFetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }, "Could not update status.");
      if (status === "confirmed" && result.notifications) {
        const { whatsapp, sms } = result.notifications;
        setNotice(whatsapp && sms
          ? "Booking confirmed. The ride pass was sent by WhatsApp and SMS."
          : `Booking confirmed. Pass delivery: WhatsApp ${whatsapp ? "sent" : "unavailable"}, SMS ${sms ? "sent" : "unavailable"}.`);
      } else {
        setNotice("Status updated.");
      }
      await syncAdminState();
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function saveBookingRequest(event) {
    event.preventDefault();
    setSavingRequest(true);
    setError("");
    setNotice("");
    try {
      await adminFetch(`/api/admin/booking-requests/${encodeURIComponent(editingRequest.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingRequest.name,
          phone: editingRequest.phone,
          routeId: editingRequest.routeId,
          dateIso: editingRequest.rideDate,
          riders: Number(editingRequest.riders),
          notes: editingRequest.notes || "",
        }),
      }, "Could not save booking changes.");
      setEditingRequest(null);
      setNotice("Booking details updated. The rider has been notified.");
      await syncAdminState();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSavingRequest(false);
    }
  }

  async function saveRoute(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await adminFetch(`/api/admin/routes-config/${encodeURIComponent(editingRoute.routeId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRoute),
      }, "Could not save route settings.");
      setEditingRoute(null);
      setNotice("Route settings saved.");
      await syncAdminState();
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function publishContent(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await adminFetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentForm),
      }, "Could not publish content.");
      setContentForm({ contentType: "picture", title: "", mediaUrl: "", bodyText: "", isFeatured: false });
      setNotice("Content saved.");
      await syncAdminState();
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function uploadFile(file) {
    if (!file) return;
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const result = await adminFetch("/api/admin/upload", { method: "POST", body }, "Upload failed.");
      setContentForm((form) => ({ ...form, mediaUrl: result.url }));
      setNotice("File uploaded. Add a title and save.");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  async function draftWithAi() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const result = await adminFetch("/api/admin/ai/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `Write a short article titled "${contentForm.title}". ${contentForm.bodyText}`.trim() }),
      }, "AI draft failed.");
      setContentForm((form) => ({ ...form, bodyText: result.text }));
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeContent(id, patch) {
    setError("");
    setNotice("");
    try {
      await adminFetch(`/api/admin/content/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }, "Could not update content.");
      await syncAdminState();
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function removeContent(id) {
    if (!window.confirm("Delete this item permanently?")) return;
    setError("");
    setNotice("");
    try {
      await adminFetch(`/api/admin/content/${encodeURIComponent(id)}`, { method: "DELETE" }, "Could not delete content.");
      setNotice("Content deleted.");
      await syncAdminState();
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function handleSignOut() {
    setError("");
    try {
      await signOutAdmin();
      navigate("/admin/login", { replace: true });
    } catch (reason) {
      setError(reason.message || "Could not sign out.");
    }
  }

  const editableRoutes = data.routesConfig.filter((route) => editableRouteIds.has(route.routeId));
  const maxMonthlyBookings = Math.max(1, ...data.monthlyStats.map((item) => Number(item.booking_count)));
  const allReservations = [...data.bookingRequests, ...data.bookings];
  const reservationStatuses = [
    { label: "Confirmed", key: "confirmed", count: allReservations.filter((item) => item.status === "confirmed").length },
    { label: "Pending", key: "pending", count: allReservations.filter((item) => item.status === "pending").length },
    { label: "Cancelled", key: "cancelled", count: allReservations.filter((item) => item.status === "cancelled").length },
    { label: "Declined", key: "declined", count: allReservations.filter((item) => item.status === "declined").length },
  ];
  const statusTotal = reservationStatuses.reduce((total, item) => total + item.count, 0);
  let statusOffset = 0;
  const statusGradient = statusTotal
    ? `conic-gradient(${reservationStatuses.map((item) => {
      const start = statusOffset;
      statusOffset += (item.count / statusTotal) * 100;
      return `var(--admin-status-${item.key}) ${start}% ${statusOffset}%`;
    }).join(", ")})`
    : "conic-gradient(#e5e9e7 0 100%)";
  const recentRequests = [...data.bookingRequests]
    .sort((first, second) => new Date(second.createdAt || second.rideDate) - new Date(first.createdAt || first.rideDate))
    .slice(0, 5);

  const routeManager = (
    <section className="admin-surface">
      <div className="admin-section-heading">
        <div><span className="admin-eyebrow">Route catalog</span><h2>Editable routes</h2></div>
        <span className="admin-count">{editableRoutes.length} routes</span>
      </div>
      <div className="admin-route-list">
        {editableRoutes.map((route) => (
          <div className="admin-route-row" key={route.routeId}>
            <div className="admin-route-symbol" aria-hidden="true">{route.routeId === "complete" ? "01" : route.routeId === "loop" ? "02" : "03"}</div>
            <div className="admin-route-copy">
              <strong>{route.routeName}</strong>
              <span>{route.scheduleSlots || "Schedule not set"}</span>
            </div>
            <strong className="admin-route-price">BWP {Number(route.priceBwp).toFixed(2)}</strong>
            <button type="button" className="admin-action-button" onClick={() => setEditingRoute({ ...route })}>Edit route</button>
          </div>
        ))}
      </div>
      {!editableRoutes.length && <p className="admin-empty">Route settings have not been configured yet.</p>}
      {editingRoute && (
        <form className="admin-inline-form" onSubmit={saveRoute}>
          <h3>Edit {editingRoute.routeName}</h3>
          <label>Route name<input required maxLength={100} value={editingRoute.routeName} onChange={(event) => setEditingRoute({ ...editingRoute, routeName: event.target.value })} /></label>
          <label>Price (BWP)<input required type="number" min="0" max="100000" step="0.01" value={editingRoute.priceBwp} onChange={(event) => setEditingRoute({ ...editingRoute, priceBwp: event.target.value })} /></label>
          <label>Departure times<input required value={editingRoute.scheduleSlots} onChange={(event) => setEditingRoute({ ...editingRoute, scheduleSlots: event.target.value })} placeholder="09:00, 14:00" /></label>
          <div className="admin-form-actions"><button className="admin-primary-button" type="submit">Save changes</button><button className="admin-secondary-button" type="button" onClick={() => setEditingRoute(null)}>Cancel</button></div>
        </form>
      )}
    </section>
  );

  const requestsTable = (
    <section className="admin-surface admin-requests-view">
      <div className="admin-section-heading"><div><span className="admin-eyebrow">Reservations</span><h2>Website booking requests</h2></div></div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Rider</th><th>Route</th><th>Date</th><th>Riders</th><th>Contact</th><th>Status</th><th>Manage</th></tr></thead>
        <tbody>{data.bookingRequests.map((request) => (
          <tr key={request.id}>
            <td><strong>{request.name}</strong><span>{request.notes || "No notes"}</span></td>
            <td>{request.routeId}</td><td>{request.rideDate}</td><td>{request.riders}</td><td>{request.phone}</td>
            <td><select aria-label={`Status for ${request.name}`} value={request.status} onChange={(event) => updateStatus("booking-requests", request.id, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option><option value="cancelled">Cancelled</option></select></td>
            <td><button type="button" className="admin-action-button" onClick={() => { setError(""); setEditingRequest({ ...request }); }}>Edit</button></td>
          </tr>
        ))}</tbody>
      </table>{!data.bookingRequests.length && <p className="admin-empty">No website requests yet.</p>}</div>
    </section>
  );

  const bookingsTable = (
    <section className="admin-surface">
      <div className="admin-section-heading"><div><span className="admin-eyebrow">Accounts</span><h2>Registered bookings</h2></div></div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>Rider</th><th>Category</th><th>Date</th><th>Time</th><th>Route</th><th>Status</th></tr></thead>
        <tbody>{data.bookings.map((booking) => (
          <tr key={booking.id}>
            <td><strong>{booking.name}</strong><span>{booking.email} · {booking.phone || "No phone"}</span></td>
            <td>{booking.category}</td><td>{booking.rideDate}</td><td>{booking.timeSlot}</td><td>{booking.routeId || "Lesson"}</td>
            <td><select aria-label={`Status for ${booking.name}`} value={booking.status} onChange={(event) => updateStatus("bookings", booking.id, event.target.value)}><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></td>
          </tr>
        ))}</tbody>
      </table>{!data.bookings.length && <p className="admin-empty">No account bookings yet.</p>}</div>
    </section>
  );

  const contentManager = (
    <section className="admin-surface admin-content-panel">
      <div className="admin-section-heading"><div><span className="admin-eyebrow">Publishing</span><h2>Site content</h2><p>Upload media or add a hosted URL, then publish it to the site.</p></div></div>
      <form className="admin-content-form" onSubmit={publishContent}>
        <label>Content type<select value={contentForm.contentType} onChange={(event) => setContentForm({ ...contentForm, contentType: event.target.value })}><option value="picture">Picture</option><option value="video">Video</option><option value="article">Article</option></select></label>
        <label>Title<input required maxLength={255} value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} /></label>
        {contentForm.contentType !== "article" && <label>Upload file<input type="file" accept="image/*,video/mp4,video/webm" disabled={busy} onChange={(event) => uploadFile(event.target.files[0])} /></label>}
        {contentForm.contentType !== "article" && <label>Media URL<input required type="url" value={contentForm.mediaUrl} onChange={(event) => setContentForm({ ...contentForm, mediaUrl: event.target.value })} placeholder="https://..." /></label>}
        <label className="admin-full-field">Article or caption<textarea rows={4} maxLength={10000} value={contentForm.bodyText} onChange={(event) => setContentForm({ ...contentForm, bodyText: event.target.value })} /></label>
        <label className="admin-checkbox"><input type="checkbox" checked={contentForm.isFeatured} onChange={(event) => setContentForm({ ...contentForm, isFeatured: event.target.checked })} /> Feature this content</label>
        <div className="admin-form-actions">
          <button className="admin-primary-button" type="submit" disabled={busy}>Save content</button>
          {contentForm.contentType === "article" && <button className="admin-secondary-button" type="button" disabled={busy || !contentForm.title} onClick={draftWithAi}>{busy ? "Working..." : "Draft with AI"}</button>}
        </div>
      </form>
      {data.content.length > 0 && <ul className="admin-content-list">{data.content.map((item) => (
        <li key={item.id}>
          <span><strong>{item.title}</strong><small>{item.contentType}{item.isFeatured ? " · Featured" : ""}{item.isPublished === false ? " · Hidden" : ""}</small></span>
          <span className="admin-content-actions">
            {item.mediaUrl && <a href={item.mediaUrl} target="_blank" rel="noreferrer">Open media</a>}
            <button type="button" onClick={() => changeContent(item.id, { isPublished: !item.isPublished })}>{item.isPublished ? "Hide" : "Publish"}</button>
            <button type="button" onClick={() => changeContent(item.id, { isFeatured: !item.isFeatured })}>{item.isFeatured ? "Unfeature" : "Feature"}</button>
            <button type="button" onClick={() => removeContent(item.id)}>Delete</button>
          </span>
        </li>
      ))}</ul>}
    </section>
  );

  if (loading) return <main className="admin-shell"><div className="wrap"><p className="admin-empty">Loading operations data...</p></div></main>;

  return (
    <main className="admin-shell admin-dashboard">
      <div className="admin-app-shell">
        <header className="admin-global-header">
          <div className="admin-brand"><span className="admin-brand-mark">CB</span><span>City Bike Tours<small>Tour operations</small></span></div>
          <nav className="admin-side-nav" aria-label="Admin dashboard">
            {Object.entries(dashboardViews).map(([key, view], index) => (
              <button key={key} type="button" className={activeView === key ? "active" : ""} aria-current={activeView === key ? "page" : undefined} onClick={() => setActiveView(key)}>
                {view.title}
              </button>
            ))}
          </nav>
          <div className="admin-global-actions">
            <span className="admin-avatar">TA</span>
            <button type="button" className="admin-secondary-button" onClick={handleSignOut}>Sign out</button>
          </div>
        </header>

        <div className="admin-workspace">
          <header className="admin-topbar">
            <div><span className="admin-eyebrow">OPERATIONS / GABORONE</span><h1>{dashboardViews[activeView].title}</h1><p>{dashboardViews[activeView].subtitle}</p></div>
            <div className="admin-top-actions">
              <button type="button" className="admin-secondary-button" onClick={syncAdminState}>Refresh data</button>
            </div>
          </header>

          {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

          <div className="admin-view-content">
            {activeView === "overview" && (
              <>
                <div className="admin-reference-layout">
                    <section className="admin-metrics" aria-label="Booking summary">
                      <article className="admin-metric-card metric-coral"><span>Total bookings</span><strong>{data.summary.totalBookings ?? 0}</strong><small>Website and account reservations</small></article>
                      <article className="admin-metric-card metric-gold"><span>Total riders</span><strong>{data.summary.totalRiders ?? 0}</strong><small>Across all booking records</small></article>
                      <article className="admin-metric-card metric-blue"><span>Pending requests</span><strong>{data.summary.pendingCount ?? 0}</strong><small>Waiting for confirmation</small></article>
                      <article className="admin-metric-card metric-green"><span>Active routes</span><strong>{editableRoutes.length}</strong><small>Available to manage</small></article>
                    </section>

                    <div className="admin-overview-grid">
                      <section className="admin-surface admin-performance-panel">
                        <div className="admin-section-heading"><div><span className="admin-eyebrow">PERFORMANCE</span><h2>Monthly booking volume</h2></div><span className="admin-period-label">Last 12 months</span></div>
                        {data.monthlyStats.length ? <div className="admin-monthly-chart">
                          {data.monthlyStats.map((month) => {
                            const bookings = Number(month.booking_count);
                            return <div className="admin-month" key={month.billing_month} title={`${bookings} bookings, ${month.total_riders} riders`}>
                              <strong>{bookings}</strong><div className="admin-month-track"><div className="admin-month-bar" style={{ height: `${Math.max(4, (bookings / maxMonthlyBookings) * 100)}%` }} /></div>
                              <span>{month.billing_month.slice(5)}</span>
                            </div>;
                          })}
                        </div> : <p className="admin-empty">No booking history yet.</p>}
                      </section>

                      <section className="admin-surface admin-status-panel">
                        <div className="admin-section-heading"><div><span className="admin-eyebrow">RESERVATIONS</span><h2>Booking status</h2></div></div>
                        <div className="admin-status-summary"><div className="admin-donut" style={{ background: statusGradient }}><span>{statusTotal}</span></div><div className="admin-status-legend">
                          {reservationStatuses.map((item) => <div key={item.key}><span className={`admin-status-dot status-${item.key}`} />{item.label}<strong>{item.count}</strong></div>)}
                        </div></div>
                      </section>
                    </div>
                </div>

                <div className="admin-overview-grid admin-overview-bottom">
                  <section className="admin-surface admin-recent-panel">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">LATEST ACTIVITY</span><h2>Recent booking requests</h2></div><button type="button" className="admin-text-button" onClick={() => setActiveView("requests")}>View all</button></div>
                    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Rider</th><th>Route</th><th>Date</th><th>Status</th></tr></thead><tbody>
                      {recentRequests.map((request) => <tr key={request.id}><td><strong>{request.name}</strong><span>{request.phone}</span></td><td>{request.routeId}</td><td>{request.rideDate}</td><td><span className={`admin-status-pill status-pill-${request.status}`}>{request.status}</span></td></tr>)}
                    </tbody></table>{!recentRequests.length && <p className="admin-empty">No booking requests yet.</p>}</div>
                  </section>
                  <section className="admin-surface admin-route-summary">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">ROUTE CATALOG</span><h2>Routes to manage</h2></div><button type="button" className="admin-text-button" onClick={() => setActiveView("routes")}>Manage</button></div>
                    {editableRoutes.map((route) => <div className="admin-mini-route" key={route.routeId}><span>{route.routeName}</span><strong>BWP {Number(route.priceBwp).toFixed(0)}</strong></div>)}
                  </section>
                </div>
              </>
            )}
            {activeView === "routes" && routeManager}
            {activeView === "requests" && requestsTable}
            {activeView === "bookings" && bookingsTable}
            {activeView === "content" && contentManager}
            {activeView === "checkin" && <Suspense fallback={<p className="admin-empty">Loading scanner...</p>}><BookingScanner /></Suspense>}
          </div>
        </div>

        {editingRequest && (
          <div className="admin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingRequest(null); }}>
            <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-booking-title">
              <header className="admin-modal-heading">
                <div><span className="admin-eyebrow">BOOKING REQUEST</span><h2 id="edit-booking-title">Edit booking</h2><p>Update the rider and ride details. The rider will be notified after saving.</p></div>
                <button type="button" className="admin-modal-close" aria-label="Close edit booking" onClick={() => setEditingRequest(null)}>×</button>
              </header>
              <form className="admin-edit-form" onSubmit={saveBookingRequest}>
                <label>Rider name<input required maxLength={160} autoComplete="name" value={editingRequest.name} onChange={(event) => setEditingRequest({ ...editingRequest, name: event.target.value })} /></label>
                <label>Phone / WhatsApp<input required type="tel" maxLength={30} autoComplete="tel" value={editingRequest.phone} onChange={(event) => setEditingRequest({ ...editingRequest, phone: event.target.value })} /></label>
                <label>Route<select value={editingRequest.routeId} onChange={(event) => setEditingRequest({ ...editingRequest, routeId: event.target.value })}>{editableRoutes.map((routeOption) => <option key={routeOption.routeId} value={routeOption.routeId}>{routeOption.routeName}</option>)}</select></label>
                <label>Ride date<input type="date" required min={new Date().toISOString().slice(0, 10)} value={editingRequest.rideDate} onChange={(event) => setEditingRequest({ ...editingRequest, rideDate: event.target.value })} /></label>
                <label>Riders<input type="number" required min="1" max="20" step="1" value={editingRequest.riders} onChange={(event) => setEditingRequest({ ...editingRequest, riders: event.target.value })} /></label>
                <label className="admin-edit-notes">Notes<textarea maxLength={2000} rows={3} value={editingRequest.notes || ""} onChange={(event) => setEditingRequest({ ...editingRequest, notes: event.target.value })} /></label>
                {error && <p className="admin-modal-error" role="alert">{error}</p>}
                <div className="admin-modal-actions"><button type="button" className="admin-secondary-button" onClick={() => setEditingRequest(null)}>Cancel</button><button type="submit" className="admin-primary-button" disabled={savingRequest}>{savingRequest ? "Saving..." : "Save changes"}</button></div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}