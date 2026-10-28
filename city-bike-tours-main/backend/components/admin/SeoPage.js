"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Icon, Modal, PageTop, Skeleton, api, useDash, useRun } from "./ui";

const KNOWN = ["/", "/schedule", "/heritage-trail", "/book", "/gallery", "/connect"];

function Preview({ title, description, base, path }) {
  return (
    <div style={{ padding: 14, borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid var(--line)" }}>
      <div className="muted" style={{ fontSize: 12 }}>{(base || "yoursite.com").replace(/^https?:\/\//, "")}{path === "/" ? "" : path}</div>
      <div style={{ color: "#8ab4ff", fontSize: 17, margin: "2px 0" }}>{title || "Page title"}</div>
      <div className="muted" style={{ fontSize: 13 }}>{description || "A short description of the page appears here in search results."}</div>
    </div>
  );
}

function PageEditor({ row, base, onClose, onSaved }) {
  const [run, busy] = useRun();
  const [form, setForm] = useState({ path: row.path || "/", title: row.title || "", description: row.description || "", keywords: row.keywords || "", noindex: !!row.noindex });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  async function save(e) {
    e.preventDefault();
    const ok = await run(async () => { await api("/api/admin/seo", { method: "PUT", body: form }, "Could not save."); await onSaved(); return true; }, "Saved.");
    if (ok) onClose();
  }
  return (
    <Modal title="Search settings for a page" lead="What Google and others show for this page." width="600px" onClose={onClose}
      footer={<><button className="btn" type="button" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="seo-form" disabled={busy}>Save</button></>}>
      <form id="seo-form" onSubmit={save} className="adm-form-grid">
        <label className="field wide">Page address<input className="input" required value={form.path} onChange={set("path")} disabled={!!row.path} placeholder="/schedule" /></label>
        <label className="field wide">Title<input className="input" maxLength={70} value={form.title} onChange={set("title")} /><span className="hint num">{form.title.length} / 70</span></label>
        <label className="field wide">Description<textarea className="textarea" rows={2} maxLength={170} value={form.description} onChange={set("description")} /><span className="hint num">{form.description.length} / 170</span></label>
        <label className="field wide">Keywords<input className="input" maxLength={250} value={form.keywords} onChange={set("keywords")} placeholder="bike tour, Gaborone, heritage" /></label>
        <label className="field wide" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><input type="checkbox" checked={form.noindex} onChange={set("noindex")} /> Hide this page from search engines</label>
        <div className="wide"><Preview title={form.title} description={form.description} base={base} path={form.path} /></div>
      </form>
    </Modal>
  );
}

export default function SeoPage() {
  const { can } = useDash();
  const [run, busy] = useRun();
  const [pages, setPages] = useState(null);
  const [site, setSite] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const write = can("seo:write");
  const siteWrite = can("settings:write");

  const load = useCallback(async () => {
    try {
      setPages((await api("/api/admin/seo", {}, "Could not load.")).pages);
      if (can("settings:read")) { const s = (await api("/api/admin/settings")).settings; setSite(s); setForm(s); }
      setError("");
    } catch (e) { setError(e.message); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, [load]);

  if (error) return <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>;
  if (!pages) return <Skeleton h={300} />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target.checked ? "true" : "false") : e.target.value }));
  const fields = ["seoTitle", "seoDescription", "seoKeywords", "siteUrl", "noindexSite", "robotsExtra"];
  const dirty = form && fields.some((k) => form[k] !== site[k]);
  const byPath = Object.fromEntries(pages.map((p) => [p.path, p]));
  const rows = [...KNOWN, ...pages.map((p) => p.path).filter((p) => !KNOWN.includes(p))];

  async function saveSite(e) {
    e.preventDefault();
    const body = Object.fromEntries(fields.filter((k) => form[k] !== site[k]).map((k) => [k, form[k]]));
    const res = await run(() => api("/api/admin/settings", { method: "PUT", body }, "Could not save."), "Saved.");
    if (res) { setSite(res.settings); setForm(res.settings); }
  }

  return (
    <>
      <PageTop title="Search (SEO)" actions={<>
        <a className="btn" href="/sitemap.xml" target="_blank" rel="noreferrer">sitemap.xml</a>
        <a className="btn" href="/robots.txt" target="_blank" rel="noreferrer">robots.txt</a>
      </>}>Control how your pages appear in Google. Your sitemap and robots file update by themselves.</PageTop>

      {form && (
        <form className="adm-card" onSubmit={saveSite} style={{ marginBottom: 16 }}>
          <div className="adm-card-head"><h2>Whole website</h2>{siteWrite && <button className="btn btn-primary btn-sm" disabled={busy || !dirty}>Save</button>}</div>
          <fieldset disabled={!siteWrite} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            <div className="adm-form-grid">
              <label className="field wide">Website address<input className="input" type="url" value={form.siteUrl} onChange={set("siteUrl")} placeholder="https://www.yourtours.co.bw" /><span className="hint">Used in your sitemap. Include https://</span></label>
              <label className="field wide">Default title<input className="input" maxLength={70} value={form.seoTitle} onChange={set("seoTitle")} /></label>
              <label className="field wide">Default description<textarea className="textarea" rows={2} maxLength={170} value={form.seoDescription} onChange={set("seoDescription")} /></label>
              <label className="field wide">Keywords<input className="input" maxLength={250} value={form.seoKeywords} onChange={set("seoKeywords")} /></label>
              <label className="field wide">Extra pages to keep out of Google (one per line)<textarea className="textarea" rows={2} maxLength={500} value={form.robotsExtra} onChange={set("robotsExtra")} placeholder="/login" /></label>
              <div className="adm-switch wide" style={{ gridColumn: "1 / -1" }}>
                <div><b>Hide the whole website from search engines</b><small>Use only while you're still building. Visitors can still open the site.</small></div>
                <button type="button" className="adm-toggle" role="switch" aria-checked={form.noindexSite === "true"} aria-label="Hide the website from search engines" onClick={() => setForm((f) => ({ ...f, noindexSite: f.noindexSite === "true" ? "false" : "true" }))} />
              </div>
              <div className="wide"><Preview title={form.seoTitle} description={form.seoDescription} base={form.siteUrl} path="/" /></div>
            </div>
          </fieldset>
        </form>
      )}

      <div className="adm-card">
        <div className="adm-card-head"><div><h2>Page by page</h2><div className="sub">A page without its own settings uses the defaults above.</div></div>
          {write && <button className="btn btn-sm" onClick={() => setEditing({})}><Icon name="plus" size={13} /> Add page</button>}</div>
        <div className="adm-table-wrap"><table>
          <thead><tr><th>Page</th><th>Title</th><th>Search</th>{write && <th aria-label="Actions" />}</tr></thead>
          <tbody>{rows.map((path) => {
            const r = byPath[path];
            return (
              <tr key={path}>
                <td className="strong">{path}</td>
                <td>{r?.title || <span className="muted">Uses default</span>}<small>{r?.description || ""}</small></td>
                <td>{r?.noindex ? <Badge tone="bad">Hidden</Badge> : <Badge tone="good">Visible</Badge>}</td>
                {write && <td><div className="row-actions">
                  <button className="btn btn-sm" onClick={() => setEditing(r || { path })}><Icon name="edit" size={13} /> Edit</button>
                  {r && !KNOWN.includes(path) && <button className="btn btn-sm btn-danger btn-icon" aria-label={`Remove ${path}`} onClick={() => window.confirm(`Remove settings for ${path}?`) && run(async () => { await api(`/api/admin/seo?path=${encodeURIComponent(path)}`, { method: "DELETE" }); await load(); }, "Removed.")}><Icon name="trash" size={13} /></button>}
                </div></td>}
              </tr>);
          })}</tbody>
        </table></div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>These settings are available to your website at /api/seo, so a separate site (like your booking site) can read them.</p>
      </div>
      {editing && <PageEditor row={editing} base={site?.siteUrl} onClose={() => setEditing(null)} onSaved={load} />}
    </>
  );
}
