import Stamp from "../components/Stamp";
import { useState } from "react";
import { Link } from "react-router";
import { backendUrl } from "../api/backend";
import Footer from "../components/Footer";

export default function MessageInboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  const normalizePhone = (raw) => {
    let digits = (raw || "").replace(/\D/g, "");
    if (digits.length === 8 && digits.startsWith("7")) digits = "267" + digits;
    return digits;
  };

  const fetchMessages = async () => {
    const digits = normalizePhone(phone);
    if (!digits) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(backendUrl(`/api/messages/inbox?phone=${encodeURIComponent(digits)}`), { cache: "no-store", credentials: "include" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Could not load messages.");
      setMessages(result.messages || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="rr rr-bg message-inbox-page">
      <div className="rr-wrap message-inbox-shell">
        <Link to="/" className="message-inbox-brand"><span>CB</span> City Bike Tours</Link>
        <section className="rr-plate rr-pad message-inbox-card">
          <h1>Your Messages</h1>
          <p className="message-inbox-sub">Enter your phone number to see messages from City Bike Tours.</p>
          <div className="message-inbox-phone-input">
            <label className="field" htmlFor="phone">Phone number
              <input id="phone" className="input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+267 7X XXX XXX" />
            </label>
            <button className="btn btn-primary" onClick={fetchMessages} disabled={loading}>
              {loading ? "Loading…" : "View messages"}
            </button>
          </div>
          {error && <div className="message-inbox-error" role="alert">{error}</div>}
          {phone && !loading && messages.length === 0 && !error && (
            <div className="message-inbox-empty">No messages found for this number.</div>
          )}
          {messages.length > 0 && (
            <ul className="message-inbox-list">
              {messages.map((m) => (
                <li key={m.id} className="message-inbox-item">
                  <div className="message-inbox-meta"><Stamp value={m.createdAt} /></div>
                  <div className="message-inbox-body">{m.body}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
