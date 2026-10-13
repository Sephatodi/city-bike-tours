import { useState, useEffect } from "react";

export default function SEOManagement() {
  const [seoSettings, setSeoSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingSeo, setEditingSeo] = useState(null);

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/seo", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load SEO settings");
      setSeoSettings(result.settings || []);
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
      const url = editingSeo.id ? `/api/admin/seo/${editingSeo.id}` : "/api/admin/seo";
      const method = editingSeo.id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingSeo),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to save SEO setting");
      }
      setNotice(editingSeo.id ? "SEO setting updated" : "SEO setting created");
      setEditingSeo(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteSeo(id) {
    if (!window.confirm("Delete this SEO setting?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/seo/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setNotice("Deleted");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  function openEdit(seo) {
    setEditingSeo({ ...seo });
  }

  if (loading) return <div className="admin-loading">Loading SEO settings...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">SEARCH OPTIMIZATION</span>
          <h1>SEO Management</h1>
          <p>Configure meta tags, Open Graph, and structured data for each page</p>
        </div>
        <button className="admin-secondary-button" onClick={() => setEditingSeo({ pagePath: "", metaTitle: "", metaDescription: "", ogTitle: "", ogDescription: "", ogImage: "", twitterCard: "", canonicalUrl: "", robotsTxt: "", structuredData: {} })}>Add SEO Entry</button>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <section className="admin-surface">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Page Path</th><th>Meta Title</th><th>Meta Description</th><th>OG Image</th><th>Updated</th><th>Actions</th></tr></thead>
            <tbody>
              {seoSettings.map(seo => (
                <tr key={seo.id}>
                  <td><code>{seo.pagePath}</code></td>
                  <td>{seo.metaTitle || "—"}</td>
                  <td>{seo.metaDescription || "—"}</td>
                  <td>{seo.ogImage ? <img src={seo.ogImage} alt="" style={{ maxWidth: "60px", maxHeight: "30px" }} /> : "—"}</td>
                  <td>{new Date(seo.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <button className="admin-action-button" onClick={() => openEdit(seo)}>Edit</button>
                    <button className="admin-action-button admin-danger-button" onClick={() => deleteSeo(seo.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!seoSettings.length && <p className="admin-empty">No SEO settings configured.</p>}
        </div>
      </section>

      {editingSeo && (
        <div className="admin-modal-backdrop" onClick={() => setEditingSeo(null)}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="seo-modal-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">SEO</span><h2 id="seo-modal-title">{editingSeo.id ? "Edit SEO" : "Add SEO Entry"}</h2></div>
              <button className="admin-modal-close" onClick={() => setEditingSeo(null)}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={handleSubmit}>
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
    </div>
  );
}