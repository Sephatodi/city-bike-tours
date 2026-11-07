import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import RrIcon, { StarRow, Verified } from "../components/RrIcon";
import Stamp from "../components/Stamp";
import { useCustomer } from "../auth/CustomerAuth";
import { SITES } from "../data";
import { usePolling } from "../hooks/usePolling";
import { useNow } from "../hooks/useNow";
import { dayKey, dayLabel, formatDateTime, formatTime } from "../lib/time";
import { prepareImage } from "../utils/images";

const TOUR_LABELS = { complete: "Heritage City Ride", loop: "Casual Saturday", other: "Another ride" };
const HIGHLIGHTS = ["Expert guide", "Civic architecture", "Beginner friendly", "Safety", "Bike quality", "Value for money"];
const SITE_NAME = Object.fromEntries(SITES.map((site) => [site.id, site.name]));
const RATING_WORDS = ["", "Poor", "Fair", "Good", "Very good", "Exceptional"];

// ─── Score summary (real numbers only) ───────────────────────────────────────
function ScoreCard({ summary }) {
  if (!summary?.count) return null;
  const rows = [5, 4, 3, 2, 1];
  return (
    <section className="rr-plate-elevated rr-pad rr-score" aria-label="Rating summary">
      <div className="rr-score-main">
        <div className="rr-score-number"><span className="rr-serif">{summary.average.toFixed(1)}</span><small>/ 5.0</small></div>
        <StarRow value={summary.average} size={20} label={`Average rating ${summary.average} out of 5`} />
        <p className="rr-score-count">{summary.count} rider review{summary.count === 1 ? "" : "s"}</p>
        <p className="rr-score-rec"><RrIcon name="thumb" size={14} /> {summary.fourPlusPercent}% rated 4★ or higher</p>
      </div>
      <div className="rr-bars">
        {rows.map((star) => {
          const percent = Math.round(((summary.distribution[star] || 0) / summary.count) * 100);
          return (
            <div key={star} className="rr-bar-row">
              <span>{star}★</span>
              <div className="rr-bar" role="img" aria-label={`${percent}% gave ${star} stars`}><i style={{ width: `${percent}%`, opacity: 0.4 + star * 0.12 }} /></div>
              <span>{percent}%</span>
            </div>
          );
        })}
      </div>
      {summary.highlights?.length > 0 && (
        <div className="rr-highlights" aria-label="What riders pick most">
          {summary.highlights.slice(0, 4).map((item) => <span key={item.tag} className="rr-chip">{item.tag} <strong>{item.percent}%</strong></span>)}
        </div>
      )}
    </section>
  );
}

// ─── One review ──────────────────────────────────────────────────────────────
function ReviewCard({ review, isSignedIn, onVote }) {
  const [shared, setShared] = useState("");
  const stops = (review.stops || []).filter((id) => SITE_NAME[id]);

  async function share() {
    const url = `${window.location.origin}/connect#review-${review.id}`;
    const text = `${review.name} rated City Bike Tours ${review.rating}/5: “${review.comment.slice(0, 120)}”`;
    try {
      if (navigator.share) await navigator.share({ title: "City Bike Tours review", text, url });
      else { await navigator.clipboard.writeText(url); setShared("Link copied"); setTimeout(() => setShared(""), 2500); }
    } catch { /* the visitor closed the share sheet */ }
  }

  return (
    <article id={`review-${review.id}`} tabIndex={0} className="rr-plate rr-pad rr-review">
      <header className="rr-review-head">
        {review.headline && <span className="rr-headline">{review.headline}</span>}
        <div className="rr-review-who">
          {review.avatarUrl ? (
            <img className="rr-avatar" src={review.avatarUrl} alt={`${review.name}'s profile picture`} style={{ objectFit: "cover" }} />
          ) : (
            <div className="rr-avatar">{review.name.trim().split(/\s+/).map((part) => part[0]).join("").toUpperCase().slice(0, 2)}</div>
          )}
          <div>
            <h3 className="rr-name">{review.name}{review.verified && <Verified />}</h3>
            <p>{[review.verified && "Verified rider", review.riderOrigin].filter(Boolean).join(" · ") || "Rider"}</p>
          </div>
        </div>
        <span className="rr-review-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>
          {[1, 2, 3, 4, 5].map((star) => (
            <RrIcon key={star} name="star" size={18} className={star <= review.rating ? "on" : "off"} filled={star <= review.rating} />
          ))}
        </span>
      </header>
      <div className="rr-review-meta">
        <Stamp value={review.createdAt} compact className="rr-when" />
        {review.tour && <span className="rr-tag">{TOUR_LABELS[review.tour] || review.tour}</span>}
      </div>
      <p className="rr-comment">“{review.comment}”</p>
      {review.photoUrl && (
        <figure className="rr-photo">
          <img src={review.photoUrl} alt={`Photo shared by ${review.name}`} loading="lazy" />
          {stops[0] && <figcaption><RrIcon name="pin" size={13} /> {SITE_NAME[stops[0]]}</figcaption>}
        </figure>
      )}
      {stops.length > 0 && <div className="rr-stops">{stops.map((id) => <Link key={id} to={`/gallery/${id}`} className="rr-hash">#{SITE_NAME[id].replace(/[^A-Za-z0-9]+/g, "")}</Link>)}</div>}
      <footer className="rr-review-foot">
        {isSignedIn ? (
          <button type="button" className={`rr-link-btn ${review.voted ? "is-on" : ""}`} aria-pressed={Boolean(review.voted)} disabled={review.mine} onClick={() => onVote(review)}>
            <RrIcon name="thumb" size={15} /> {review.helpfulCount} found this helpful
          </button>
        ) : (
          <Link className="rr-link-btn" to="/login?next=/connect" title="Sign in to mark reviews as helpful"><RrIcon name="thumb" size={15} /> {review.helpfulCount} found this helpful</Link>
        )}
        <button type="button" className="rr-link-btn" onClick={share}><RrIcon name="share" size={15} /> {shared || "Share"}</button>
      </footer>
      {review.adminReply && (
        <div className="rr-reply">
          <div><strong>City Bike Tours team</strong><Stamp value={review.adminReplyAt} compact className="rr-when" /></div>
          <p>{review.adminReply}</p>
        </div>
      )}
    </article>
  );
}

// ─── The feed: filters, sorting, cards ───────────────────────────────────────
function Feed({ reviews, loaded, failed, isSignedIn, onVote }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const pills = useMemo(() => {
    const list = [{ id: "all", label: `All reviews (${reviews.length})` }];
    const withPhotos = reviews.filter((r) => r.photoUrl).length;
    if (withPhotos) list.push({ id: "photos", label: `With photos (${withPhotos})`, icon: true });
    for (const id of Object.keys(TOUR_LABELS)) {
      const n = reviews.filter((r) => r.tour === id).length;
      if (n) list.push({ id: `tour:${id}`, label: `${TOUR_LABELS[id]} (${n})` });
    }
    for (const site of SITES) {
      const n = reviews.filter((r) => r.stops?.includes(site.id)).length;
      if (n) list.push({ id: `stop:${site.id}`, label: `${site.name} (${n})` });
    }
    return list;
  }, [reviews]);

  const visible = useMemo(() => {
    const [kind, value] = filter.split(":");
    const filtered = reviews.filter((r) => kind === "all" || (kind === "photos" ? r.photoUrl : kind === "tour" ? r.tour === value : r.stops?.includes(value)));
    return sort === "top" ? [...filtered].sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt)) : filtered;
  }, [reviews, filter, sort]);

  useEffect(() => { if (!pills.some((pill) => pill.id === filter)) setFilter("all"); }, [pills, filter]);

  if (failed && !loaded) return <p className="rr-empty rr-plate rr-pad">Reviews couldn’t be loaded right now. Please try again in a moment.</p>;
  if (!loaded) return <p className="rr-empty rr-plate rr-pad">Loading reviews…</p>;
  if (!reviews.length) return <p className="rr-empty rr-plate rr-pad">No reviews yet. Ride with us and be the first to share your story.</p>;

  return (
    <section className="rr-feed" aria-label="Rider reviews">
      <div className="rr-filter-head">
        <span className="rr-label">Filter by experience</span>
        <label className="rr-sort"><RrIcon name="sort" size={14} /><span className="rr-sr">Sort reviews</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recent">Most recent</option><option value="top">Highest rated</option></select>
        </label>
      </div>
      <div className="rr-pills" role="group" aria-label="Filter reviews">
        {pills.map((pill) => (
          <button key={pill.id} type="button" aria-pressed={filter === pill.id} className={`rr-pill-btn ${filter === pill.id ? "is-on" : ""}`} onClick={() => setFilter(pill.id)}>
            {pill.icon && <RrIcon name="camera" size={13} />} {pill.label}
          </button>
        ))}
      </div>
      <div className="rr-cards" aria-live="polite">
        {visible.map((review) => <ReviewCard key={review.id} review={review} isSignedIn={isSignedIn} onVote={onVote} />)}
      </div>
    </section>
  );
}

// ─── Composer ────────────────────────────────────────────────────────────────
function Composer({ onSent }) {
  const { api, isSignedIn, user } = useCustomer();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tour, setTour] = useState("");
  const [origin, setOrigin] = useState("");
  const [headline, setHeadline] = useState("");
  const [showAvatar, setShowAvatar] = useState(false);
  const [stops, setStops] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [comment, setComment] = useState("");
  const [rideDate, setRideDate] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const toggle = (list, setList, value) => setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  async function submit(event) {
    event.preventDefault();
    if (!rating) { setError("Choose a star rating."); return; }
    setBusy(true); setError(""); setThanks("");
    try {
      const payload = { rating, comment, ...(rideDate && { rideDate }), ...(tour && { tour }), ...(origin.trim() && { riderOrigin: origin.trim() }), ...(headline.trim() && { headline: headline.trim() }), showAvatar, ...(stops.length && { stops }), ...(highlights.length && { highlights }) };
      let result;
      if (file) {
        const form = new FormData();
        form.append("data", JSON.stringify(payload));
        form.append("photo", await prepareImage(file));
        result = await api("/api/customer/reviews", { method: "POST", form });
      } else {
        result = await api("/api/customer/reviews", { method: "POST", body: payload });
      }
      setThanks(result.message || "Thanks! Your review will appear once the team approves it.");
      setRating(0); setTour(""); setOrigin(""); setHeadline(""); setShowAvatar(false); setStops([]); setHighlights([]); setComment(""); setRideDate(""); setFile(null);
      onSent();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  return (
    <section className="rr-plate-elevated rr-pad rr-composer" aria-labelledby="composer-heading">
      <div className="rr-composer-head">
        <span className="rr-label"><RrIcon name="star" size={14} /> Rider community voice</span>
        <h2 id="composer-heading">Rode with us recently? Leave a review</h2>
        <p className="rr-muted">Your words help other riders and help us keep Gaborone’s heritage alive.</p>
      </div>
      {!isSignedIn ? (
        <div className="rr-gate"><p>Sign in to post a review.</p><Link to="/login?next=/connect" className="rr-btn-primary">Sign in or create an account</Link></div>
      ) : (
        <form onSubmit={submit} className="rr-form">
          <p className="rr-muted">Posting as <strong>{user?.name}</strong></p>
          <div>
            <span className="rr-label">Your rating</span>
            <div className="rr-rate" onMouseLeave={() => setHover(0)}>
              <div className="rr-rate-stars" role="radiogroup" aria-label="Star rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} className={(hover || rating) >= n ? "on" : ""} onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => setRating(n)}>
                    <RrIcon name="star" size={28} />
                  </button>
                ))}
              </div>
              <span className="rr-rate-word">{rating || hover ? `${hover || rating}.0 (${RATING_WORDS[hover || rating]})` : "Tap a star"}</span>
            </div>
          </div>
          <label className="rr-field"><span className="rr-label">Which ride did you join?</span>
            <select value={tour} onChange={(event) => setTour(event.target.value)}><option value="">Choose a ride (optional)</option>{Object.entries(TOUR_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
          </label>
          <label className="rr-field"><span className="rr-label">Review title (optional)</span><input type="text" maxLength={80} value={headline} onChange={(event) => setHeadline(event.target.value)} placeholder="A short title for your review" /></label>
          <div className="rr-two">
            <label className="rr-field"><span className="rr-label">Where are you from?</span><input type="text" maxLength={80} value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Gaborone, or Visitor from…" /></label>
            <label className="rr-field"><span className="rr-label">Ride date</span><input type="date" max={new Date().toISOString().slice(0, 10)} value={rideDate} onChange={(event) => setRideDate(event.target.value)} /></label>
          </div>
          <label className="rr-toggle {showAvatar ? "is-on" : ""}" onClick={() => setShowAvatar(!showAvatar)} role="checkbox" aria-checked={showAvatar} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setShowAvatar(!showAvatar); } }}>Show my profile picture</label>
          <fieldset className="rr-field"><legend className="rr-label">Stops you loved (optional)</legend>
            <div className="rr-toggles">{SITES.map((site) => <button key={site.id} type="button" aria-pressed={stops.includes(site.id)} className={`rr-toggle ${stops.includes(site.id) ? "is-on" : ""}`} onClick={() => toggle(stops, setStops, site.id)}>{site.name}</button>)}</div>
          </fieldset>
          <fieldset className="rr-field"><legend className="rr-label">What stood out? (optional)</legend>
            <div className="rr-toggles">{HIGHLIGHTS.map((tag) => <button key={tag} type="button" aria-pressed={highlights.includes(tag)} className={`rr-toggle ${highlights.includes(tag) ? "is-on" : ""}`} onClick={() => toggle(highlights, setHighlights, tag)}>{tag}</button>)}</div>
          </fieldset>
          <label className="rr-field"><span className="rr-label">Your story and route impressions</span>
            <textarea rows={4} required minLength={5} maxLength={600} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Highlights of your ride, landmarks, bikes, guides…" />
            <small className="rr-count">{comment.length} / 600</small>
          </label>
          <div className="rr-attach">
            {preview ? <img src={preview} alt="Preview of your photo" /> : <RrIcon name="camera" size={26} />}
            <div>
              <p><strong>{file ? file.name : "Attach a photo (optional)"}</strong></p>
              <p className="rr-muted">JPG, PNG or WebP. Large photos are shrunk for you.</p>
            </div>
            {file ? <button type="button" className="rr-btn-ghost" onClick={() => setFile(null)}>Remove</button> : (
              <label className="rr-btn-ghost">Browse<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="rr-sr" onChange={(event) => { setFile(event.target.files?.[0] || null); setError(""); }} /></label>
            )}
          </div>
          <button type="submit" className="rr-btn-primary rr-submit" disabled={busy}><RrIcon name="send" size={18} /> {busy ? "Posting…" : "Post review"}</button>
          {error && <p role="alert" className="rr-error">{error}</p>}
          {thanks && <p role="status" className="rr-success">{thanks}</p>}
        </form>
      )}
    </section>
  );
}

function MyReviews({ reviews }) {
  if (!reviews?.length) return null;
  const STATUS = { pending: "Waiting for approval", approved: "Published", rejected: "Not published" };
  return (
    <section className="rr-plate rr-pad rr-mine" aria-label="Your reviews">
      <h3>Your reviews</h3>
      {reviews.map((r) => (
        <article key={r.id}>
          <div className="rr-mine-head"><StarRow value={r.rating} size={14} /><span className={`rr-status ${r.status}`}>{STATUS[r.status] || r.status}</span></div>
          <p>{r.comment}</p>
          <Stamp value={r.createdAt} className="rr-when" />
          {r.adminReply && <div className="rr-reply"><strong>Reply from City Bike Tours</strong><p>{r.adminReply}</p></div>}
        </article>
      ))}
    </section>
  );
}

// ─── Chat with the team ──────────────────────────────────────────────────────
function Messages() {
  const { api, isSignedIn, user } = useCustomer();
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkedAt, setCheckedAt] = useState(null);
  const listRef = useRef(null);
  const now = useNow(60000);

  const load = useCallback(async () => {
    try { setMessages((await api("/api/customer/messages")).messages); setCheckedAt(new Date()); setError(""); }
    catch (err) { setError(err.message); }
  }, [api]);
  usePolling(load, 20000, isSignedIn);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [messages?.length]);

  async function send(event) {
    event?.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true); setError("");
    try {
      const { message } = await api("/api/customer/messages", { method: "POST", body: { body: text } });
      setMessages((current) => [...(current || []), message]);
      setText("");
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  let lastDay = "";
  return (
    <section className="rr-plate rr-pad cx-panel" aria-labelledby="messages-heading">
      <header className="cx-panel-head">
        <span className="cx-team-avatar" aria-hidden="true">CB</span>
        <div><h2 id="messages-heading">Message the team</h2><p>{checkedAt ? `Checked ${formatTime(checkedAt)} · we reply right here` : "We reply right here on this page"}</p></div>
      </header>
      {!isSignedIn ? (
        <div className="rr-gate"><p>Sign in to send us a message.</p><Link to="/login?next=/connect" className="rr-btn-primary">Sign in or create an account</Link></div>
      ) : (
        <>
          <div ref={listRef} className="cx-chat" aria-live="polite">
            {!messages ? <p className="cx-muted">Loading your conversation…</p> : messages.length === 0 ? (
              <p className="cx-muted">No messages yet. Say hello, {user?.name?.split(" ")[0] || "rider"}!</p>
            ) : messages.map((m) => {
              const key = dayKey(m.createdAt);
              const divider = key !== lastDay ? <div className="cx-day"><span>{dayLabel(m.createdAt, now)}</span></div> : null;
              lastDay = key;
              return (
                <div key={m.id}>
                  {divider}
                  <div className={`cx-msg ${m.sender === "admin" ? "from-team" : "from-me"}`}>
                    <div className="cx-bubble">{m.body}</div>
                    <time className="cx-msg-time" dateTime={new Date(m.createdAt).toISOString()} title={formatDateTime(m.createdAt)}>{m.sender === "admin" ? "City Bike Tours · " : ""}{formatTime(m.createdAt)}</time>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={send} className="cx-composer">
            <label className="rr-sr" htmlFor="chat-input">Your message</label>
            <textarea id="chat-input" rows={2} maxLength={1500} value={text} placeholder="Write a message…" onChange={(event) => setText(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} />
            <button type="submit" className="cx-send" disabled={busy || !text.trim()} aria-label="Send message">{busy ? "…" : "➤"}</button>
          </form>
          {error && <p role="alert" className="cx-error">{error}</p>}
        </>
      )}
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function ConnectPage() {
  const { api, isSignedIn, signOut, user } = useCustomer();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [mine, setMine] = useState(null);

  const loadReviews = useCallback(async () => {
    try {
      const body = await api("/api/reviews");
      if (!Array.isArray(body?.reviews)) throw new Error("bad response");
      setReviews(body.reviews); setSummary(body.summary || null); setLoaded(true); setFailed(false);
    } catch { setFailed(true); }
  }, [api]);
  usePolling(loadReviews, 60000);

  const featuredReviews = useMemo(() => reviews.filter((r) => r.featured).slice(0, 3), [reviews]);
  const regularReviews = useMemo(() => reviews.filter((r) => !r.featured), [reviews]);

  const loadMine = useCallback(async () => {
    if (!isSignedIn) { setMine(null); return; }
    try { setMine((await api("/api/customer/reviews")).reviews); } catch { /* the composer reports problems */ }
  }, [api, isSignedIn]);
  usePolling(loadMine, 60000, isSignedIn);

  async function vote(review) {
    try {
      const result = await api(`/api/customer/reviews/${review.id}/helpful`, { method: "POST" });
      setReviews((current) => current.map((r) => (r.id === review.id ? { ...r, voted: result.helpful, helpfulCount: result.helpfulCount } : r)));
    } catch { /* leave the count as it was */ }
  }

  return (
    <main className="rr rr-bg rr-connect-page">
      <div className="rr-wrap rr-grid">
        <div className="rr-col-main">
          <section className="rr-hero">
            <span className="rr-pill">Community stories &amp; feedback</span>
            <h1>Stories from the <em>Saddle</em></h1>
            <p className="rr-muted">Read what riders say about our six historic stops in Gaborone, or share your own journey along the lanes and civic boulevards.</p>
            {isSignedIn && <p className="rr-muted">Signed in as <strong>{user?.name}</strong> · <button type="button" className="rr-inline" onClick={signOut}>Sign out</button></p>}
          </section>
          <ScoreCard summary={summary} />
          {featuredReviews.length > 0 && (
            <section className="rr-plate-elevated rr-pad" aria-label="Featured rider stories">
              <h2 style={{ color: "var(--rr-text)", fontSize: "1.5rem", fontWeight: 600, marginBottom: 1, letterSpacing: "-0.01em" }}>Featured stories</h2>
              <div className="rr-grid" style={{ gap: "1.4rem" }}>
                {featuredReviews.map((review) => (
                  <article key={review.id} className="rr-plate rr-pad rr-review" style={{ borderLeft: "4px solid var(--rr-gold)" }}>
                    {review.headline && <span className="rr-headline">{review.headline}</span>}
                    <div className="rr-review-who">
                      {review.avatarUrl ? (
                        <img className="rr-avatar" src={review.avatarUrl} alt={`${review.name}'s profile picture`} style={{ objectFit: "cover" }} />
                      ) : (
                        <div className="rr-avatar">{review.name.trim().split(/\s+/).map((part) => part[0]).join("").toUpperCase().slice(0, 2)}</div>
                      )}
                      <div>
                        <h3 className="rr-name">{review.name}{review.verified && <Verified />}</h3>
                        <p>{[review.verified && "Verified rider", review.riderOrigin].filter(Boolean).join(" · ") || "Rider"}</p>
                      </div>
                    </div>
                    <span className="rr-review-stars" role="img" aria-label={`${review.rating} out of 5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <RrIcon key={star} name="star" size={18} className={star <= review.rating ? "on" : "off"} filled={star <= review.rating} />
                      ))}
                    </span>
                    <p className="rr-comment">“{review.comment}”</p>
                    {review.photoUrl && (
                      <figure className="rr-photo">
                        <img src={review.photoUrl} alt={`Photo shared by ${review.name}`} loading="lazy" />
                      </figure>
                    )}
                    <footer className="rr-review-foot">
                      <span className="rr-when"><Stamp value={review.createdAt} compact /></span>
                      <span className="rr-tag">Featured</span>
                    </footer>
                    {review.adminReply && (
                      <div className="rr-reply">
                        <div><strong>City Bike Tours team</strong><Stamp value={review.adminReplyAt} compact className="rr-when" /></div>
                        <p>{review.adminReply}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}
          <Feed reviews={regularReviews} loaded={loaded} failed={failed} isSignedIn={isSignedIn} onVote={vote} />
        </div>
        <aside className="rr-col-side">
          <Composer onSent={() => { void loadMine(); void loadReviews(); }} />
          <MyReviews reviews={mine} />
          <Messages />
        </aside>
      </div>
      <Footer />
    </main>
  );
}
