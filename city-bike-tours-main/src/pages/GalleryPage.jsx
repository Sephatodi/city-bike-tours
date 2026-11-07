import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import RoundaboutCarousel from "../components/RoundaboutCarousel";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import Lightbox from "../components/Lightbox";
import Stamp from "../components/Stamp";
import { SITES } from "../data";
import { useLiveData } from "../hooks/LiveDataContext";
import { usePolling } from "../hooks/usePolling";
import { downloadMedia } from "../utils/download";
import { prepareImage } from "../utils/images";

function useDownloads() {
  const [notice, setNotice] = useState("");
  const download = useCallback(async (item) => {
    setNotice("");
    try {
      await downloadMedia({ kind: item.kind, id: item.id, name: item.title });
    } catch (error) {
      setNotice(error.message);
    }
  }, []);
  return { download, notice };
}

// ─── OFFICIAL PHOTOS (posted by the team / admin) ───────────────────────────

function OfficialGallery() {
  const { content, errors } = useLiveData();
  const { download, notice } = useDownloads();
  const [openAt, setOpenAt] = useState(null);

  // Pictures posted from the dashboard first, then the built-in site photos.
  const items = useMemo(
    () => [
      ...content
        .filter((item) => item.contentType === "picture" && item.mediaUrl)
        .map((item) => ({
          key: `content-${item.id}`,
          kind: "content",
          id: item.id,
          siteId: item.siteId,
          src: item.mediaUrl,
          title: item.title,
          story: item.bodyText,
          downloadable: Boolean(item.downloadable),
        })),
      ...SITES.flatMap((site) =>
        site.imgs.map((src, index) => ({
          key: `${site.id}-${index}`,
          siteId: site.id,
          src,
          title: `${site.name} — photo ${index + 1}`,
          story: site.short,
          downloadable: false,
        })),
      ),
    ],
    [content],
  );

  return (
    <section id="photos" className="gallery-section" aria-labelledby="official-heading">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>
          — Our gallery
        </p>
        <h2
          id="official-heading"
          className="font-display font-bold"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#F5EDD9" }}
        >
          Pictures from City Bike Tours
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: "rgba(245,237,217,0.75)" }}>
          Team and admin-posted photos. Photos the team has marked as downloadable can be downloaded.
        </p>
      </div>
      {errors.content && (
        <p role="alert" className="mb-6 text-center" style={{ color: "#F5A58D" }}>
          The latest team photos couldn't be loaded. Please try again later.
        </p>
      )}
      <RoundaboutCarousel
        items={items}
        label="Pictures from City Bike Tours"
        paused={openAt !== null}
        onOpen={(index) => setOpenAt(index)}
        openOnAnyPhoto
        onDownload={download}
        renderCaption={(item) => (
          <>
            <strong>{item.title}</strong>
            {item.story && <span>{item.story}</span>}
          </>
        )}
      />
      {notice && (
        <p role="alert" className="auth-error" style={{ maxWidth: "36rem", margin: "1rem auto 0" }}>
          {notice}
        </p>
      )}
      {openAt !== null && (
        <Lightbox
          items={items}
          index={openAt}
          onChange={setOpenAt}
          onClose={() => setOpenAt(null)}
          onDownload={download}
        />
      )}
    </section>
  );
}

// ─── RIDER STORIES (uploaded by customers) ───────────────────────────────────
// No account needed: riders upload with the booking code from their confirmation.

function normalizeCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function UploadForm({ onUploaded }) {
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function submit(event) {
    event.preventDefault();
    setError(""); setThanks("");
    const normalized = normalizeCode(code);
    if (!/^\d{4}[A-Z]{2}$/.test(normalized)) { setError("Enter the 6-character booking code, like 1234AB."); return; }
    if (!file) { setError("Choose a photo or video first."); return; }
    if (!title.trim()) { setError("Add a short title for your media."); return; }
    setBusy(true);
    try {
      const isVideo = file.type.startsWith("video/");
      if (isVideo && file.size > 4 * 1024 * 1024) throw new Error("Videos must be 4MB or smaller.");
      const ready = isVideo ? file : await prepareImage(file);
      const form = new FormData();
      form.append("code", normalized);
      form.append("file", ready);
      form.append("title", title.trim());
      form.append("story", story);
      const res = await fetch("/api/community/photos", { method: "POST", body: form, credentials: "include" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "We couldn't upload your media. Please try again.");
      setThanks(result.message || "Thank you! Your media will appear once our team has approved it.");
      setFile(null); setTitle(""); setStory(""); setCode(normalized);
      onUploaded();
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="auth-form upload-form">
      <p className="connect-muted" style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
        Use the booking code from your confirmation message. No account needed. You can also use the <Link to="/share" style={{ color: "#D4A017" }}>share page</Link>.
      </p>
      <label>Booking code *
        <input type="text" required maxLength={6} value={code} onChange={(e) => setCode(normalizeCode(e.target.value))} placeholder="1234AB" inputMode="text" autoComplete="off" />
      </label>
      <label className={`upload-drop ${preview ? "has-preview" : ""}`}>
        {preview ? (
          file?.type.startsWith("video/") ? <video src={preview} muted controls aria-label="Preview of your video" /> : <img src={preview} alt="Preview of your photo" />
        ) : (
          <span><Icon name="image" size={28} /><br />Choose a photo or video</span>
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
          onChange={(event) => { setFile(event.target.files?.[0] || null); setError(""); }} />
      </label>
      <label>Title *
        <input type="text" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunset at the Parliament lawns" />
      </label>
      <label>Your story <span className="auth-optional">optional</span>
        <textarea rows={4} maxLength={1500} value={story} onChange={(e) => setStory(e.target.value)} placeholder="Tell us about your ride, who you went with, what you'll remember…" />
      </label>
      {error && <p role="alert" className="auth-error">{error}</p>}
      {thanks && <p role="status" className="auth-success">{thanks}</p>}
      <button type="submit" className="auth-primary" disabled={busy}>{busy ? "Uploading…" : `Share my ${file?.type.startsWith("video/") ? "video" : "photo"}`}</button>
      <p className="connect-muted" style={{ fontSize: "0.75rem" }}>
        Uploads appear in the gallery only after our team approves them. Only share media you took or have permission to share.
      </p>
    </form>
  );
}

function RiderStories() {
  const { download, notice } = useDownloads();
  const [photos, setPhotos] = useState(null);
  const [failed, setFailed] = useState("");
  const [openAt, setOpenAt] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/community/photos", { credentials: "include" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Rider photos couldn't be loaded.");
      setPhotos(result.photos || []);
      setFailed("");
    } catch (err) { setFailed(err.message); }
  }, []);
  usePolling(load, 60000);

  const items = useMemo(
    () =>
      (photos || []).map((p) => ({
        key: p.id,
        kind: "community",
        id: p.id,
        src: p.imageUrl,
        mediaType: p.mediaType || "image",
        title: p.title,
        story: p.story,
        credit: p.authorName,
        postedAt: p.createdAt,
        visibility: p.visibility || "public",
        downloadable: p.status === "approved" && p.visibility !== "private" && p.downloadable,
        status: p.status,
        mine: p.mine,
      })),
    [photos],
  );

  return (
    <section id="rider-stories" className="gallery-section" aria-labelledby="stories-heading">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>
          — Rider stories
        </p>
        <h2
          id="stories-heading"
          className="font-display font-bold"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "#F5EDD9" }}
        >
          Your photos, your stories
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: "rgba(245,237,217,0.75)" }}>
          Share photos or videos from your ride using your booking code. No account needed.
        </p>
      </div>

      {failed ? (
        <p role="alert" className="text-center" style={{ color: "#F5A58D" }}>
          Rider photos couldn't be loaded. Please try again later.
        </p>
      ) : !photos ? (
        <p className="connect-muted text-center">Loading rider photos…</p>
      ) : items.length === 0 ? (
        <p
          className="connect-muted glass-soft text-center"
          style={{ padding: "1.5rem", borderRadius: 4, maxWidth: "36rem", margin: "0 auto" }}
        >
          No rider media yet — yours could be the first.
        </p>
      ) : (
        <RoundaboutCarousel
          items={items}
          label="Rider photos and stories"
          paused={openAt !== null}
          onOpen={(index) => setOpenAt(index)}
          openOnAnyPhoto
          onDownload={download}
          renderCaption={(item) => (
            <>
              <strong>{item.title}</strong>
              {item.story && <span>{item.story}</span>}
              {item.credit ? <span>— {item.credit}</span> : null}
            </>
          )}
        />
      )}
      {notice && (
        <p role="alert" className="auth-error" style={{ maxWidth: "36rem", margin: "1rem auto 0" }}>
          {notice}
        </p>
      )}

      <details className="connect-panel glass stories-upload rr-gallery-upload-disclosure" style={{ marginTop: "1.5rem" }}>
        <summary className="font-display">Share a photo or video</summary>
        <UploadForm onUploaded={load} />
      </details>

      {openAt !== null && (
        <Lightbox items={items} index={openAt} onChange={setOpenAt} onClose={() => setOpenAt(null)} onDownload={download} />
      )}
    </section>
  );
}

// ─── TEAM UPDATES (kept inside the official gallery section) ────────────────

function OfficialUpdates() {
  const { content } = useLiveData();
  const updates = content.filter((item) => item.contentType !== "picture");
  if (!updates.length) return null;
  return (
    <div className="rr-gallery-updates" aria-labelledby="updates-heading" style={{ marginTop: "2.5rem" }}>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>
          — From the team
        </p>
        <h2 id="updates-heading" className="font-display font-bold text-3xl" style={{ color: "#F5EDD9" }}>
          Videos &amp; updates
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {updates.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-sm glass">
            {item.contentType === "video" && item.mediaUrl && (
              <div className="p-6 pb-0">
                <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="font-semibold underline" style={{ color: "#D4A017" }}>
                  Watch video: {item.title}
                </a>
              </div>
            )}
            <div className="p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4A017" }}>
                {item.contentType}
              </p>
              <h3 className="font-display font-bold text-xl" style={{ color: "#F5EDD9" }}>
                {item.title}
              </h3>
              {item.bodyText && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "rgba(245,237,217,0.8)" }}>
                  {item.bodyText}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return undefined;
    const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    return () => clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <main className="gallery-page rr rr-bg rr-gallery-page">
        <header className="rr-wrap rr-gallery-page-heading">
          <p className="rr-kicker">City Bike Tours · Photo stories</p>
          <h1 className="font-display">Ride moments, shared.</h1>
          <p>Explore official photographs and rider-shared moments from around Gaborone.</p>
        </header>
        <div className="rr-wrap gallery-rr gallery-main-content-wrapper">
          <OfficialGallery />
          <RiderStories />
          <OfficialUpdates />
        </div>
      </main>
      <Footer />
    </>
  );
}
