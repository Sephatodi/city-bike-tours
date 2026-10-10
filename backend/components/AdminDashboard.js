"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const dashboardViews = {
  overview: { title: "Dashboard", subtitle: "A quick view of tour operations." },
  routes: { title: "Routes & pricing", subtitle: "Manage route names, prices and departure times." },
  requests: { title: "Booking requests", subtitle: "Review and update website reservation requests." },
  bookings: { title: "Registered bookings", subtitle: "Manage confirmed account bookings." },
  messages: { title: "Message history", subtitle: "Review customer notification delivery." },
  content: { title: "Site content", subtitle: "Publish media and updates to the website." },
};

async function requestJson(url, options, fallback) {
  const response = await fetch(url, options);
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || fallback);
  if (!result) throw new Error(fallback);
  return result;
}

export default function AdminDashboard({ name }) {
  const [data, setData] = useState(null);
  const [routeForms, setRouteForms] = useState({});
  const [contentForm, setContentForm] = useState({ contentType: "picture", title: "", mediaUrl: "", bodyText: "", isFeatured: false });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeView, setActiveView] = useState("overview");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadDashboard() {
    setError("");
    try {
      const result = await requestJson("/api/admin/dashboard-summary", { cache: "no-store" }, "Could not load the dashboard.");
      setData(result);
      setRouteForms(Object.fromEntries((result.routesConfig || []).map((route) => [route.routeId, {
        routeName: route.routeName,
        priceBwp: route.priceBwp,
        scheduleSlots: route.scheduleSlots,
      }])));
    } catch (reason) {
      setError(reason.message || "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadDashboard(); }, []);

  async function saveRoute(event, routeId) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await requestJson(`/api/admin/routes-config/${encodeURIComponent(routeId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeForms[routeId]),
      }, "Could not save route settings.");
      setNotice("Route settings saved; changes are live on the website.");
      await loadDashboard();
    } catch (reason) {
      setError(reason.message || "Could not save route settings.");
    } finally {
      setBusy(false);
    }
  }

  async function updateRequest(requestId, status, resendConfirmation = false) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await requestJson(`/api/admin/booking-requests/${encodeURIComponent(requestId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(resendConfirmation ? { resendConfirmation: true } : {}) }),
      }, "Could not update the booking request.");
      if (status === "confirmed" && result.notifications) {
        setNotice(!result.notifications.whatsapp
          ? "Booking status updated, but the WhatsApp confirmation failed. Check Twilio configuration, then use Resend WhatsApp."
          : result.notifications.qrWhatsapp
            ? "Booking confirmed. The WhatsApp confirmation was followed by the ride-pass QR code."
            : "Booking confirmed and the confirmation was sent, but the QR follow-up failed. Check the QR template or media configuration, then use Resend WhatsApp.");
      } else {
        setNotice("Booking request updated.");
      }
      await loadDashboard();
    } catch (reason) {
      setError(reason.message || "Could not update the booking request.");
    } finally {
      setBusy(false);
    }
  }

  async function updateBooking(bookingId, status) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await requestJson(`/api/admin/bookings/${encodeURIComponent(bookingId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }, "Could not update the booking.");
      setNotice(status === "confirmed" && result.notifications
        ? (result.notifications.whatsapp ? "Booking confirmed and pass sent by WhatsApp." : "Booking confirmed, but WhatsApp delivery failed.")
        : "Booking status updated.");
      await loadDashboard();
    } catch (reason) {
      setError(reason.message || "Could not update the booking.");
    } finally {
      setBusy(false);
    }
  }

  async function saveContent(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await requestJson("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentForm),
      }, "Could not publish content.");
      setContentForm({ contentType: "picture", title: "", mediaUrl: "", bodyText: "", isFeatured: false });
      setNotice("Content published.");
      await loadDashboard();
    } catch (reason) {
      setError(reason.message || "Could not publish content.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadMedia(file) {
    if (!file) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const form = new FormData();
      form.append("file", file);
      const result = await requestJson("/api/admin/upload", { method: "POST", body: form }, "Upload failed.");
      setContentForm((current) => ({ ...current, mediaUrl: result.url }));
      setNotice("Upload complete. Save the content to publish it.");
    } catch (reason) {
      setError(reason.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function setContentPublished(item, isPublished) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await requestJson(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished }),
      }, "Could not update content visibility.");
      setNotice(isPublished ? "Content published." : "Content hidden from the website.");
      await loadDashboard();
    } catch (reason) {
      setError(reason.message || "Could not update content visibility.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteContent(id) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await requestJson(`/api/admin/content/${id}`, { method: "DELETE" }, "Could not delete content.");
      setNotice("Content deleted.");
      await loadDashboard();
    } catch (reason) {
      setError(reason.message || "Could not delete content.");
    } finally {
      setBusy(false);
    }
  }

  const bookingRequests = data?.bookingRequests || [];
  const bookings = data?.bookings || [];
  const routes = data?.routesConfig || [];
  const content = data?.content || [];
  const messageLogs = data?.messageLogs || [];
  const reservations = [...bookingRequests, ...bookings];
  const statusCounts = ["confirmed", "pending", "cancelled", "declined"].map((status) => ({
    status,
    count: reservations.filter((reservation) => reservation.status === status).length,
  }));
  const statusTotal = statusCounts.reduce((total, item) => total + item.count, 0);
  let statusOffset = 0;
  const statusGradient = statusTotal
    ? `conic-gradient(${statusCounts.map(({ status, count }) => {
      const start = statusOffset;
      statusOffset += (count / statusTotal) * 100;
      return `var(--admin-status-${status}) ${start}% ${statusOffset}%`;
    }).join(", ")})`
    : "conic-gradient(#E5E9ED 0 100%)";
  const monthlyStats = data?.monthlyStats || [];
  const maxMonthlyBookings = Math.max(1, ...monthlyStats.map((month) => Number(month.booking_count)));
  const recentRequests = [...bookingRequests]
    .sort((first, second) => new Date(second.createdAt || second.rideDate) - new Date(first.createdAt || first.rideDate))
    .slice(0, 5);
  const activeViewDetails = dashboardViews[activeView];
  const initials = (name || "Admin").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  if (loading) return <main className="admin-dashboard admin-dashboard-app"><div className="admin-workspace"><p className="admin-empty">Loading operations data...</p></div></main>;

  return (
    <main className="admin-dashboard admin-dashboard-app">
      <header className="admin-global-header">
        <div className="admin-brand"><span className="admin-brand-mark">CB</span><span>City Bike Tours<small>Tour operations</small></span></div>
        <nav className="admin-side-nav" aria-label="Admin dashboard">
          {Object.entries(dashboardViews).map(([key, view]) => (
            <button key={key} type="button" className={activeView === key ? "active" : ""} aria-current={activeView === key ? "page" : undefined} onClick={() => setActiveView(key)}>
              {view.title}
            </button>
          ))}
        </nav>
        <div className="admin-global-actions">
          <span className="admin-avatar" title={name}>{initials}</span>
          <button className="admin-secondary-button" type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>Sign out</button>
        </div>
      </header>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div><span className="admin-eyebrow">OPERATIONS / GABORONE</span><h1>{activeViewDetails.title}</h1><p>{activeViewDetails.subtitle}</p></div>
          <div className="admin-top-actions">
            <button className="admin-secondary-button" type="button" onClick={() => { setLoading(true); void loadDashboard(); }}>Refresh data</button>
          </div>
        </header>

        {error && <div className="admin-alert is-error" role="alert">{error}</div>}
        {notice && <div className="admin-alert" role="status">{notice}</div>}

        {!data ? (
          <button className="admin-primary-button" type="button" onClick={() => { setLoading(true); void loadDashboard(); }}>Retry loading dashboard</button>
        ) : (
          <div className="admin-view-content">
            {activeView === "overview" && (
              <div className="admin-reference-dashboard">
                <section className="admin-metrics" aria-label="Booking summary">
                  <article className="admin-metric-card metric-coral"><span>Total bookings</span><strong>{data.summary?.totalBookings ?? 0}</strong><small>Website and account reservations</small></article>
                  <article className="admin-metric-card metric-gold"><span>Total riders</span><strong>{data.summary?.totalRiders ?? 0}</strong><small>Across all booking records</small></article>
                  <article className="admin-metric-card metric-blue"><span>Pending requests</span><strong>{data.summary?.pendingCount ?? 0}</strong><small>Waiting for confirmation</small></article>
                  <article className="admin-metric-card metric-green"><span>Active routes</span><strong>{routes.length}</strong><small>Available to manage</small></article>
                </section>

                <div className="admin-overview-grid">
                  <section className="admin-surface">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">PERFORMANCE</span><h2>Monthly booking volume</h2></div><span className="admin-period-label">Last 12 months</span></div>
                    {monthlyStats.length ? <div className="admin-monthly-chart">
                      {monthlyStats.map((month) => {
                        const count = Number(month.booking_count);
                        return <div className="admin-month" key={month.billing_month} title={`${count} bookings, ${month.total_riders} riders`}>
                          <strong>{count}</strong><div className="admin-month-track"><div className="admin-month-bar" style={{ height: `${Math.max(4, (count / maxMonthlyBookings) * 100)}%` }} /></div>
                          <span>{month.billing_month.slice(5)}</span>
                        </div>;
                      })}
                    </div> : <p className="admin-empty">No booking history yet.</p>}
                  </section>
                  <section className="admin-surface">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">RESERVATIONS</span><h2>Booking status</h2></div></div>
                    <div className="admin-status-summary">
                      <div className="admin-donut" style={{ background: statusGradient }}><span>{statusTotal}</span></div>
                      <div className="admin-status-legend">{statusCounts.map(({ status, count }) => <div key={status}><span className={`admin-status-dot status-${status}`} />{status}<strong>{count}</strong></div>)}</div>
                    </div>
                  </section>
                </div>

                <div className="admin-overview-grid admin-overview-bottom">
                  <section className="admin-surface">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">LATEST ACTIVITY</span><h2>Recent booking requests</h2></div><button type="button" className="admin-text-button" onClick={() => setActiveView("requests")}>View all</button></div>
                    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Rider</th><th>Route</th><th>Date</th><th>Status</th></tr></thead><tbody>
                      {recentRequests.map((request) => <tr key={request.id}><td><strong>{request.name}</strong><span>{request.phone}</span></td><td>{routes.find((route) => route.routeId === request.routeId)?.routeName || request.routeId}</td><td>{request.rideDate}</td><td><span className={`admin-status-pill status-pill-${request.status}`}>{request.status}</span></td></tr>)}
                    </tbody></table>{!recentRequests.length && <p className="admin-empty">No booking requests yet.</p>}</div>
                  </section>
                  <section className="admin-surface">
                    <div className="admin-section-heading"><div><span className="admin-eyebrow">ROUTE CATALOG</span><h2>Routes to manage</h2></div><button type="button" className="admin-text-button" onClick={() => setActiveView("routes")}>Manage</button></div>
                    {routes.map((route) => <div className="admin-mini-route" key={route.routeId}><span>{route.routeName}</span><strong>BWP {Number(route.priceBwp).toFixed(0)}</strong></div>)}
                  </section>
                </div>
              </div>
            )}

            {activeView === "routes" && (
              <section className="admin-surface">
                <div className="admin-section-heading"><div><span className="admin-eyebrow">ROUTE CATALOG</span><h2>Routes & prices</h2><p>Price and schedule changes are reflected on the public website.</p></div></div>
                <div className="admin-route-grid">
                  {routes.map((route) => {
                    const form = routeForms[route.routeId];
                    if (!form) return null;
                    return <form className="admin-card" key={route.routeId} onSubmit={(event) => saveRoute(event, route.routeId)}>
                      <h3>{route.routeName}</h3>
                      <label>Route name<input required maxLength={100} value={form.routeName} onChange={(event) => setRouteForms((current) => ({ ...current, [route.routeId]: { ...current[route.routeId], routeName: event.target.value } }))} /></label>
                      <label>Price (BWP)<input required type="number" min="0" max="100000" step="0.01" value={form.priceBwp} onChange={(event) => setRouteForms((current) => ({ ...current, [route.routeId]: { ...current[route.routeId], priceBwp: event.target.value } }))} /></label>
                      <label>Departure times<input required value={form.scheduleSlots} onChange={(event) => setRouteForms((current) => ({ ...current, [route.routeId]: { ...current[route.routeId], scheduleSlots: event.target.value } }))} placeholder="08:00, 14:00" /></label>
                      <button className="admin-primary-button" type="submit" disabled={busy}>Save route</button>
                    </form>;
                  })}
                </div>
                {!routes.length && <p className="admin-empty">Route settings have not been configured yet.</p>}
              </section>
            )}

            {activeView === "requests" && (
              <section className="admin-surface">
                <div className="admin-section-heading"><div><span className="admin-eyebrow">RESERVATIONS</span><h2>Website booking requests</h2></div><span className="admin-count">{bookingRequests.length} requests</span></div>
                <div className="admin-table-wrap"><table className="admin-table">
                  <thead><tr><th>Rider</th><th>Route</th><th>Date</th><th>Riders</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{bookingRequests.map((request) => <tr key={request.id}>
                    <td><strong>{request.name}</strong><span>{request.phone}</span></td><td>{routes.find((route) => route.routeId === request.routeId)?.routeName || request.routeId}</td><td>{request.rideDate}</td><td>{request.riders}</td>
                    <td><span className={`admin-status-pill status-pill-${request.status}`}>{request.status}</span></td>
                    <td className="admin-actions">
                      {request.status === "pending" && <><button className="admin-action-button" type="button" disabled={busy} onClick={() => updateRequest(request.id, "confirmed")}>Confirm</button><button className="admin-action-button" type="button" disabled={busy} onClick={() => updateRequest(request.id, "declined")}>Decline</button></>}
                      {request.status === "confirmed" && <><button className="admin-action-button" type="button" disabled={busy} onClick={() => updateRequest(request.id, "confirmed", true)}>Resend WhatsApp</button><button className="admin-action-button" type="button" disabled={busy} onClick={() => updateRequest(request.id, "cancelled")}>Cancel</button></>}
                    </td>
                  </tr>)}</tbody>
                </table>{!bookingRequests.length && <p className="admin-empty">No website requests yet.</p>}</div>
              </section>
            )}

            {activeView === "bookings" && (
              <section className="admin-surface">
                <div className="admin-section-heading"><div><span className="admin-eyebrow">ACCOUNTS</span><h2>Registered bookings</h2></div><span className="admin-count">{bookings.length} bookings</span></div>
                <div className="admin-table-wrap"><table className="admin-table">
                  <thead><tr><th>Rider</th><th>Category</th><th>Date</th><th>Time</th><th>Route</th><th>Status</th><th>Manage</th></tr></thead>
                  <tbody>{bookings.map((booking) => <tr key={booking.id}>
                    <td><strong>{booking.name}</strong><span>{booking.email} · {booking.phone || "No phone"}</span></td><td>{booking.category}</td><td>{booking.rideDate}</td><td>{booking.timeSlot}</td><td>{booking.routeId || "Lesson"}</td>
                    <td><span className={`admin-status-pill status-pill-${booking.status}`}>{booking.status}</span></td><td>{booking.status === "confirmed" && <button className="admin-action-button" type="button" disabled={busy} onClick={() => updateBooking(booking.id, "cancelled")}>Cancel</button>}</td>
                  </tr>)}</tbody>
                </table>{!bookings.length && <p className="admin-empty">No account bookings yet.</p>}</div>
              </section>
            )}

            {activeView === "messages" && (
              <section className="admin-surface">
                <div className="admin-section-heading"><div><span className="admin-eyebrow">DELIVERY</span><h2>Message delivery history</h2></div><span className="admin-count">{messageLogs.length} messages</span></div>
                <div className="admin-table-wrap"><table className="admin-table">
                  <thead><tr><th>Customer</th><th>Channel</th><th>Provider</th><th>Status</th><th>Sent</th></tr></thead>
                  <tbody>{messageLogs.map((log) => {
                    const booking = bookingRequests.find((item) => item.id === log.bookingRequestId) || bookings.find((item) => item.id === log.bookingId);
                    return <tr key={log.id}><td><strong>{booking?.name || log.recipient}</strong><span>{log.recipient}</span></td><td>{log.channel}</td><td>{log.provider}</td><td>{log.status}</td><td>{new Date(log.statusUpdatedAt || log.sentAt).toLocaleString()}</td></tr>;
                  })}</tbody>
                </table>{!messageLogs.length && <p className="admin-empty">No message delivery records yet.</p>}</div>
              </section>
            )}

            {activeView === "content" && (
              <section className="admin-surface">
                <div className="admin-section-heading"><div><span className="admin-eyebrow">PUBLISHING</span><h2>Site content</h2><p>Upload media or add a hosted URL, then publish it to the website.</p></div></div>
                <form className="admin-content-form" onSubmit={saveContent}>
                  <label>Content type<select value={contentForm.contentType} onChange={(event) => setContentForm((current) => ({ ...current, contentType: event.target.value }))}><option value="picture">Picture</option><option value="video">Video</option><option value="article">Article</option></select></label>
                  <label>Title<input required maxLength={255} value={contentForm.title} onChange={(event) => setContentForm((current) => ({ ...current, title: event.target.value }))} /></label>
                  {contentForm.contentType !== "article" && <>
                    <label>Upload picture or video<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" disabled={busy} onChange={(event) => uploadMedia(event.target.files?.[0])} /></label>
                    <label>Media URL<input type="url" required value={contentForm.mediaUrl} onChange={(event) => setContentForm((current) => ({ ...current, mediaUrl: event.target.value }))} placeholder="https://..." /></label>
                  </>}
                  <label className="admin-full-field">Caption or article text<textarea rows={4} maxLength={10000} required={contentForm.contentType === "article"} value={contentForm.bodyText} onChange={(event) => setContentForm((current) => ({ ...current, bodyText: event.target.value }))} /></label>
                  <label className="admin-checkbox"><input type="checkbox" checked={contentForm.isFeatured} onChange={(event) => setContentForm((current) => ({ ...current, isFeatured: event.target.checked }))} /> Feature this content</label>
                  <button className="admin-primary-button" type="submit" disabled={busy}>{busy ? "Saving..." : "Publish content"}</button>
                </form>
                <ul className="admin-content-list">{content.map((item) => <li key={item.id}>
                  <span><strong>{item.title}</strong><small>{item.contentType}{item.isFeatured ? " · Featured" : ""}{item.isPublished ? " · Published" : " · Hidden"}</small></span>
                  <span className="admin-actions">
                    {item.mediaUrl && <a href={item.mediaUrl} target="_blank" rel="noreferrer">Open media</a>}
                    <button className="admin-action-button" type="button" disabled={busy} onClick={() => setContentPublished(item, !item.isPublished)}>{item.isPublished ? "Hide" : "Publish"}</button>
                    <button className="admin-action-button" type="button" disabled={busy} onClick={() => deleteContent(item.id)}>Delete</button>
                  </span>
                </li>)}</ul>
                {!content.length && <p className="admin-empty">No site content yet.</p>}
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
