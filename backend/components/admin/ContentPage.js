"use client";

import { useState } from "react";
import { Badge, DataGate, Empty, Icon, Modal, PageTop, api, useDash, useRun, useToast } from "./ui";

const TYPES = { picture: "image", video: "video", article: "doc" };
const BLANK = { contentType: "picture", title: "", mediaUrl: "", bodyText: "", isFeatured: false };

function Thumb({ item }) {
  if (item.contentType === "picture" && item.mediaUrl) return <img src={item.mediaUrl} alt="" loading="lazy" />;
  if (item.contentType === "video" && item.mediaUrl && /\.(mp4|webm)(\?|$)/i.test(item.mediaUrl)) return <video src={item.mediaUrl} muted preload="metadata" />;
  return <Icon name={TYPES[item.contentType]} size={34} />;
}

function Editor({ item, onClose }) {
  const { refresh } = useDash();
  const toast = useToast();
  const [run, busy] = useRun();
  const [form, setForm] = useState(item ? { contentType: item.contentType, title: item.title, mediaUrl: item.mediaUrl || "", bodyText: item.bodyText || "", isFeatured: item.isFeatured } : BLANK);
  const [brief, setBrief] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const isArticle = form.contentType === "article";

  async function upload(file) {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    const res = await run(() => api("/api/admin/upload", { method: "POST", form: body }, "Upload failed."), "Uploaded. Save to publish it.");
    if (res) setForm((f) => ({ ...f, mediaUrl: res.url }));
  }

  async function draft() {
    const res = await run(() => api("/api/admin/ai/draft", { method: "POST", body: { prompt: brief } }, "Could not draft text."), "Draft added. Read it and edit before you publish.");
    if (res) setForm((f) => ({ ...f, bodyText: res.text }));
  }

  async function save(e) {
    e.preventDefault();
    const ok = await run(async () => {
      if (item) {
        const { contentType, ...patch } = form;
        await api(`/api/admin/content/${item.id}`, { method: "PATCH", body: patch }, "Could not save changes.");
      } else {
        await api("/api/admin/content", { method: "POST", body: form }, "Could not publish.");
      }
      await refresh();
      return true;
    }, item ? "Changes saved." : "Published to the website.");
    if (ok) onClose();
  }

  return (
    <Modal title={item ? "Edit content" : "Add content"} width="640px" onClose={onClose}
      footer={<><button className="btn" type="button" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="content-form" type="submit" disabled={busy}>{item ? "Save changes" : "Publish"}</button></>}>
      <form id="content-form" onSubmit={save} className="adm-form-grid">
        <label className="field">Type
          <select className="select" value={form.contentType} onChange={set("contentType")} disabled={!!item}>
            <option value="picture">Picture</option><option value="video">Video</option><option value="article">Article</option>
          </select>
        </label>
        <label className="field">Title<input className="input" required maxLength={255} value={form.title} onChange={set("title")} /></label>
        {!isArticle && <>
          <label className="field wide">Media link<input className="input" type="url" required value={form.mediaUrl} onChange={set("mediaUrl")} placeholder="https://" /></label>
          <label className="field wide">Or upload a file
            <input className="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} />
            <span className="hint">Up to 4 MB. For longer videos, paste a YouTube or Vimeo link above.</span>
          </label>
        </>}
        {isArticle && (
          <div className="field wide">
            <span>Draft with AI</span>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. What to bring on a dawn ride" aria-label="What should the article be about?" />
              <button type="button" className="btn" disabled={busy || brief.trim().length < 3} onClick={draft}><Icon name="sparkle" size={15} /> Draft</button>
            </div>
            <span className="hint">The draft replaces the text below. Always read and edit it before publishing.</span>
          </div>
        )}
        <label className="field wide">{isArticle ? "Article text" : "Caption"}
          <textarea className="textarea" rows={isArticle ? 9 : 3} maxLength={10000} required={isArticle} value={form.bodyText} onChange={set("bodyText")} />
        </label>
        <label className="field wide" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <input type="checkbox" checked={form.isFeatured} onChange={set("isFeatured")} /> Feature this on the website
        </label>
      </form>
    </Modal>
  );
}

function Body() {
  const { data, can, refresh } = useDash();
  const [run, busy] = useRun();
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const write = can("content:write");
  const list = data.content.filter((c) => filter === "all" || c.contentType === filter);

  const patch = (item, body, msg) => run(async () => { await api(`/api/admin/content/${item.id}`, { method: "PATCH", body }, "Could not update."); await refresh(); }, msg);
  const remove = (item) => {
    if (!window.confirm(`Delete "${item.title}" from the website? This can't be undone.`)) return;
    run(async () => { await api(`/api/admin/content/${item.id}`, { method: "DELETE" }, "Could not delete."); await refresh(); }, "Deleted.");
  };

  return (
    <>
      <PageTop title="Website content" actions={write && <button className="btn btn-primary" onClick={() => setEditing("new")}><Icon name="plus" size={16} /> Add content</button>}>
        Pictures, videos and articles shown on the public website. Hidden items stay here but visitors can't see them.
      </PageTop>
      <div className="adm-toolbar">
        <div className="tabs" role="group" aria-label="Filter by type">
          {[["all", "All"], ["picture", "Pictures"], ["video", "Videos"], ["article", "Articles"]].map(([id, label]) => (
            <button key={id} className="tab" aria-pressed={filter === id} onClick={() => setFilter(id)}>{label}</button>
          ))}
        </div>
      </div>
      {list.length ? (
        <div className="adm-media-grid">
          {list.map((item) => (
            <article key={item.id} className="adm-card adm-media" style={{ opacity: item.isPublished ? 1 : 0.7 }}>
              <div className="adm-media-thumb">
                <Thumb item={item} />
                <span className="chip"><Badge tone={item.isPublished ? "good" : "neutral"}>{item.isPublished ? "Live" : "Hidden"}</Badge></span>
              </div>
              <div className="adm-media-body">
                <h3>{item.title}</h3>
                {item.bodyText && <p>{item.bodyText}</p>}
                <div className="muted" style={{ fontSize: 12 }}>{item.contentType}{item.isFeatured ? " · Featured" : ""}</div>
                {write && (
                  <div className="adm-media-foot">
                    <button className="btn btn-sm" disabled={busy} onClick={() => setEditing(item)}><Icon name="edit" size={13} /> Edit</button>
                    <button className="btn btn-sm" disabled={busy} onClick={() => patch(item, { isPublished: !item.isPublished }, item.isPublished ? "Hidden from the website." : "Published.")}>
                      <Icon name={item.isPublished ? "eyeoff" : "eye"} size={13} /> {item.isPublished ? "Hide" : "Publish"}
                    </button>
                    <button className="btn btn-sm" disabled={busy} aria-pressed={item.isFeatured} onClick={() => patch(item, { isFeatured: !item.isFeatured }, item.isFeatured ? "Removed from featured." : "Featured on the website.")} title="Feature">
                      <Icon name="star" size={13} style={item.isFeatured ? { fill: "#ffbe4d", color: "#ffbe4d" } : undefined} />
                    </button>
                    <button className="btn btn-sm btn-danger btn-icon" disabled={busy} onClick={() => remove(item)} aria-label={`Delete ${item.title}`}><Icon name="trash" size={13} /></button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : <div className="adm-card"><Empty title={filter === "all" ? "Nothing published yet" : `No ${filter}s yet`}>{write ? "Add a picture, video or article to show it on the website." : "Editors and admins can add content."}</Empty></div>}
      {editing && <Editor item={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

export default function ContentPage() {
  return <DataGate><Body /></DataGate>;
}
