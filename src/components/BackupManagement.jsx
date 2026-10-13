import { useState, useEffect } from "react";

export default function BackupManagement() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [creatingBackup, setCreatingBackup] = useState(false);

  async function fetchBackups() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/backups", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load backups");
      setBackups(result.backups || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBackups(); }, []);

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
      fetchBackups();
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
      fetchBackups();
    } catch (err) {
      setError(err.message);
    }
  }

  const backupTypes = [
    { id: "database", label: "Database", description: "Full database dump including all tables", icon: "🗄️" },
    { id: "files", label: "Files & Media", description: "Uploaded images, documents, and assets", icon: "📁" },
    { id: "full", label: "Full System", description: "Complete backup of database and files", icon: "💾" },
  ];

  if (loading) return <div className="admin-loading">Loading backups...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">DATA PROTECTION</span>
          <h1>Backup Management</h1>
          <p>Create and manage system backups for disaster recovery</p>
        </div>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <section className="admin-surface">
        <div className="admin-section-heading"><div><span className="admin-eyebrow">CREATE BACKUP</span><h2>Start New Backup</h2></div></div>
        <div className="admin-backup-actions">
          {backupTypes.map(type => (
            <button 
              key={type.id}
              className="admin-backup-type-button"
              onClick={() => createBackup(type.id)}
              disabled={creatingBackup}
            >
              <div className="admin-backup-type-icon">{type.icon}</div>
              <div>
                <strong>{type.label}</strong>
                <small>{type.description}</small>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="admin-surface">
        <div className="admin-section-heading"><div><span className="admin-eyebrow">BACKUP HISTORY</span><h2>Previous Backups</h2></div></div>
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
    </div>
  );
}