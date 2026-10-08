"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

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
        setNotice(result.notifications.whatsapp
          ? "Booking confirmed. The unique ride pass was sent by WhatsApp."
          : "Booking confirmed, but WhatsApp delivery failed. Check the Twilio WhatsApp configuration, then use Resend WhatsApp.");
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

  if (loading) return <main className="wrap page-header"><p>Loading operations data...</p></main>;

  return (
    <main className="wrap admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <div className="section-eyebrow">Operations / Admin</div>
          <h1>Tour control desk</h1>
          <p>Signed in as {name} · Update route details, review bookings and publish site content.</p>
        </div>
        <button className="btn btn-ghost" type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>Sign out</button>
      </header>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {notice && <p className="admin-notice" role="status">{notice}</p>}

      {!data ? (
        <button className="btn" type="button" onClick={() => { setLoading(true); void loadDashboard(); }}>Retry loading dashboard</button>
      ) : (
        <>
          <section className="admin-section">
            <h2>Routes & prices</h2>
            <p>Price changes are used by the public website the next time it loads live route data.</p>
            <div className="admin-route-grid">
              {data.routesConfig.map((route) => {
                const form = routeForms[route.routeId];
                if (!form) return null;
                return (
                  <form className="admin-card" key={route.routeId} onSubmit={(event) => saveRoute(event, route.routeId)}>
                    <h3>{route.routeName}</h3>
                    <label>Route name<input required maxLength={100} value={form.routeName} onChange={(event) => setRouteForms((current) => ({ ...current, [route.routeId]: { ...current[route.routeId], routeName: event.target.value } }))} /></label>
                    <label>Price (BWP)<input required type="number" min="0" max="100000" step="0.01" value={form.priceBwp} onChange={(event) => setRouteForms((current) => ({ ...current, [route.routeId]: { ...current[route.routeId], priceBwp: event.target.value } }))} /></label>
                    <button className="btn btn-primary" type="submit" disabled={busy}>Save route</button>
                  </form>
                );
              })}
            </div>
          </section>

          <section className="admin-section">
            <h2>Website booking requests</h2>
            {data.bookingRequests?.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Rider</th><th>Ride</th><th>Date</th><th>Riders</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.bookingRequests.map((request) => (
                      <tr key={request.id}>
                        <td>{request.name}<small>{request.phone}</small></td>
                        <td>{data.routesConfig.find((route) => route.routeId === request.routeId)?.routeName || request.routeId}</td>
                        <td>{request.rideDate}</td><td>{request.riders}</td><td>{request.status}</td>
                        <td className="admin-actions">
                          {request.status === "pending" && <>
                            <button type="button" className="btn btn-sm btn-primary" disabled={busy} onClick={() => updateRequest(request.id, "confirmed")}>Confirm</button>
                            <button type="button" className="btn btn-sm" disabled={busy} onClick={() => updateRequest(request.id, "declined")}>Decline</button>
                          </>}
                          {request.status === "confirmed" && <>
                            <button type="button" className="btn btn-sm" disabled={busy} onClick={() => updateRequest(request.id, "confirmed", true)}>Resend WhatsApp</button>
                            <button type="button" className="btn btn-sm" disabled={busy} onClick={() => updateRequest(request.id, "cancelled")}>Cancel</button>
                          </>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p>No website booking requests yet.</p>}
          </section>

          <section className="admin-section">
            <h2>Published site content</h2>
            <form className="admin-card admin-content-form" onSubmit={saveContent}>
              <label>Content type<select value={contentForm.contentType} onChange={(event) => setContentForm((current) => ({ ...current, contentType: event.target.value }))}>
                <option value="picture">Picture</option><option value="video">Video</option><option value="article">Article</option>
              </select></label>
              <label>Title<input required maxLength={255} value={contentForm.title} onChange={(event) => setContentForm((current) => ({ ...current, title: event.target.value }))} /></label>
              {contentForm.contentType !== "article" && <>
                <label>Media URL<input type="url" required value={contentForm.mediaUrl} onChange={(event) => setContentForm((current) => ({ ...current, mediaUrl: event.target.value }))} /></label>
                <label>Upload picture or video<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" disabled={busy} onChange={(event) => uploadMedia(event.target.files?.[0])} /></label>
                <small>Uploads are limited to 4MB. For longer videos, paste a YouTube or Vimeo URL above.</small>
              </>}
              <label>Caption or article text<textarea rows={3} maxLength={10000} required={contentForm.contentType === "article"} value={contentForm.bodyText} onChange={(event) => setContentForm((current) => ({ ...current, bodyText: event.target.value }))} /></label>
              <label className="admin-checkbox"><input type="checkbox" checked={contentForm.isFeatured} onChange={(event) => setContentForm((current) => ({ ...current, isFeatured: event.target.checked }))} /> Featured</label>
              <button className="btn btn-primary" type="submit" disabled={busy}>Publish content</button>
            </form>
            {data.content?.length ? <ul className="admin-content-list">
              {data.content.map((item) => (
                <li key={item.id}>
                  <span><strong>{item.title}</strong><small>{item.contentType} · {item.isPublished ? "Published" : "Hidden"}</small></span>
                  <span className="admin-actions">
                    <button type="button" className="btn btn-sm" disabled={busy} onClick={() => setContentPublished(item, !item.isPublished)}>{item.isPublished ? "Hide" : "Publish"}</button>
                    <button type="button" className="btn btn-sm" disabled={busy} onClick={() => deleteContent(item.id)}>Delete</button>
                  </span>
                </li>
              ))}
            </ul> : <p>No site content yet.</p>}
          </section>
        </>
      )}
    </main>
  );
}
