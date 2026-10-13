import { useState, useEffect } from "react";

export default function SecurityMaintenance() {
  const [backups, setBackups] = useState([]);
  const [securitySettings, setSecuritySettings] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("backups");
  const [creatingBackup, setCreatingBackup] = useState(false);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [backupsRes, securityRes, updatesRes] = await Promise.all([
        fetch("/api/admin/backups", { cache: "no-store" }),
        fetch("/api/admin/security", { cache: "no-store" }),
        fetch("/api/admin/updates", { cache: "no-store" }),
      ]);
      const backupsData = await backupsRes.json();
      const securityData = await securityRes.json();
      const updatesData = await updatesRes.json();
      if (!backupsRes.ok) throw new Error(backupsData.error || "Failed to load backups");
      if (!securityRes.ok) throw new Error(securityData.error || "Failed to load security settings");
      if (!updatesRes.ok) throw new Error(updatesData.error || "Failed to load updates");
      setBackups(backupsData.backups || []);
      setSecuritySettings(securityData.settings || []);
      setUpdates(updatesData.updates || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function createBackup(type) {
    setCreatingBackup(true);
    setError("");
    try {
      const response = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create backup");
      setNotice(`Backup started: ${type}. It will complete shortly.`);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingBackup(false);
    }
  }

  async function deleteBackup(id) {
    if (!window.confirm("Delete this backup record?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/backups/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setNotice("Backup deleted");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSecuritySubmit(event, item) {
    event.preventDefault();
    setError("");
    try {
      const url = item.id ? `/api/admin/security/${item.id}` : "/api/admin/security";
      const method = item.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save security setting");
      }
      setNotice(item.id ? "Security setting updated" : "Security setting created");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateSubmit(event, item) {
    event.preventDefault();
    setError("");
    try {
      const url = item.id ? `/api/admin/updates/${item.id}` : "/api/admin/updates";
      const method = item.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save update");
      }
      setNotice(item.id ? "Update record updated" : "Update record created");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteSecurity(id) {
    if (!window.confirm("Delete this security setting?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/security/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setNotice("Deleted");
      fetchData();
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
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  const backupTypes = [
    { id: "database", label: "Database", description: "Full database dump including all tables" },
    { id: "files", label: "Files & Media", description: "Uploaded images, documents, and assets" },
    { id: "full", label: "Full System", description: "Complete backup of database and files" },
  ];

  if (loading) return <div className="admin-loading">Loading security & maintenance...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">MAINTENANCE</span>
          <h1>Security & Maintenance</h1>
          <p>Manage backups, security configurations, and software updates</p>
        </div>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <div className="admin-tabs">
        <button className={activeTab === "backups" ? "active" : ""} onClick={() => setActiveTab("backups")}>Backups</button>
        <button className={activeTab === "security" ? "active" : ""} onClick={() => setActiveTab("security")}>Security Settings</button>
        <button className={activeTab === "updates" ? "active" : ""} onClick={() => setActiveTab("updates")}>Software Updates</button>
      </div>

      {activeTab === "backups" && (
        <section className="admin-surface">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">DATA PROTECTION</span><h2>Backup Management</h2></div>
          </div>
          
          <div className="admin-backup-actions">
            {backupTypes.map(type => (
              <button 
                key={type.id}
                className="admin-backup-type-button"
                onClick={() => createBackup(type.id)}
                disabled={creatingBackup}
              >
                <div className="admin-backup-type-icon">
                  {type.id === "database" && "🗄️"}
                  {type.id === "files" && "📁"}
                  {type.id === "full" && "💾"}
                </div>
                <div>
                  <strong>{type.label}</strong>
                  <small>{type.description}</small>
                </div>
              </button>
            ))}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Type</th><th>Status</th><th>Size</th><th>Started</th><th>Completed</th><th>Created By</th><th>Actions</th></tr></thead>
              <tbody>
                {backups.map(backup => (
                  <tr key={backup.id}>
                    <td><span className="admin-badge">{backup.type}</span></td>
                    <td><span className={`admin-status-pill status-pill-${backup.status}`}>{backup.status}</span></td>
                    <td>{backup.fileSize || "—"}</td>
                    <td>{new Date(backup.startedAt).toLocaleString()}</td>
                    <td>{backup.completedAt ? new Date(backup.completedAt).toLocaleString() : "In progress"}</td>
                    <td>{backup.creatorName || "System"}</td>
                    <td>
                      {backup.errorMessage && <span className="admin-error-text" title={backup.errorMessage}>⚠️ Error</span>}
                      <button className="admin-action-button admin-danger-button" onClick={() => deleteBackup(backup.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!backups.length && <p className="admin-empty">No backups created yet. Click a backup type above to start.</p>}
          </div>
        </section>
      )}

      {activeTab === "security" && (
        <section className="admin-surface">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">SECURITY CONTROLS</span><h2>Security Configuration</h2></div>
            <button className="admin-secondary-button" onClick={() => setEditingSecurity({ key: "", value: "", description: "" })}>Add Setting</button>
          </div>
          
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Key</th><th>Value</th><th>Description</th><th>Updated</th><th>Actions</th></tr></thead>
              <tbody>
                {securitySettings.map(setting => (
                  <tr key={setting.id}>
                    <td><code>{setting.key}</code></td>
                    <td><pre>{typeof setting.value === "object" ? JSON.stringify(setting.value, null, 2) : setting.value}</pre></td>
                    <td>{setting.description || "—"}</td>
                    <td>{new Date(setting.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="admin-action-button" onClick={() => setEditingSecurity(setting)}>Edit</button>
                      <button className="admin-action-button admin-danger-button" onClick={() => deleteSecurity(setting.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!securitySettings.length && <p className="admin-empty">No security settings configured.</p>}
          </div>

          <div className="admin-security-presets">
            <h3>Common Security Settings</h3>
            <div className="admin-preset-grid">
              <div className="admin-preset-card">
                <h4>Session Timeout</h4>
                <p>Configure automatic logout after inactivity</p>
                <code>session_timeout_minutes</code>
              </div>
              <div className="admin-preset-card">
                <h4>IP Blocklist</h4>
                <p>Block malicious IP addresses</p>
                <code>ip_blocklist</code>
              </div>
              <div className="admin-preset-card">
                <h4>SSL/TLS Config</h4>
                <p>Enforce HTTPS and certificate settings</p>
                <code>ssl_enforcement</code>
              </div>
              <div className="admin-preset-card">
                <h4>Rate Limiting</h4>
                <p>API rate limits and throttling rules</p>
                <code>rate_limits</code>
              </div>
              <div className="admin-preset-card">
                <h4>MFA Policy</h4>
                <p>Multi-factor authentication requirements</p>
                <code>mfa_policy</code>
              </div>
              <div className="admin-preset-card">
                <h4>Audit Logging</h4>
                <p>Configure what actions are logged</p>
                <code>audit_log_level</code>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "updates" && (
        <section className="admin-surface">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">SOFTWARE UPDATES</span><h2>System Updates</h2></div>
            <button className="admin-secondary-button" onClick={() => setEditingUpdate({ component: "", currentVersion: "", latestVersion: "", status: "unknown", releaseNotes: "", downloadUrl: "" })}>Add Update</button>
          </div>
          
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Component</th><th>Current</th><th>Latest</th><th>Status</th><th>Release Notes</th><th>Actions</th></tr></thead>
              <tbody>
                {updates.map(update => (
                  <tr key={update.id}>
                    <td><strong>{update.component}</strong></td>
                    <td>{update.currentVersion}</td>
                    <td>{update.latestVersion || "—"}</td>
                    <td><span className={`admin-status-pill status-${update.status}`}>{update.status}</span></td>
                    <td>{update.releaseNotes ? update.releaseNotes.substring(0, 100) + "..." : "—"}</td>
                    <td>
                      <button className="admin-action-button" onClick={() => setEditingUpdate(update)}>Edit</button>
                      <button className="admin-action-button admin-danger-button" onClick={() => deleteUpdate(update.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!updates.length && <p className="admin-empty">No update records. Add components to track versions.</p>}
          </div>
        </section>
      )}

      {editingSecurity && (
        <div className="admin-modal-backdrop" onClick={() => setEditingSecurity(null)}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="security-modal-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">SECURITY</span><h2 id="security-modal-title">{editingSecurity.id ? "Edit Security Setting" : "Add Security Setting"}</h2></div>
              <button className="admin-modal-close" onClick={() => setEditingSecurity(null)}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={(e) => handleSecuritySubmit(e, editingSecurity)}>
              <label>Key<input required value={editingSecurity.key} onChange={(e) => setEditingSecurity({ ...editingSecurity, key: e.target.value })} placeholder="session_timeout_minutes" /></label>
              <label className="admin-full-field">Value (JSON)<textarea rows={4} value={typeof editingSecurity.value === "object" ? JSON.stringify(editingSecurity.value, null, 2) : (editingSecurity.value || "")} onChange={(e) => { try { setEditingSecurity({ ...editingSecurity, value: JSON.parse(e.target.value) }); } catch { setEditingSecurity({ ...editingSecurity, value: e.target.value }); } }} /></label>
              <label className="admin-full-field">Description<textarea rows={2} value={editingSecurity.description || ""} onChange={(e) => setEditingSecurity({ ...editingSecurity, description: e.target.value })} /></label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => setEditingSecurity(null)}>Cancel</button>
                <button type="submit" className="admin-primary-button">Save</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editingUpdate && (
        <div className="admin-modal-backdrop" onClick={() => setEditingUpdate(null)}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="update-modal-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">UPDATES</span><h2 id="update-modal-title">{editingUpdate.id ? "Edit Update Record" : "Add Update Record"}</h2></div>
              <button className="admin-modal-close" onClick={() => setEditingUpdate(null)}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={(e) => handleUpdateSubmit(e, editingUpdate)}>
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

// State for modals
let editingSecurity = null;
let editingUpdate = null;

function setEditingSecurity(value) {
  editingSecurity = value;
  window.dispatchEvent(new CustomEvent('security-edit', { detail: value }));
}

function setEditingUpdate(value) {
  editingUpdate = value;
  window.dispatchEvent(new CustomEvent('update-edit', { detail: value }));
}