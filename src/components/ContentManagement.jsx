import { useState, useEffect } from "react";

export default function ContentManagement() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("content");

  const formData = {
    contentType: "picture",
    title: "",
    mediaUrl: "",
    bodyText: "",
    isFeatured: false,
    isPublished: true,
  };

  async function fetchContent() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/content", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load content");
      setContent(result.content || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchContent(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const url = editingItem ? `/api/admin/content/${editingItem.id}` : "/api/admin/content";
      const method = editingItem ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save content");
      setNotice(editingItem ? "Content updated" : "Content published");
      setShowForm(false);
      setEditingItem(null);
      resetForm();
      fetchContent();
    } catch (err) {
      setError(err.message);
    }
  }

  async function togglePublish(id, isPublished) {
    setError("");
    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      if (!response.ok) throw new Error("Failed to update");
      fetchContent();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleFeature(id, isFeatured) {
    setError("");
    try {
      const response = await fetch(`/api/admin/content/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      });
      if (!response.ok) throw new Error("Failed to update");
      fetchContent();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteContent(id) {
    if (!window.confirm("Delete this content permanently?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/content/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setNotice("Content deleted");
      fetchContent();
    } catch (err) {
      setError(err.message);
    }
  }

  async function uploadFile(file) {
    if (!file) return;
    setError("");
    setNotice("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      setFormData({ ...formData, mediaUrl: result.url });
      setNotice("File uploaded. Add a title and save.");
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setFormData({ contentType: "picture", title: "", mediaUrl: "", bodyText: "", isFeatured: false, isPublished: true });
  }

  function setFormData(data) {
    setFormData(prev => ({ ...prev, ...data }));
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormData({
      contentType: item.contentType,
      title: item.title,
      mediaUrl: item.mediaUrl || "",
      bodyText: item.bodyText || "",
      isFeatured: item.isFeatured,
      isPublished: item.isPublished !== false,
    });
    setShowForm(true);
  }

  const filteredContent = content.filter(item => {
    if (activeTab === "all") return true;
    if (activeTab === "published") return item.isPublished;
    if (activeTab === "drafts") return !item.isPublished;
    if (activeTab === "featured") return item.isFeatured;
    return item.contentType === activeTab;
  });

  if (loading) return <div className="admin-loading">Loading content...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">PUBLISHING</span>
          <h1>Content Management</h1>
          <p>Create, edit, and manage website content including images, videos, and articles</p>
        </div>
        <button className="admin-primary-button" onClick={() => { resetForm(); setEditingItem(null); setShowForm(true); }}>
          Add Content
        </button>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <div className="admin-tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>All</button>
        <button className={activeTab === "published" ? "active" : ""} onClick={() => setActiveTab("published")}>Published</button>
        <button className={activeTab === "drafts" ? "active" : ""} onClick={() => setActiveTab("drafts")}>Drafts</button>
        <button className={activeTab === "featured" ? "active" : ""} onClick={() => setActiveTab("featured")}>Featured</button>
        <button className={activeTab === "picture" ? "active" : ""} onClick={() => setActiveTab("picture")}>Images</button>
        <button className={activeTab === "video" ? "active" : ""} onClick={() => setActiveTab("video")}>Videos</button>
        <button className={activeTab === "article" ? "active" : ""} onClick={() => setActiveTab("article")}>Articles</button>
      </div>

      <section className="admin-surface admin-content-panel">
        <form className="admin-content-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <label>Content Type<select value={formData.contentType} onChange={(e) => setFormData({ contentType: e.target.value })}>
              <option value="picture">Image</option>
              <option value="video">Video</option>
              <option value="article">Article</option>
            </select></label>
            <label>Title<input required maxLength={255} value={formData.title} onChange={(e) => setFormData({ title: e.target.value })} /></label>
          </div>
          
          {formData.contentType !== "article" && (
            <div className="admin-form-row">
              <label>Upload File<input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => uploadFile(e.target.files[0])} /></label>
              <label>Media URL<input required type="url" value={formData.mediaUrl} onChange={(e) => setFormData({ mediaUrl: e.target.value })} placeholder="https://..." /></label>
            </div>
          )}

          <label className="admin-full-field">
            {formData.contentType === "article" ? "Article Content" : "Caption / Description"}
            <textarea rows={6} maxLength={10000} value={formData.bodyText} onChange={(e) => setFormData({ bodyText: e.target.value })} />
          </label>

          <div className="admin-form-row">
            <label className="admin-checkbox"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ isFeatured: e.target.checked })} /> Feature this content</label>
            <label className="admin-checkbox"><input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ isPublished: e.target.checked })} /> Publish immediately</label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button">{editingItem ? "Save Changes" : "Publish Content"}</button>
            <button type="button" className="admin-secondary-button" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}>Cancel</button>
          </div>
        </form>

        {content.length > 0 && (
          <ul className="admin-content-list">
            {filteredContent.map((item) => (
              <li key={item.id}>
                <div className="admin-content-info">
                  <strong>{item.title}</strong>
                  <div className="admin-content-meta">
                    <span className={`admin-content-type type-${item.contentType}`}>{item.contentType}</span>
                    {item.isFeatured && <span className="admin-badge badge-featured">Featured</span>}
                    <span className={item.isPublished ? "admin-badge badge-published" : "admin-badge badge-draft"}>
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                    <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
                <div className="admin-content-actions">
                  {item.mediaUrl && <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="admin-action-button">View Media</a>}
                  <button className="admin-action-button" onClick={() => togglePublish(item.id, item.isPublished)}>
                    {item.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button className="admin-action-button" onClick={() => toggleFeature(item.id, item.isFeatured)}>
                    {item.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                  <button className="admin-action-button" onClick={() => openEdit(item)}>Edit</button>
                  <button className="admin-action-button admin-danger-button" onClick={() => deleteContent(item.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!content.length && <p className="admin-empty">No content published yet. Click "Add Content" to get started.</p>}
      </section>

      {showForm && (
        <div className="admin-modal-backdrop" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="content-modal-title">
            <header className="admin-modal-heading">
              <div>
                <span className="admin-eyebrow">CONTENT EDITOR</span>
                <h2 id="content-modal-title">{editingItem ? "Edit Content" : "Create New Content"}</h2>
              </div>
              <button className="admin-modal-close" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={handleSubmit}>
              <div className="admin-form-row">
                <label>Content Type<select value={formData.contentType} onChange={(e) => setFormData({ contentType: e.target.value })}>
                  <option value="picture">Image</option>
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                </select></label>
                <label>Title<input required maxLength={255} value={formData.title} onChange={(e) => setFormData({ title: e.target.value })} /></label>
              </div>
              
              {formData.contentType !== "article" && (
                <div className="admin-form-row">
                  <label>Upload File<input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => uploadFile(e.target.files[0])} /></label>
                  <label>Media URL<input required type="url" value={formData.mediaUrl} onChange={(e) => setFormData({ mediaUrl: e.target.value })} placeholder="https://..." /></label>
                </div>
              )}

              <label className="admin-full-field">
                {formData.contentType === "article" ? "Article Content" : "Caption / Description"}
                <textarea rows={6} maxLength={10000} value={formData.bodyText} onChange={(e) => setFormData({ bodyText: e.target.value })} />
              </label>

              <div className="admin-form-row">
                <label className="admin-checkbox"><input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ isFeatured: e.target.checked })} /> Feature this content</label>
                <label className="admin-checkbox"><input type="checkbox" checked={formData.isPublished} onChange={(e) => setFormData({ isPublished: e.target.checked })} /> Publish immediately</label>
              </div>

              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => { setShowForm(false); setEditingItem(null); resetForm(); }}>Cancel</button>
                <button type="submit" className="admin-primary-button">{editingItem ? "Save Changes" : "Publish Content"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}