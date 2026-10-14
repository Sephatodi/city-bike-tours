"use client";

import { useCallback, useEffect, useState } from "react";
import { Empty, Icon, PageTop, Skeleton, api, niceDate, useCopy, useDash, useRun, useToast } from "./ui";

// Big photos are resized in the browser first, so they fit the upload limit and load fast on phones.
async function shrink(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 300 * 1024) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }) : file;
  } catch { return file; }
}

const isVideo = (name) => /\.(mp4|webm)$/i.test(name);
const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function Media() {
  const { can } = useDash();
  const toast = useToast();
  const copy = useCopy();
  const [run, busy] = useRun();
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const write = can("media:write");

  const load = useCallback(async () => {
    try { setState(await api("/api/admin/media", {}, "Could not load files.")); setError(""); } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function upload(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    await run(async () => {
      let ok = 0;
      for (const original of files) {
        const file = await shrink(original);
        const body = new FormData();
        body.append("file", file);
        try { await api("/api/admin/upload", { method: "POST", form: body }, "Upload failed."); ok++; } catch (e) { toast(`${original.name}: ${e.message}`, "error"); }
      }
      await load();
      if (ok) toast(`${ok} file${ok === 1 ? "" : "s"} uploaded.`);
    });
  }

  const remove = (f) => {
    if (!window.confirm(`Delete ${f.name}? Anything on the website that uses it will show a broken image.`)) return;
    run(async () => { await api(`/api/admin/media?url=${encodeURIComponent(f.url)}`, { method: "DELETE" }, "Could not delete."); await load(); }, "Deleted.");
  };

  return (
    <>
      <PageTop title="Media library" actions={write && state?.configured && (
        <label className="btn btn-primary" style={{ cursor: busy ? "wait" : "pointer" }}>
          <Icon name="upload" size={16} /> {busy ? "Uploading…" : "Upload files"}
          <input className="sr" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" disabled={busy} onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
        </label>)}>
        Every picture and video you've uploaded. Copy a link to use it on a page or in an article. Photos are shrunk automatically before upload.
      </PageTop>
      {error ? <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>
        : !state ? <Skeleton h={260} />
        : !state.configured ? <div className="adm-alert warn"><Icon name="alert" /><div><b>File storage isn't connected.</b><div className="muted">Add BLOB_READ_WRITE_TOKEN from Vercel Blob to your backend settings to upload files here. You can still paste links to pictures hosted elsewhere.</div></div></div>
        : state.files.length ? (
          <div className="adm-media-grid">
            {state.files.map((f) => (
              <article key={f.url} className="adm-card adm-media">
                <div className="adm-media-thumb">{isVideo(f.name) ? <video src={f.url} muted preload="metadata" /> : <img src={f.url} alt="" loading="lazy" />}</div>
                <div className="adm-media-body">
                  <h3 style={{ overflowWrap: "anywhere", fontSize: 13 }}>{f.name}</h3>
                  <div className="muted" style={{ fontSize: 12 }}>{kb(f.size)} · {niceDate(String(f.uploadedAt).slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}</div>
                  <div className="adm-media-foot">
                    <button className="btn btn-sm" onClick={() => copy(f.url, "Link copied.")}><Icon name="copy" size={13} /> Copy link</button>
                    {write && <button className="btn btn-sm btn-danger btn-icon" disabled={busy} aria-label={`Delete ${f.name}`} onClick={() => remove(f)}><Icon name="trash" size={13} /></button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="adm-card"><Empty title="No files yet">{write ? "Upload a picture or video to start your library." : "Editors and admins can upload files."}</Empty></div>}
    </>
  );
}
