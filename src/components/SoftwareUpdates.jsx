import { useState, useEffect } from "react";

export default function SoftwareUpdates() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingUpdate, setEditingUpdate] = useState(null);

  async function fetchUpdates() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/updates", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load updates");
      setUpdates(result.updates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUpdates(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const url = editingUpdate.id ? `/api/admin/updates/${editingUpdate.id}` : "/api/admin/updates";
      const method = editingUpdate.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUpdate),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save update");
      }
      setNotice(editingUpdate.id ? "Update record updated" : "Update record created");
      setEditingUpdate(null);
      fetchUpdates();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUpdate(id) {
    if (!window.confirm("Delete this update record?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/updates/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setNotice("Deleted");
      fetchUpdates();
    } catch (err) {
      setError(err.message);
    }
  }

  function openEdit(update) {
    setEditingUpdate({ ...update });
  }

  const statusColors = {
    unknown: "status-unknown",
    available: "status-available",
    updating: "status-updating",
    updated: "status-updated",
    error: "status-error",
  };

  if (loading) return <div className="admin-loading">Loading updates...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">MAINTENANCE</span>
          <h1>Software Updates</h1>
          <p>Track and manage system component versions and updates</p>
        </div>
        <button className="admin-secondary-button" onClick={() => setEditingUpdate({ component: "", currentVersion: "", latestVersion: "", status: "unknown", releaseNotes: "", downloadUrl: "" })}>Add Component</button>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <section className="admin-surface">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Component</th><th>Current Version</th><th>Latest Version</th><th>Status</th><th>Release Notes</th><th>Last Checked</th><th>Actions</th></tr></thead>
            <tbody>
              {updates.map(update => (
                <tr key={update.id}>
                  <td><strong>{update.component}</strong></td>
                  <td>{update.currentVersion}</td>
                  <td>{update.latestVersion || "—"}</td>
                  <td><span className={`admin-status-pill ${statusColors[update.status] || ""}`}>{update.status}</span></td>
                  <td>{update.releaseNotes ? update.releaseNotes.substring(0, 100) + "..." : "—"}</td>
                  <td>{new Date(update.checkedAt).toLocaleDateString()}</td>
                  <td>
                    <button className="admin-action-button" onClick={() => openEdit(update)}>Edit</button>
                    <button className="admin-action-button admin-danger-button" onClick={() => deleteUpdate(update.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!updates.length && <p className="admin-empty">No update records. Add components to track versions.</p>}
        </div>
      </section>

      {editingUpdate && (
        <div className="admin-modal-backdrop" onClick={() => setEditingUpdate(null)}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="update-modal-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">UPDATES</span><h2 id="update-modal-title">{editingUpdate.id ? "Edit Update Record" : "Add Update Record"}</h2></div>
              <button className="admin-modal-close" onClick={() => setEditingUpdate(null)}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={handleSubmit}>
              <label>Component<input required value={editingUpdate.component} onChange={(e) => setEditingUpdate({ ...editingUpdate, component: e.target.value })} placeholder="next.js" /></label>
              <label>Current Version<input required value={editingUpdate.currentVersion} onChange={(e) => setEditingUpdate({ ...editingUpdate, currentVersion: e.target.value })} placeholder="14.2.0" /></label>
              <label>Latest Version<input value={editingUpdate.latestVersion || ""} onChange={(e) => setEditingUpdate({ ...editingUpdate, latestVersion: e.target.value })} placeholder="14.2.1" /></label>
              <label>Status<select value={editingUpdate.status} onChange={(e) => setEditingUpdate({ ...editingUpdate, status: e.target.value })}>
                <option value="unknown">Unknown</option>
                <option value="available">Update Available</option>
                <option value="updating">Updating</option>
                <option value="updated">Updated</option>
                <option value="error">Error</option>
              </select></label>
              <label className="admin-full-field">Release Notes<textarea rows={4} value={editingUpdate.releaseNotes || ""} onChange={(e) => setEditingUpdate({ ...editingUpdate, releaseNotes: e.target.value })} /></label>
              <label>Download URL<input type="url" value={editingUpdate.downloadUrl || ""} onChange={(e) => setEditingUpdate({ ...editingUpdate, downloadUrl: e.target.value })} /></label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => setEditingUpdate(null)}>Cancel</button>
                <button type="submit" className="admin-primary-button">Save</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}