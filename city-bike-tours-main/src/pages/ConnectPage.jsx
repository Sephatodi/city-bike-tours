import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import { backendUrl } from "../api/backend";
import Stamp from "../components/Stamp";
import { dayKey, dayLabel } from "../lib/time";
import { useCustomer } from "../auth/CustomerAuth";
import "../rr-theme.css";

const Stars = ({ n }) => (
  <span aria-label={`${n} out of 5 stars`} style={{ color: "#D4A017", letterSpacing: 2 }}>
    {"★".repeat(n)}<span style={{ color: "rgba(245,237,217,0.25)" }}>{"★".repeat(5 - n)}</span>
  </span>
);

const initials = (name="Rider") => name.trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();
const avatarColor = (name="") => { let h=0; for(const ch of name) h=(h*31+ch.charCodeAt(0))|0; return ["#8B4A32","#426B55","#9A7130","#59658A","#8B5D7B"][Math.abs(h)%5]; };

function SignInPrompt({ what }) {
  return (
    <div className="connect-gate">
      <p>Sign in to {what}.</p>
      <Link to="/login?next=/connect" className="auth-primary">Sign in or create an account</Link>
    </div>
  );
}

function Messages() {
  const { api, isSignedIn, user } = useCustomer();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  const load = useCallback(async () => {
    try { setMessages((await api("/api/customer/messages")).messages); setError(""); }
    catch (err) { setError(err.message); }
  }, [api]);

  useEffect(() => {
    if (!isSignedIn) return undefined;
    void load();
    const timer = setInterval(load, 20000);
    const focus = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => { clearInterval(timer); window.removeEventListener("focus", focus); document.removeEventListener("visibilitychange", focus); };
  }, [isSignedIn, load]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages?.length]);

  async function send(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setBusy(true); setError("");
    try {
      const { message } = await api("/api/customer/messages", { method: "POST", body: { body: text } });
      setMessages((current) => [...(current || []), message]);
      setText("");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <section className="connect-panel glass" aria-labelledby="messages-heading">
      <p className="connect-kicker">— Talk to us</p>
      <h2 id="messages-heading" className="font-display">Message the team</h2>
      <p className="connect-lead">Questions about a ride, a booking or anything else? Write to us here and we'll reply on this page.</p>
      {!isSignedIn ? <SignInPrompt what="send us a message" /> : (
        <>
          <div ref={listRef} className="chat-list" aria-live="polite">
            {!messages ? <p className="connect-muted">Loading your conversation…</p> : messages.length === 0 ? (
              <p className="connect-muted">No messages yet. Say hello, {user?.name?.split(" ")[0] || "rider"}!</p>
            ) : messages.map((m, index) => (
              <div key={m.id}>
                {(index === 0 || dayKey(m.createdAt) !== dayKey(messages[index - 1].createdAt)) && <div className="chat-day-divider"><span>{dayLabel(m.createdAt)}</span></div>}
                <div className={`chat-bubble ${m.sender === "admin" ? "from-team" : "from-me"}`}>
                <div className="chat-meta">{m.sender === "admin" ? "City Bike Tours" : "You"} · <Stamp value={m.createdAt} /></div>
                <div className="chat-body">{m.body}</div>
              </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="chat-form">
            <label className="sr-only" htmlFor="chat-input">Your message</label>
            <textarea id="chat-input" rows={3} maxLength={1500} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();if(text.trim()&&!busy)e.currentTarget.form?.requestSubmit();}}} placeholder="Write your message… (Enter to send · Shift+Enter for a new line)" />
            {error && <p role="alert" className="auth-error">{error}</p>}
            <button type="submit" className="auth-primary" disabled={busy || !text.trim()}>{busy ? "Sending…" : "Send message"}</button>
          </form>
        </>
      )}
    </section>
  );
}

function ReviewForm({ onSent }) {
  const { api, isSignedIn } = useCustomer();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!rating) { setError("Choose a star rating."); return; }
    setBusy(true); setError(""); setThanks("");
    try {
      const result = await api("/api/customer/reviews", { method: "POST", body: { rating, comment, rideDate: rideDate || undefined } });
      setThanks(result.message); setRating(0); setComment(""); setRideDate("");
      onSent();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  if (!isSignedIn) return <SignInPrompt what="leave a review" />;
  return (
    <form onSubmit={submit} className="auth-form">
      <div>
        <div className="connect-label">Your rating</div>
        <div className="star-picker" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className={(hover || rating) >= n ? "on" : ""}>★</button>
          ))}
        </div>
      </div>
      <label>Your review
        <textarea rows={4} required minLength={5} maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell other riders about your experience…" />
      </label>
      <label>Ride date <span className="auth-optional">optional</span>
        <input type="date" max={new Date().toISOString().slice(0, 10)} value={rideDate} onChange={(e) => setRideDate(e.target.value)} />
      </label>
      {error && <p role="alert" className="auth-error">{error}</p>}
      {thanks && <p role="status" className="auth-success">{thanks}</p>}
      <button type="submit" className="auth-primary" disabled={busy}>{busy ? "Sending…" : "Submit review"}</button>
    </form>
  );
}

const STATUS_TEXT = { pending: "Waiting for approval", approved: "Published", rejected: "Not published" };

function MyReviews({ reviews }) {
  if (!reviews?.length) return null;
  return (
    <div className="review-mine">
      <div className="connect-label">Your reviews</div>
      {reviews.map((r) => (
        <article key={r.id} className="review-card glass-soft">
          <div className="review-head"><Stars n={r.rating} /><span className={`review-status ${r.status}`}>{STATUS_TEXT[r.status] || r.status}</span></div>
          <p>{r.comment}</p>
          {r.adminReply && <div className="review-reply"><strong>Reply from City Bike Tours</strong><p>{r.adminReply}</p>{r.adminReplyAt && <Stamp value={r.adminReplyAt} className="review-stamp" />}</div>}
        </article>
      ))}
    </div>
  );
}

function PublicReviews({ refreshKey }) {
  const [reviews, setReviews] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const run = () => fetch(backendUrl("/api/reviews"), { signal: controller.signal, cache: "no-store" }).then(async (r) => { const body = await r.json().catch(() => null); if (!r.ok || !Array.isArray(body?.reviews)) throw new Error(); setReviews(body.reviews); setFailed(false); }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    void run();
    const timer = setInterval(run, 60000);
    const focus = () => void run();
    window.addEventListener("focus", focus);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener("focus", focus); };
  }, [refreshKey]);

  return (
    <section className="connect-wide" aria-labelledby="rider-reviews-heading">
      <p className="connect-kicker">— Rider reviews</p>
      <h2 id="rider-reviews-heading" className="font-display">What riders say</h2>
      {failed ? <p className="connect-muted">Reviews couldn't be loaded right now.</p> : !reviews ? <p className="connect-muted">Loading reviews…</p> : reviews.length === 0 ? (
        <p className="connect-muted">No reviews yet. Be the first to share your ride.</p>
      ) : (
        <div className="review-grid">
          {reviews.map((r) => (
            <article key={r.id} className="review-card testimonial-card"><div className="testimonial-avatar" style={{"--avatar-color":avatarColor(r.name)}} aria-hidden="true">{initials(r.name)}</div>
              <div className="review-head"><Stars n={r.rating} /><span className="connect-muted">{r.rideDate || (r.createdAt ? <Stamp value={r.createdAt}/> : "")}</span></div>
              <p>{r.comment}</p>
              <div className="review-by">— {r.name}</div>{r.createdAt && <Stamp value={r.createdAt} className="review-stamp" />}
              {r.adminReply && <div className="review-reply"><strong>Reply from City Bike Tours</strong><p>{r.adminReply}</p></div>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ConnectPage() {
  const { api, isSignedIn, user, signOut } = useCustomer();
  const [mine, setMine] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadMine = useCallback(async () => {
    if (!isSignedIn) { setMine(null); return; }
    try { setMine((await api("/api/customer/reviews")).reviews); } catch { /* shown elsewhere */ }
  }, [api, isSignedIn]);
  useEffect(() => { void loadMine(); }, [loadMine]);

  return (
    <>
      <main className="rr rr-bg rr-page connect-page">
        <header className="connect-hero">
          <p className="connect-kicker">— Reviews &amp; messages</p>
          <h1 className="font-display">Connect with City Bike Tours</h1>
          <p className="connect-lead">Message our team, tell other riders how your ride went, and read what the community is saying.</p>
          {isSignedIn && (
            <p className="connect-signed">Signed in as <strong>{user?.name}</strong> · <button type="button" onClick={signOut}>Sign out</button></p>
          )}
        </header>

        <div className="connect-grid">
          <Messages />
          <section className="connect-panel glass" aria-labelledby="review-heading">
            <p className="connect-kicker">— Share your ride</p>
            <h2 id="review-heading" className="font-display">Leave a review</h2>
            <p className="connect-lead">Our team reads every review and may reply. Approved reviews appear below for everyone to see.</p>
            <ReviewForm onSent={() => { void loadMine(); setRefreshKey((k) => k + 1); }} />
            <MyReviews reviews={mine} />
          </section>
        </div>

        <PublicReviews refreshKey={refreshKey} />
      </main>
      <Footer />
    </>
  );
}
