import { useState, useEffect } from "react";

export default function IntegrationsManagement() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingIntegration, setEditingIntegration] = useState(null);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/integrations", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load integrations");
      setIntegrations(result.integrations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    try {
      const url = editingIntegration.id ? `/api/admin/integrations/${editingIntegration.id}` : "/api/admin/integrations";
      const method = editingIntegration.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingIntegration),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save integration");
      }
      setNotice(editingIntegration.id ? "Integration updated" : "Integration created");
      setEditingIntegration(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteIntegration(id) {
    if (!window.confirm("Delete this integration?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/integrations/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setNotice("Deleted");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  function openEdit(integration) {
    setEditingIntegration({ ...integration });
  }

  if (loading) return <div className="admin-loading">Loading integrations...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">THIRD-PARTY</span>
          <h1>Integrations</h1>
          <p>Connect and manage third-party services and APIs</p>
        </div>
        <button className="admin-secondary-button" onClick={() => setEditingIntegration({ id: "", name: "", type: "analytics", config: {}, isEnabled: false })}>Add Integration</button>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <section className="admin-surface">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Enabled</th><th>Last Sync</th><th>Actions</th></tr></thead>
            <tbody>
              {integrations.map(integration => (
                <tr key={integration.id}>
                  <td><strong>{integration.name}</strong></td>
                  <td><span className="admin-badge">{integration.type}</span></td>
                  <td><span className={`admin-status ${integration.status}`}>{integration.status}</span></td>
                  <td>{integration.isEnabled ? "✅ Yes" : "❌ No"}</td>
                  <td>{integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : "Never"}</td>
                  <td>
                    <button className="admin-action-button" onClick={() => openEdit(integration)}>Edit</button>
                    <button className="admin-action-button admin-danger-button" onClick={() => deleteIntegration(integration.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!integrations.length && <p className="admin-empty">No integrations configured.</p>}
        </div>
      </section>

      {editingIntegration && (
        <div className="admin-modal-backdrop" onClick={() => setEditingIntegration(null)}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="integration-modal-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">INTEGRATIONS</span><h2 id="integration-modal-title">{editingIntegration.id ? "Edit Integration" : "Add Integration"}</h2></div>
              <button className="admin-modal-close" onClick={() => setEditingIntegration(null)}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={handleSubmit}>
                {!editingIntegration?.id && <label>Integration ID<input required value={editingIntegration.id} onChange={(e) => setEditingIntegration({ ...editingIntegration, id: e.target.value })} placeholder="google_analytics" /></label>}
                <label>Name<input required value={editingIntegration.name} onChange={(e) => setEditingIntegration({ ...editingIntegration, name: e.target.value })} /></label>
              <label>Type<select value={editingIntegration.type} onChange={(e) => setEditingIntegration({ ...editingIntegration, type: e.target.value })}>
                <option value="analytics">Analytics</option>
                <option value="payment">Payment</option>
                <option value="crm">CRM</option>
                <option value="email">Email Marketing</option>
                <option value="social">Social Media</option>
                <option value="other">Other</option>
              </select></label>
              <label className="admin-full-field">Config (JSON)<textarea rows={4} value={JSON.stringify(editingIntegration.config || {}, null, 2)} onChange={(e) => { try { setEditingIntegration({ ...editingIntegration, config: JSON.parse(e.target.value) }); } catch {} }} /></label>
              <label className="admin-checkbox"><input type="checkbox" checked={editingIntegration.isEnabled} onChange={(e) => setEditingIntegration({ ...editingIntegration, isEnabled: e.target.checked })} /> Enabled</label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => setEditingIntegration(null)}>Cancel</button>
                <button type="submit" className="admin-primary-button">Save</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}