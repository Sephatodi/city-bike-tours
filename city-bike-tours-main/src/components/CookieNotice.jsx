import { useEffect, useState } from "react";
import { Link } from "react-router";

const COOKIE = "cbt_notice=1";
const MAX_AGE = 31536000;

function hasNoticeCookie() {
  try { return document.cookie.split(";").some((c) => c.trim().startsWith("cbt_notice=")); } catch { return true; }
}
function setNoticeCookie() {
  try {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
  } catch {}
}

export default function CookieNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => { if (!hasNoticeCookie()) setShow(true); }, []);
  if (!show) return null;
  return (
    <div role="region" aria-label="Cookie notice" style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 80, maxWidth: 980, margin: "0 auto", background: "rgba(16,42,28,0.98)", color: "#F5EDD9", border: "1px solid rgba(212,160,23,0.35)", borderRadius: 8, padding: "0.9rem 1rem", boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }}>
      <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.5 }}>
        We use only essential cookies. A sign-in cookie is set when you sign in to book (kept 30 days). Our staff use a separate secure admin cookie. This notice is remembered for a year. We don't use advertising or tracking cookies, and page views are counted without cookies.
      </p>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
        <button type="button" onClick={() => { setNoticeCookie(); setShow(false); }} style={{ background: "#C1440E", color: "#F5EDD9", border: 0, padding: "0.55rem 0.9rem", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Got it</button>
        <Link to="/privacy" style={{ color: "#D4A017", alignSelf: "center" }}>Privacy policy</Link>
      </div>
    </div>
  );
}
