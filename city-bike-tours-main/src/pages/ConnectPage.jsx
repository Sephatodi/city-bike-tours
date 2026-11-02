import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import { backendUrl } from "../api/backend";
import Stamp from "../components/Stamp";
import { dayKey, dayLabel } from "../lib/time";
import { useCustomer } from "../auth/CustomerAuth";
import "../rr-theme.css";
import "../gallery-reviews.css";

const Stars = ({ n }) => (
  <span className="review-stars" aria-label={`${n} out of 5 stars`}>
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
  const [headline, setHeadline] = useState("");
  const [showAvatar, setShowAvatar] = useState(false);
  const [rideDate, setRideDate] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!rating) { setError("Choose a star rating."); return; }
    setBusy(true); setError(""); setThanks("");
    try {
      const result = await api("/api/customer/reviews", { method: "POST", body: { rating, comment, headline: headline.trim() || undefined, showAvatar, rideDate: rideDate || undefined, photoUrl: photoUrl.trim() || undefined } });
      setThanks(result.message); setRating(0); setComment(""); setHeadline(""); setShowAvatar(false); setRideDate(""); setPhotoUrl("");
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
      <label>Review title <span className="auth-optional">optional · up to 80 characters</span>
        <input type="text" maxLength={80} value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="A short headline for your review" />
      </label>
      <label>Your review
        <textarea rows={4} required minLength={5} maxLength={600} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell other riders about your experience…" />
      </label>
      <label className="review-avatar-consent"><input type="checkbox" checked={showAvatar} onChange={(e) => setShowAvatar(e.target.checked)} /> Show my profile picture with my review <span className="auth-optional">(off by default)</span></label>
      <label>Photo URL <span className="auth-optional">optional</span>
        <input type="url" maxLength={2000} value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" />
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
          {r.headline && <h3 className="review-headline">{r.headline}</h3>}
          <p>{r.comment}</p>
          {r.adminReply && <div className="review-reply"><strong>Reply from City Bike Tours</strong><p>{r.adminReply}</p>{r.adminReplyAt && <Stamp value={r.adminReplyAt} className="review-stamp" />}</div>}
        </article>
      ))}
    </div>
  );
}

function PublicReviews({ refreshKey }) {
  const { api, isSignedIn } = useCustomer();
  const [reviews, setReviews] = useState(null);
  const [summary, setSummary] = useState(null);
  const [failed, setFailed] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [voteError, setVoteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const run = () => fetch(backendUrl("/api/reviews"), { signal: controller.signal, cache: "no-store" }).then(async (r) => {
      const body = await r.json().catch(() => null);
      if (!r.ok || !Array.isArray(body?.reviews)) throw new Error();
      setReviews(body.reviews);
      setSummary(body.summary || null);
      setFailed(false);
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    void run();
    const timer = setInterval(run, 60000);
    const focus = () => void run();
    window.addEventListener("focus", focus);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener("focus", focus); };
  }, [refreshKey]);

  async function markHelpful(reviewId) {
    if (!isSignedIn) return;
    setVoteError("");
    try {
      const result = await api(`/api/customer/reviews/${reviewId}/helpful`, { method: "POST" });
      setReviews((current) => current?.map((item) => item.id === reviewId ? { ...item, helpfulCount: result.helpfulCount } : item));
    } catch (err) { setVoteError(err.message || "Could not record your vote."); }
  }

  const visibleReviews = (reviews || []).filter((r) => !ratingFilter || r.rating === ratingFilter).sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "lowest") return a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "helpful") return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <section className="connect-wide" aria-labelledby="rider-reviews-heading">
      <p className="connect-kicker">— Rider reviews</p>
      <h2 id="rider-reviews-heading" className="font-display">What riders say</h2>
      {summary && <div className="review-summary glass-soft">
        <strong className="review-average">{summary.average.toFixed(1)} / 5</strong>
        <div><Stars n={Math.round(summary.average)} /><p className="connect-muted">{summary.count} approved rider review{summary.count === 1 ? "" : "s"} · {summary.fourPlusPercent}% rated 4 or 5 stars</p></div>
      </div>}
      <div className="review-controls">
        <label>Filter by rating <select value={ratingFilter} onChange={(e) => setRatingFilter(Number(e.target.value))}><option value={0}>All ratings</option>{[5,4,3,2,1].map((n)=><option key={n} value={n}>{n} stars</option>)}</select></label>
        <label>Sort by <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)}><option value="recent">Most recent</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option><option value="helpful">Most helpful</option></select></label>
      </div>
      {failed ? <p className="connect-muted">Reviews couldn't be loaded right now.</p> : !reviews ? <p className="connect-muted">Loading reviews…</p> : visibleReviews.length === 0 ? (
        <p className="connect-muted">No reviews match this filter.</p>
      ) : (
        <>
        {visibleReviews.filter((r) => r.featured).slice(0, 3).length > 0 && <div className="featured-review-grid">
          {visibleReviews.filter((r) => r.featured).slice(0, 3).map((r) => <article key={r.id} className="review-card featured-quote-card">
            <span className="quote-mark" aria-hidden="true">“</span><Stars n={r.rating} />
            {r.headline && <h3>{r.headline}</h3>}<p>{r.comment}</p>
            {r.photoUrl && <img className="review-photo" src={r.photoUrl} alt="Photo shared with this review" loading="lazy" />}
            <div className="featured-review-author">{r.avatarUrl ? <img src={r.avatarUrl} alt="" /> : <span className="testimonial-avatar" style={{"--avatar-color":avatarColor(r.name)}}>{initials(r.name)}</span>}<div><strong>{r.name}</strong><small>{[r.riderOrigin, r.tour].filter(Boolean).join(" · ")}</small></div></div>
            <p className="review-caption">{[r.tour, r.riderOrigin].filter(Boolean).join(" · ")}</p>
            <div className="review-card-actions"><button type="button" className="review-helpful" disabled={!isSignedIn} onClick={() => markHelpful(r.id)}>Helpful · {r.helpfulCount || 0}</button><button type="button" className="review-share" onClick={() => { const url = window.location.href; if (navigator.share) navigator.share({ title: r.headline || "City Bike Tours review", text: r.comment, url }).catch(() => {}); else navigator.clipboard?.writeText(url); }}>Share</button></div>
          </article>)}
        </div>}
        <div className="review-grid">
          {visibleReviews.filter((r) => !r.featured).map((r) => (
            <article key={r.id} className="review-card testimonial-card">
              {r.avatarUrl ? <img className="review-avatar-photo" src={r.avatarUrl} alt="" /> : <div className="testimonial-avatar" style={{"--avatar-color":avatarColor(r.name)}} aria-hidden="true">{initials(r.name)}</div>}
              <div className="review-head"><Stars n={r.rating} /><span className="connect-muted">{r.rideDate || (r.createdAt ? <Stamp value={r.createdAt}/> : "")}</span></div>
              {r.headline && <h3 className="review-headline">{r.headline}</h3>}<p>{r.comment}</p>
              {r.photoUrl && <img className="review-photo" src={r.photoUrl} alt={`Photo shared by ${r.name} with their review`} loading="lazy" />}
              <div className="review-by">— {r.name} {r.verifiedRider && <span className="verified-rider">✓ Verified rider</span>}</div>
              {Array.isArray(r.stops) && r.stops.length > 0 && <div className="review-stop-chips">{r.stops.map((stop) => <span key={stop}>{stop}</span>)}</div>}
              {r.createdAt && <Stamp value={r.createdAt} className="review-stamp" />}
              {r.adminReply && <div className="review-reply"><strong>Reply from City Bike Tours</strong><p>{r.adminReply}</p></div>}
              <div className="review-card-actions"><button type="button" className="review-helpful" disabled={!isSignedIn} onClick={() => markHelpful(r.id)}>Helpful · {r.helpfulCount || 0}</button><button type="button" className="review-share" onClick={() => { const url = window.location.href; if (navigator.share) navigator.share({ title: r.headline || "City Bike Tours review", text: r.comment, url }).catch(() => {}); else navigator.clipboard?.writeText(url); }}>Share</button></div>
            </article>
          ))}
        </div>
        </>
      )}
      {voteError && <p role="alert" className="auth-error">{voteError}</p>}
      {!isSignedIn && <p className="connect-muted">Sign in to mark reviews as helpful.</p>}
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
      <main className="rr rr-connect-page connect-page">
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
