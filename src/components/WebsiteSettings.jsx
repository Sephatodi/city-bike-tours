import { useState, useEffect } from "react";

export default function WebsiteSettings() {
  const [settings, setSettings] = useState([]);
  const [seoSettings, setSeoSettings] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("general");
  const [showSettingForm, setShowSettingForm] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  const settingForm = {
    key: "",
    value: "",
    description: "",
    category: "general",
    isPublic: false,
  };

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [settingsRes, seoRes, integrationsRes] = await Promise.all([
        fetch("/api/admin/settings", { cache: "no-store" }),
        fetch("/api/admin/seo", { cache: "no-store" }),
        fetch("/api/admin/integrations", { cache: "no-store" }),
      ]);
      const settingsData = await settingsRes.json();
      const seoData = await seoRes.json();
      const integrationsData = await integrationsRes.json();
      if (!settingsRes.ok) throw new Error(settingsData.error || "Failed to load settings");
      if (!seoRes.ok) throw new Error(seoData.error || "Failed to load SEO settings");
      if (!integrationsRes.ok) throw new Error(integrationsData.error || "Failed to load integrations");
      setSettings(settingsData.settings || []);
      setSeoSettings(seoData.settings || []);
      setIntegrations(integrationsData.integrations || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSettingSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      let value;
      try {
        value = JSON.parse(settingForm.value);
      } catch {
        value = settingForm.value;
      }
      
      const url = editingSetting ? `/api/admin/settings/${editingSetting.id}` : "/api/admin/settings";
      const method = editingSetting ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settingForm, value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save setting");
      setNotice(editingSetting ? "Setting updated" : "Setting created");
      setShowSettingForm(false);
      setEditingSetting(null);
      resetSettingForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSeoSubmit(event, item) {
    event.preventDefault();
    setError("");
    try {
      const url = item.id ? `/api/admin/seo/${item.id}` : "/api/admin/seo";
      const method = item.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save SEO setting");
      }
      setNotice(item.id ? "SEO setting updated" : "SEO setting created");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleIntegrationSubmit(event, item) {
    event.preventDefault();
    setError("");
    try {
      const url = item.id ? `/api/admin/integrations/${item.id}` : "/api/admin/integrations";
      const method = item.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save integration");
      }
      setNotice(item.id ? "Integration updated" : "Integration created");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteSetting(id, type) {
    if (!window.confirm("Delete this permanently?")) return;
    setError("");
    try {
      const endpoint = type === "setting" ? "settings" : type === "seo" ? "seo" : "integrations";
      const response = await fetch(`/api/admin/${endpoint}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setNotice("Deleted successfully");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetSettingForm() {
    setSettingForm({ key: "", value: "", description: "", category: "general", isPublic: false });
  }

  function setSettingForm(data) {
    setSettingForm(prev => ({ ...prev, ...data }));
  }

  function openEditSetting(setting) {
    setEditingSetting(setting);
    setSettingForm({
      key: setting.key,
      value: typeof setting.value === "object" ? JSON.stringify(setting.value, null, 2) : setting.value,
      description: setting.description || "",
      category: setting.category,
      isPublic: setting.isPublic,
    });
    setShowSettingForm(true);
  }

  const categories = [...new Set(settings.map(s => s.category))];

  if (loading) return <div className="admin-loading">Loading settings...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">CONFIGURATION</span>
          <h1>Website Settings</h1>
          <p>Manage global parameters, SEO configuration, and third-party integrations</p>
        </div>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <div className="admin-tabs admin-tabs-scrollable">
        <button className={activeTab === "general" ? "active" : ""} onClick={() => setActiveTab("general")}>General Settings</button>
        <button className={activeTab === "seo" ? "active" : ""} onClick={() => setActiveTab("seo")}>SEO Management</button>
        <button className={activeTab === "integrations" ? "active" : ""} onClick={() => setActiveTab("integrations")}>Integrations</button>
      </div>

      {activeTab === "general" && (
        <section className="admin-surface">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">SITE SETTINGS</span><h2>Global Parameters</h2></div>
            <button className="admin-secondary-button" onClick={() => { resetSettingForm(); setEditingSetting(null); setShowSettingForm(true); }}>Add Setting</button>
          </div>
          
          {categories.map(category => (
            <div key={category} className="admin-settings-category">
              <h3 className="admin-category-title">{category}</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Key</th><th>Value</th><th>Description</th><th>Public</th><th>Actions</th></tr></thead>
                  <tbody>
                    {settings.filter(s => s.category === category).map(setting => (
                      <tr key={setting.id}>
                        <td><code>{setting.key}</code></td>
                        <td><pre>{typeof setting.value === "object" ? JSON.stringify(setting.value, null, 2) : setting.value}</pre></td>
                        <td>{setting.description || "—"}</td>
                        <td>{setting.isPublic ? "✅ Yes" : "❌ No"}</td>
                        <td>
                          <button className="admin-action-button" onClick={() => openEditSetting(setting)}>Edit</button>
                          <button className="admin-action-button admin-danger-button" onClick={() => deleteSetting(setting.id, "setting")}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          
          {!settings.length && <p className="admin-empty">No settings configured. Click "Add Setting" to create one.</p>}
        </section>
      )}

      {activeTab === "seo" && (
        <section className="admin-surface">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">SEARCH OPTIMIZATION</span><h2>SEO Settings</h2></div>
            <button className="admin-secondary-button" onClick={() => setEditingSeo({ pagePath: "", metaTitle: "", metaDescription: "" })}>Add SEO Entry</button>
          </div>
          
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Page Path</th><th>Meta Title</th><th>Meta Description</th><th>OG Image</th><th>Actions</th></tr></thead>
              <tbody>
                {seoSettings.map(seo => (
                  <tr key={seo.id}>
                    <td><code>{seo.pagePath}</code></td>
                    <td>{seo.metaTitle || "—"}</td>
                    <td>{seo.metaDescription || "—"}</td>
                    <td>{seo.ogImage ? <img src={seo.ogImage} alt="" style={{ maxWidth: "60px", maxHeight: "30px" }} /> : "—"}</td>
                    <td>
                      <button className="admin-action-button" onClick={() => setEditingSeo(seo)}>Edit</button>
                      <button className="admin-action-button admin-danger-button" onClick={() => deleteSetting(seo.id, "seo")}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!seoSettings.length && <p className="admin-empty">No SEO settings configured.</p>}
        </section>
      )}

      {activeTab === "integrations" && (
        <section className="admin-surface">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">THIRD-PARTY</span><h2>Integrations</h2></div>
            <button className="admin-secondary-button" onClick={() => setEditingIntegration({ id: "", name: "", type: "", config: {}, isEnabled: false })}>Add Integration</button>
          </div>
          
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
                      <button className="admin-action-button" onClick={() => setEditingIntegration(integration)}>Edit</button>
                      <button className="admin-action-button admin-danger-button" onClick={() => deleteSetting(integration.id, "integration")}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {!integrations.length && <p className="admin-empty">No integrations configured.</p>}
        </section>
      )}

      {showSettingForm && (
        <div className="admin-modal-backdrop" onClick={() => { setShowSettingForm(false); setEditingSetting(null); resetSettingForm(); }}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="setting-modal-title">
            <header className="admin-modal-heading">
              <div>
                <span className="admin-eyebrow">SETTINGS</span>
                <h2 id="setting-modal-title">{editingSetting ? "Edit Setting" : "Add New Setting"}</h2>
              </div>
              <button className="admin-modal-close" onClick={() => { setShowSettingForm(false); setEditingSetting(null); resetSettingForm(); }}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={handleSettingSubmit}>
              <label>Key<input required maxLength={100} value={settingForm.key} onChange={(e) => setSettingForm({ key: e.target.value })} placeholder="site_title" /></label>
              <label>Category<select value={settingForm.category} onChange={(e) => setSettingForm({ category: e.target.value })}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="general">General</option>
                <option value="branding">Branding</option>
                <option value="features">Features</option>
                <option value="localization">Localization</option>
              </select></label>
              <label className="admin-full-field">Value (JSON or string)<textarea rows={4} value={settingForm.value} onChange={(e) => setSettingForm({ value: e.target.value })} placeholder='{"primaryColor": "#C1440E", "logoUrl": "https://..."}' /></label>
              <label className="admin-full-field">Description<textarea rows={2} maxLength={500} value={settingForm.description} onChange={(e) => setSettingForm({ description: e.target.value })} /></label>
              <label className="admin-checkbox"><input type="checkbox" checked={settingForm.isPublic} onChange={(e) => setSettingForm({ isPublic: e.target.checked })} /> Public (accessible via API)</label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => { setShowSettingForm(false); setEditingSetting(null); resetSettingForm(); }}>Cancel</button>
                <button type="submit" className="admin-primary-button">{editingSetting ? "Save Changes" : "Create Setting"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editingSeo && (
        <div className="admin-modal-backdrop" onClick={() => setEditingSeo(null)}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="seo-modal-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">SEO</span><h2 id="seo-modal-title">{editingSeo.id ? "Edit SEO" : "Add SEO Entry"}</h2></div>
              <button className="admin-modal-close" onClick={() => setEditingSeo(null)}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={(e) => handleSeoSubmit(e, editingSeo)}>
              <label>Page Path<input required value={editingSeo.pagePath} onChange={(e) => setEditingSeo({ ...editingSeo, pagePath: e.target.value })} placeholder="/routes" /></label>
              <label>Meta Title<input maxLength={60} value={editingSeo.metaTitle || ""} onChange={(e) => setEditingSeo({ ...editingSeo, metaTitle: e.target.value })} /></label>
              <label>Meta Description<input maxLength={160} value={editingSeo.metaDescription || ""} onChange={(e) => setEditingSeo({ ...editingSeo, metaDescription: e.target.value })} /></label>
              <label>OG Title<input maxLength={60} value={editingSeo.ogTitle || ""} onChange={(e) => setEditingSeo({ ...editingSeo, ogTitle: e.target.value })} /></label>
              <label>OG Description<input maxLength={160} value={editingSeo.ogDescription || ""} onChange={(e) => setEditingSeo({ ...editingSeo, ogDescription: e.target.value })} /></label>
              <label>OG Image URL<input type="url" value={editingSeo.ogImage || ""} onChange={(e) => setEditingSeo({ ...editingSeo, ogImage: e.target.value })} /></label>
              <label>Twitter Card<input value={editingSeo.twitterCard || ""} onChange={(e) => setEditingSeo({ ...editingSeo, twitterCard: e.target.value })} /></label>
              <label>Canonical URL<input type="url" value={editingSeo.canonicalUrl || ""} onChange={(e) => setEditingSeo({ ...editingSeo, canonicalUrl: e.target.value })} /></label>
              <label className="admin-full-field">Robots.txt<textarea rows={4} value={editingSeo.robotsTxt || ""} onChange={(e) => setEditingSeo({ ...editingSeo, robotsTxt: e.target.value })} /></label>
              <label className="admin-full-field">Structured Data (JSON)<textarea rows={4} value={editingSeo.structuredData ? JSON.stringify(editingSeo.structuredData, null, 2) : ""} onChange={(e) => { try { setEditingSeo({ ...editingSeo, structuredData: JSON.parse(e.target.value) }); } catch {} }} /></label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => setEditingSeo(null)}>Cancel</button>
                <button type="submit" className="admin-primary-button">Save</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editingIntegration && (
        <div className="admin-modal-backdrop" onClick={() => setEditingIntegration(null)}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="integration-modal-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">INTEGRATIONS</span><h2 id="integration-modal-title">{editingIntegration.id ? "Edit Integration" : "Add Integration"}</h2></div>
              <button className="admin-modal-close" onClick={() => setEditingIntegration(null)}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={(e) => handleIntegrationSubmit(e, editingIntegration)}>
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

// Need to add state for editing SEO and integration
// This is a workaround - in a real app, use useState
let editingSeo = null;
let editingIntegration = null;

function setEditingSeo(value) {
  editingSeo = value;
  // Force re-render by updating a state
  window.dispatchEvent(new CustomEvent('seo-edit', { detail: value }));
}

function setEditingIntegration(value) {
  editingIntegration = value;
  window.dispatchEvent(new CustomEvent('integration-edit', { detail: value }));
}