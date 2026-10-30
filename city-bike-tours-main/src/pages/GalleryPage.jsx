import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import RoundaboutCarousel from "../components/RoundaboutCarousel";
import SiteFolders from "../components/SiteFolders";
import Lightbox from "../components/Lightbox";
import Stamp from "../components/Stamp";
import Footer from "../components/Footer";
import Icon from "../components/Icon";
import { rememberNext, useCustomer } from "../auth/CustomerAuth";
import { useLiveData } from "../hooks/LiveDataContext";
import { downloadPhoto } from "../utils/download";
import { prepareImage } from "../utils/images";

// Downloads need an account, and only photos the team has switched downloads on for.
function useDownloads() {
  const { isSignedIn, token } = useCustomer();
  const navigate = useNavigate();
  const [notice, setNotice] = useState("");
  const download = useCallback(async (item) => {
    if (!isSignedIn) {
      rememberNext("/gallery");
      navigate("/login?next=/gallery");
      return;
    }
    setNotice("");
    try { await downloadPhoto({ token, kind: item.kind, id: item.id, name: item.title }); }
    catch (error) { setNotice(error.message); }
  }, [isSignedIn, token, navigate]);
  return { download, notice };
}

// ─── HERITAGE TRAIL (moved from the home page) ───────────────────────────────

function HeritageSection() {
  return (
    <section id="heritage" className="gallery-section" aria-labelledby="heritage-heading">
      <div className="text-center mb-14">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— The Nation's Story</p>
        <h2 id="heritage-heading" className="font-display font-bold mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#F5EDD9" }}>Six Sites. One Nation's Story.</h2>
        <p className="max-w-2xl mx-auto text-base" style={{ color: "rgba(245,237,217,0.78)" }}>Open a heritage folder to explore its photographs, history and location.</p>
      </div>
      <SiteFolders />
    </section>
  );
}

// ─── OFFICIAL PHOTOS (posted by the team) ────────────────────────────────────

function OfficialGallery() {
  const { content, errors } = useLiveData();
  const { download, notice } = useDownloads();
  const [openAt, setOpenAt] = useState(null);

  const items = useMemo(() => content.filter((item) => item.contentType === "picture" && item.mediaUrl).map((item) => ({
    key: `content-${item.id}`, kind: "content", id: item.id, src: item.mediaUrl, title: item.title, story: item.bodyText, createdAt: item.createdAt, downloadable: Boolean(item.downloadable),
  })), [content]);

  return (
    <section id="photos" className="gallery-section" aria-labelledby="official-heading">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Our gallery</p>
        <h2 id="official-heading" className="font-display font-bold" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#F5EDD9" }}>Pictures from City Bike Tours</h2>
        <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: "rgba(245,237,217,0.75)" }}>Photos of the sites and the rides, posted by our team. Signed-in riders can download the ones marked with a download icon.</p>
      </div>
      {errors.content && <p role="alert" className="mb-6 text-center" style={{ color: "#F5A58D" }}>The latest team photos couldn't be loaded. Please try again later.</p>}
      <RoundaboutCarousel
        items={items}
        label="Pictures from City Bike Tours"
        paused={openAt !== null}
        onOpen={setOpenAt}
        onDownload={download}
        renderCaption={(item) => (<><strong>{item.title}</strong>{item.story && <span>{item.story}</span>}{item.createdAt && <Stamp value={item.createdAt} />}</>)}
      />
      {notice && <p role="alert" className="auth-error" style={{ maxWidth: "36rem", margin: "1rem auto 0" }}>{notice}</p>}
      {openAt !== null && <Lightbox items={items} index={openAt} onChange={setOpenAt} onClose={() => setOpenAt(null)} onDownload={download} />}
    </section>
  );
}

// ─── RIDER STORIES (uploaded by customers) ───────────────────────────────────

function UploadForm({ onUploaded }) {
  const { api, isSignedIn } = useCustomer();
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

  if (!isSignedIn) {
    return (
      <div className="connect-gate">
        <p>Sign in to share your own photos and tell your story.</p>
        <Link to="/login?next=/gallery%23rider-stories" className="auth-primary">Sign in or create an account</Link>
      </div>
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (!file) { setError("Choose a photo first."); return; }
    setBusy(true); setError(""); setThanks("");
    try {
      const ready = await prepareImage(file);
      const form = new FormData();
      form.append("file", ready);
      form.append("title", title);
      form.append("story", story);
      const result = await api("/api/community/photos", { method: "POST", form });
      setThanks(result.message || "Thank you! Your photo will appear once our team has looked at it.");
      setFile(null); setTitle(""); setStory("");
      onUploaded();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="auth-form upload-form">
      <label className={`upload-drop ${preview ? "has-preview" : ""}`}>
        {preview ? <img src={preview} alt="Preview of your photo" /> : <span><Icon name="image" size={28} /><br />Tap to choose a photo</span>}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(""); }} />
      </label>
      <label>Title
        <input type="text" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sunset at the Parliament lawns" />
      </label>
      <label>Your story <span className="auth-optional">optional</span>
        <textarea rows={4} maxLength={1500} value={story} onChange={(e) => setStory(e.target.value)} placeholder="Tell us about your ride, who you went with, what you'll remember…" />
      </label>
      {error && <p role="alert" className="auth-error">{error}</p>}
      {thanks && <p role="status" className="auth-success">{thanks}</p>}
      <button type="submit" className="auth-primary" disabled={busy}>{busy ? "Uploading…" : "Share my photo"}</button>
      <p className="connect-muted" style={{ fontSize: "0.75rem" }}>Photos are checked by our team before they appear. Only share photos you took or have permission to share.</p>
    </form>
  );
}

function RiderStories() {
  const { api, isSignedIn } = useCustomer();
  const { download, notice } = useDownloads();
  const [photos, setPhotos] = useState(null);
  const [failed, setFailed] = useState("");
  const [openAt, setOpenAt] = useState(null);

  const load = useCallback(async () => {
    try { setPhotos((await api("/api/community/photos")).photos); setFailed(""); }
    catch (err) { setFailed(err.message); }
  }, [api]);
  useEffect(() => { void load(); }, [load, isSignedIn]);

  async function remove(id) {
    if (!window.confirm("Remove this photo from the gallery?")) return;
    try { await api(`/api/community/photos/${id}`, { method: "DELETE" }); await load(); }
    catch (err) { window.alert(err.message); }
  }

  const items = useMemo(() => (photos || []).map((p) => ({
    key: p.id, kind: "community", id: p.id, src: p.imageUrl, title: p.title, story: p.story, credit: p.authorName, createdAt: p.createdAt,
    downloadable: Boolean(p.downloadable) && p.status === "approved", status: p.status, mine: p.mine,
  })), [photos]);

  return (
    <section id="rider-stories" className="gallery-section" aria-labelledby="stories-heading">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— Rider stories</p>
        <h2 id="stories-heading" className="font-display font-bold" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#F5EDD9" }}>Your photos, your stories</h2>
        <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: "rgba(245,237,217,0.75)" }}>Rode with us? Share a photo and tell the story behind it. Photos our team has cleared for download show a download icon.</p>
      </div>

      {failed ? <p role="alert" className="text-center" style={{ color: "#F5A58D" }}>Rider photos couldn't be loaded. Please try again later.</p> : !photos ? <p className="connect-muted text-center">Loading rider photos…</p> : items.length === 0 ? (
        <p className="connect-muted glass-soft text-center" style={{ padding: "1.5rem", borderRadius: 4, maxWidth: "36rem", margin: "0 auto" }}>No rider photos yet — yours could be the first.</p>
      ) : (
        <RoundaboutCarousel
          items={items}
          label="Rider photos and stories"
          paused={openAt !== null}
          onOpen={setOpenAt}
          onDownload={download}
          renderCaption={(item) => (
            <>
              <strong>{item.title}</strong>
              {item.story && <span>{item.story}</span>}
              <em>— {item.credit}{item.status === "pending" ? " · waiting for approval" : ""}</em>
              {item.mine && <button type="button" className="auth-link" onClick={() => remove(item.id)}>Remove my photo</button>}
            </>
          )}
        />
      )}
      {notice && <p role="alert" className="auth-error" style={{ maxWidth: "36rem", margin: "1rem auto 0" }}>{notice}</p>}

      <div className="connect-panel glass stories-upload" style={{ maxWidth: "34rem", margin: "2.5rem auto 0" }}>
        <h3 className="font-display">Share a photo</h3>
        <UploadForm onUploaded={load} />
      </div>

      {openAt !== null && <Lightbox items={items} index={openAt} onChange={setOpenAt} onClose={() => setOpenAt(null)} onDownload={download} />}
    </section>
  );
}

// ─── TEAM UPDATES (videos and articles posted from the dashboard) ────────────

function Updates() {
  const { content } = useLiveData();
  const updates = content.filter((item) => item.contentType !== "picture");
  if (!updates.length) return null;
  return (
    <section id="updates" className="gallery-section" aria-labelledby="updates-heading">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#D4A017" }}>— From the team</p>
        <h2 id="updates-heading" className="font-display font-bold text-3xl" style={{ color: "#F5EDD9" }}>Videos &amp; updates</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {updates.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-sm glass">
            {item.contentType === "video" && item.mediaUrl && (
              <div className="p-6 pb-0"><a href={item.mediaUrl} target="_blank" rel="noreferrer" className="font-semibold underline" style={{ color: "#D4A017" }}>Watch video: {item.title}</a></div>
            )}
            <div className="p-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4A017" }}>{item.contentType}</p>
              <h3 className="font-display font-bold text-xl" style={{ color: "#F5EDD9" }}>{item.title}</h3>
              {item.bodyText && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "rgba(245,237,217,0.8)" }}>{item.bodyText}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function GalleryPage() {
  const { hash } = useLocation();

  // The router doesn't scroll to #anchors by itself, and the shared scroll-to-top runs after this page mounts.
  useEffect(() => {
    if (!hash) return undefined;
    const timer = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    return () => clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <main className="gallery-page">
        <header className="gallery-hero">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#D4A017" }}>— Stories from the road</p>
          <h1 className="font-display font-bold" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", color: "#F5EDD9" }}>Gallery &amp; stories</h1>
          <p className="mt-4 max-w-lg text-base" style={{ color: "rgba(245,237,217,0.8)" }}>The nation's story, photos from our team, and stories from the riders who made the journey.</p>
          <nav className="gallery-jump" aria-label="Gallery sections">
            <a href="#heritage">The Nation's Story</a>
            <a href="#photos">Our gallery</a>
            <a href="#rider-stories">Rider stories</a>
          </nav>
        </header>
        <div className="mx-auto max-w-7xl px-6">
          <HeritageSection />
          <OfficialGallery />
          <RiderStories />
          <Updates />
        </div>
      </main>
      <Footer />
    </>
  );
}
