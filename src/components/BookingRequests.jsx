import { useState, useEffect } from "react";

export default function BookingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingRequest, setEditingRequest] = useState(null);
  const [savingRequest, setSavingRequest] = useState(false);

  async function fetchRequests() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard-summary", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load requests");
      setRequests(result.bookingRequests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRequests(); }, []);

  async function updateStatus(id, status, resendConfirmation = false) {
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/booking-requests/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(resendConfirmation ? { resendConfirmation: true } : {}) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update status.");
      if (status === "confirmed" && result.notifications) {
        setNotice(result.notifications.whatsapp
          ? "Booking confirmed. The unique ride pass was sent by WhatsApp."
          : "Booking confirmed, but WhatsApp delivery failed. Check the Twilio WhatsApp configuration, then use Resend WhatsApp.");
      } else {
        setNotice("Status updated.");
      }
      fetchRequests();
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
      const response = await fetch(`/api/admin/booking-requests/${encodeURIComponent(editingRequest.id)}`, {
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
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save booking changes.");
      setEditingRequest(null);
      setNotice("Booking details updated. The rider has been notified.");
      fetchRequests();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSavingRequest(false);
    }
  }

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "declined", label: "Declined" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (loading) return <div className="admin-loading">Loading booking requests...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">RESERVATIONS</span>
          <h1>Booking Requests</h1>
          <p>Review and manage website reservation requests from riders</p>
        </div>
        <button className="admin-secondary-button" onClick={fetchRequests}>Refresh</button>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <section className="admin-surface admin-requests-view">
        <div className="admin-table-wrap"><table className="admin-table">
          <thead><tr><th>Rider</th><th>Route</th><th>Date</th><th>Riders</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td><strong>{request.name}</strong><span>{request.notes || "No notes"}</span></td>
                <td>{request.routeId}</td>
                <td>{request.rideDate}</td>
                <td>{request.riders}</td>
                <td>{request.phone}</td>
                <td>
                  <select 
                    value={request.status} 
                    onChange={(e) => updateStatus(request.id, e.target.value)}
                    className="admin-status-select"
                  >
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </td>
                <td>
                  <button className="admin-action-button" onClick={() => { setError(""); setEditingRequest({ ...request }); }}>Edit</button>
                  {request.status === "confirmed" && (
                    <button className="admin-action-button" onClick={() => updateStatus(request.id, "confirmed", true)}>Resend WhatsApp</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>{!requests.length && <p className="admin-empty">No website requests yet.</p>}</div>
      </section>

      {editingRequest && (
        <div className="admin-modal-backdrop" onClick={() => { setEditingRequest(null); }}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-booking-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">BOOKING REQUEST</span><h2 id="edit-booking-title">Edit Booking Request</h2><p>Update the rider and ride details. The rider will be notified after saving.</p></div>
              <button className="admin-modal-close" onClick={() => setEditingRequest(null)}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={saveBookingRequest}>
              <label>Rider Name<input required maxLength={160} value={editingRequest.name} onChange={(e) => setEditingRequest({ ...editingRequest, name: e.target.value })} /></label>
              <label>Phone / WhatsApp<input required type="tel" maxLength={30} value={editingRequest.phone} onChange={(e) => setEditingRequest({ ...editingRequest, phone: e.target.value })} /></label>
              <label>Route<select value={editingRequest.routeId} onChange={(e) => setEditingRequest({ ...editingRequest, routeId: e.target.value })}>
                <option value="complete">Heritage City Ride</option>
                <option value="loop">Casual Saturday Loop</option>
                <option value="own">Own Route</option>
              </select></label>
              <label>Ride Date<input type="date" required min={new Date().toISOString().slice(0, 10)} value={editingRequest.rideDate} onChange={(e) => setEditingRequest({ ...editingRequest, rideDate: e.target.value })} /></label>
              <label>Riders<input type="number" required min="1" max="20" value={editingRequest.riders} onChange={(e) => setEditingRequest({ ...editingRequest, riders: e.target.value })} /></label>
              <label className="admin-edit-notes">Notes<textarea maxLength={2000} rows={3} value={editingRequest.notes || ""} onChange={(e) => setEditingRequest({ ...editingRequest, notes: e.target.value })} /></label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions"><button type="button" className="admin-secondary-button" onClick={() => setEditingRequest(null)}>Cancel</button><button type="submit" className="admin-primary-button" disabled={savingRequest}>{savingRequest ? "Saving..." : "Save Changes"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}