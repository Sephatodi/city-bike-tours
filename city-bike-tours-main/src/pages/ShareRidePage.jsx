import { useState } from "react";
import Footer from "../components/Footer";
import { backendUrl } from "../api/backend";
import { prepareImage } from "../utils/images";

function normalizeCode(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}

export default function ShareRidePage() {
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const normalized = normalizeCode(code);
    if (!/^\d{4}[A-Z]{2}$/.test(normalized)) {
      setError("Enter the 6-character booking code, like 1234AB.");
      return;
    }
    if (!file) {
      setError("Choose a photo or video to upload.");
      return;
    }
    if (!title.trim()) {
      setError("Add a short title for your photo or video.");
      return;
    }
    setBusy(true);
    try {
      const isVideo = file.type.startsWith("video/");
      if (isVideo && file.size > 4 * 1024 * 1024) throw new Error("Videos must be 4MB or smaller.");
      const ready = isVideo ? file : await prepareImage(file);
      const form = new FormData();
      form.append("code", normalized);
      form.append("file", ready);
      form.append("title", title.trim());
      if (story.trim()) form.append("story", story.trim());
      const res = await fetch(backendUrl("/api/community/photos"), { method: "POST", body: form, credentials: "include" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "We couldn't upload your photo. Please try again.");
      setSuccess(result.message || "Thank you! Your media will appear once our team has reviewed it.");
      setFile(null);
      setTitle("");
      setStory("");
      setCode(normalized);
    } catch (err) {
      setError(err.message || "We couldn't upload your photo. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="legal-page">
      <section className="page-hero">
        <p className="schedule-section-kicker">AFTER YOUR RIDE</p>
        <h1 className="font-display font-bold" style={{ color: "#F5EDD9", fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}>Share your ride photos</h1>
        <p className="dash-sub">Use the booking code from your confirmation message. No account needed.</p>
      </section>

      <div className="max-w-2xl mx-auto px-6 pb-16">
        <form onSubmit={submit} className="auth-form glass" style={{ padding: "1.5rem", borderRadius: 8 }}>
          <label>
            Booking code *
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(normalizeCode(e.target.value))}
              placeholder="1234AB"
              inputMode="text"
              autoComplete="off"
              aria-describedby="code-help"
            />
          </label>
          <p id="code-help" className="text-xs" style={{ color: "rgba(245,237,217,0.6)", marginTop: "-0.25rem" }}>
            The 6-character code from your booking message (4 digits and 2 letters).
          </p>

          <label>
            Photo or video *
            <input
              type="file"
              required
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <label>
            Title *
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunset at Main Mall"
            />
          </label>

          <label>
            Story <span className="auth-optional">optional</span>
            <textarea
              rows={4}
              maxLength={1500}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Tell us about your ride…"
            />
          </label>

          {error && <p role="alert" className="auth-error">{error}</p>}
          {success && <p role="status" className="auth-success">{success}</p>}

          <button type="submit" className="auth-primary" disabled={busy}>
            {busy ? "Uploading…" : "Share my photo"}
          </button>
          <p className="connect-muted" style={{ fontSize: "0.75rem" }}>
            Your photo appears in the gallery after our team reviews it. Only share media you took or have permission to share.
          </p>
        </form>
      </div>
      <Footer />
    </div>
  );
}
