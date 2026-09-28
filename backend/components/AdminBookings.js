"use client";

import { useEffect, useState } from "react";

export default function AdminBookings() {
  const [data, setData] = useState({ bookings: [], bookingRequests: [], summary: {}, monthlyStats: [], routesConfig: [], content: [] });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingRoute, setEditingRoute] = useState(null);
  const [contentForm, setContentForm] = useState({ contentType: "picture", title: "", mediaUrl: "", bodyText: "", isFeatured: false });

  async function syncAdminState() {
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard-summary");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not load operations data.");
      setData(result);
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { syncAdminState(); }, []);

  async function updateStatus(resource, id, status) {
    setNotice("");
    setError("");
    try {
      const response = await fetch(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update status.");
      setNotice("Status updated.");
      await syncAdminState();
    } catch (reason) {
      setError(reason.message);
    }
  }

  async function saveRoute(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/routes-config/${encodeURIComponent(editingRoute.routeId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRoute),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save route settings.");
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
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentForm),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not publish content.");
      setContentForm({ contentType: "picture", title: "", mediaUrl: "", bodyText: "", isFeatured: false });
      setNotice("Content saved.");
      await syncAdminState();
    } catch (reason) {
      setError(reason.message);
    }
  }

  const maxMonthlyBookings = Math.max(1, ...data.monthlyStats.map((item) => Number(item.booking_count)));

  if (loading) return <main className="admin-shell"><div className="wrap"><p className="admin-empty">Loading operations data...</p></div></main>;

  return (
    <main className="admin-shell admin-dashboard">
      <div className="wrap">
        <header className="admin-heading">
          <div>
            <div className="section-eyebrow">Operations / Gaborone</div>
            <h1>Tour control desk</h1>
            <p className="admin-lede">Bookings, route settings, schedules, and site content.</p>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={syncAdminState}>Refresh data</button>
        </header>

        {error && <p className="admin-error" role="alert">{error}</p>}
        {notice && <p className="admin-notice" role="status">{notice}</p>}

        <section className="admin-metrics" aria-label="Booking summary">
          <div><span>Booking records</span><strong>{data.summary.totalBookings ?? 0}</strong></div>
          <div><span>Riders</span><strong>{data.summary.totalRiders ?? 0}</strong></div>
          <div><span>Pending requests</span><strong>{data.summary.pendingCount ?? 0}</strong></div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-heading"><div><div className="section-eyebrow">Performance</div><h2>Monthly booking volume</h2></div></div>
          {data.monthlyStats.length ? (
            <div className="admin-monthly-chart">
              {data.monthlyStats.map((month) => {
                const bookings = Number(month.booking_count);
                return (
                  <div className="admin-month" key={month.billing_month}>
                    <div className="admin-month-count">{bookings}</div>
                    <div className="admin-month-track" title={`${bookings} bookings`}>
                      <div className="admin-month-bar" style={{ height: `${Math.max(4, (bookings / maxMonthlyBookings) * 100)}%` }} />
                    </div>
                    <div className="admin-month-label">{month.billing_month}</div>
                    <div className="admin-month-riders">{month.total_riders} riders</div>
                  </div>
                );
              })}
            </div>
          ) : <p className="admin-empty">No booking history yet.</p>}
        </section>

        <section className="admin-panel">
          <div className="admin-section-heading"><div><div className="section-eyebrow">Catalog</div><h2>Routes, prices & schedules</h2></div></div>
          <div className="admin-route-list">
            {data.routesConfig.map((route) => (
              <div className="admin-route-row" key={route.routeId}>
                <div><strong>{route.routeName}</strong><span>{route.routeId} · BWP {Number(route.priceBwp).toFixed(2)} · {route.scheduleSlots}</span></div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingRoute({ ...route })}>Edit settings</button>
              </div>
            ))}
          </div>
          {editingRoute && (
            <form className="admin-inline-form" onSubmit={saveRoute}>
              <h3>Edit {editingRoute.routeId}</h3>
              <label>Route name<input required maxLength={100} value={editingRoute.routeName} onChange={(event) => setEditingRoute({ ...editingRoute, routeName: event.target.value })} /></label>
              <label>Price (BWP)<input required type="number" min="0" max="100000" step="0.01" value={editingRoute.priceBwp} onChange={(event) => setEditingRoute({ ...editingRoute, priceBwp: event.target.value })} /></label>
              <label>Departure times<input required value={editingRoute.scheduleSlots} onChange={(event) => setEditingRoute({ ...editingRoute, scheduleSlots: event.target.value })} placeholder="05:00, 17:00" /></label>
              <div className="admin-form-actions"><button className="btn btn-primary btn-sm" type="submit">Save settings</button><button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditingRoute(null)}>Cancel</button></div>
            </form>
          )}
          {!data.routesConfig.length && <p className="admin-empty">Route settings will appear after the admin tables are migrated.</p>}
        </section>

        <section className="admin-panel">
          <div className="admin-section-heading"><div><div className="section-eyebrow">Reservations</div><h2>Website booking requests</h2></div></div>
          <div className="table-scroll admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Rider</th><th>Route</th><th>Date</th><th>Riders</th><th>Contact</th><th>Status</th></tr></thead>
              <tbody>{data.bookingRequests.map((request) => (
                <tr key={request.id}>
                  <td><strong>{request.name}</strong><span>{request.notes || "No notes"}</span></td>
                  <td>{request.routeId}</td><td>{request.rideDate}</td><td>{request.riders}</td><td>{request.phone}</td>
                  <td><select aria-label={`Status for ${request.name}`} value={request.status} onChange={(event) => updateStatus("booking-requests", request.id, event.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="declined">Declined</option><option value="cancelled">Cancelled</option></select></td>
                </tr>
              ))}</tbody>
            </table>
            {!data.bookingRequests.length && <p className="admin-empty">No website requests yet.</p>}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-section-heading"><div><div className="section-eyebrow">Confirmed accounts</div><h2>Registered bookings</h2></div></div>
          <div className="table-scroll admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Rider</th><th>Category</th><th>Date</th><th>Time</th><th>Route</th><th>Status</th></tr></thead>
              <tbody>{data.bookings.map((booking) => (
                <tr key={booking.id}>
                  <td><strong>{booking.name}</strong><span>{booking.email} · {booking.phone || "No phone"}</span></td>
                  <td>{booking.category}</td><td>{booking.rideDate}</td><td>{booking.timeSlot}</td><td>{booking.routeId || "Lesson"}</td>
                  <td><select aria-label={`Status for ${booking.name}`} value={booking.status} onChange={(event) => updateStatus("bookings", booking.id, event.target.value)}><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option></select></td>
                </tr>
              ))}</tbody>
            </table>
            {!data.bookings.length && <p className="admin-empty">No account bookings yet.</p>}
          </div>
        </section>

        <section className="admin-panel admin-content-panel">
          <div className="admin-section-heading"><div><div className="section-eyebrow">Publishing</div><h2>Site content</h2><p>Reference hosted media by URL; binary uploads need a storage provider.</p></div></div>
          <form className="admin-content-form" onSubmit={publishContent}>
            <label>Content type<select value={contentForm.contentType} onChange={(event) => setContentForm({ ...contentForm, contentType: event.target.value })}><option value="picture">Picture</option><option value="video">Video</option><option value="article">Article</option></select></label>
            <label>Title<input required maxLength={255} value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })} /></label>
            {contentForm.contentType !== "article" && <label>Media URL<input required type="url" value={contentForm.mediaUrl} onChange={(event) => setContentForm({ ...contentForm, mediaUrl: event.target.value })} placeholder="https://…" /></label>}
            <label>Article or caption<textarea rows={4} maxLength={10000} value={contentForm.bodyText} onChange={(event) => setContentForm({ ...contentForm, bodyText: event.target.value })} /></label>
            <label className="admin-checkbox"><input type="checkbox" checked={contentForm.isFeatured} onChange={(event) => setContentForm({ ...contentForm, isFeatured: event.target.checked })} /> Feature this content</label>
            <button className="btn btn-primary btn-sm" type="submit">Save content</button>
          </form>
          {data.content.length > 0 && <ul className="admin-content-list">{data.content.map((item) => <li key={item.id}><span>{item.contentType} · {item.title}{item.isFeatured ? " · Featured" : ""}</span>{item.mediaUrl && <a href={item.mediaUrl} target="_blank" rel="noreferrer">Open media</a>}</li>)}</ul>}
        </section>
      </div>
    </main>
  );
}