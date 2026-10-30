import { useEffect, useState } from "react";
import { Link } from "react-router";
import { backendUrl } from "../api/backend";
import Footer from "../components/Footer";
import Stamp from "../components/Stamp";

export default function MessageInboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const savedPhone = localStorage.getItem("cb_phone");
    if (savedPhone) setPhone(savedPhone);
  }, []);

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
      const res = await fetch(backendUrl(`/api/messages/inbox?phone=${encodeURIComponent(digits)}`), { cache: "no-store" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Could not load messages.");
      setMessages(result.messages || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    localStorage.setItem("cb_phone", value);
  };

  return (
    <main className="message-inbox-page">
      <div className="message-inbox-shell">
        <Link to="/" className="message-inbox-brand"><span>CB</span> City Bike Tours</Link>
        <section className="message-inbox-card">
          <h1>Your Messages</h1>
          <p className="message-inbox-sub">Enter your phone number to see messages from City Bike Tours.</p>
          <div className="message-inbox-phone-input">
            <label className="field" htmlFor="phone">Phone number
              <input id="phone" className="input" type="tel" value={phone} onChange={handlePhoneChange} placeholder="+267 7X XXX XXX" />
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
              {messages.map((msg, i) => (
                <li key={i} className="message-inbox-item">
                  <div className="message-inbox-header">
                    <span className="message-inbox-type">{msg.type === "broadcast" ? "Ride update" : msg.type === "whatsapp" ? "Ride pass" : msg.type}</span>
                    <span className="message-inbox-date"><Stamp value={msg.sentAt} /></span>
                  </div>
                  <div className="message-inbox-body">{msg.message}</div>
                  {msg.link && (
                    <div className="message-inbox-link">
                      <a href={msg.link} target="_blank" rel="noreferrer">View ride pass →</a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
        <Footer />
      </div>
    </main>
  );
}