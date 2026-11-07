import { useEffect, useState } from "react";

export default function CookiesPopup() {
  const [accepted, setAccepted] = useState(() => {
    try { return localStorage.getItem("cb_cookies_accepted") === "1"; } catch { return false; }
  });

  useEffect(() => {
    if (accepted) {
      try { localStorage.setItem("cb_cookies_accepted", "1"); } catch {}
    }
  }, [accepted]);

  if (accepted) return null;

  return (
    <div className="cookies-popup" style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 10000,
      backgroundColor: "#0D0805",
      borderTop: "1px solid rgba(245,237,217,0.2)",
      padding: "1.5rem 1rem",
      color: "#F5EDD9",
      fontFamily: "Outfit, sans-serif",
    }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#E8DFCC", opacity: 0.9 }}>
            We use cookies to improve your experience on City Bike Tours. By continuing, you accept our use of cookies.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              onClick={() => setAccepted(true)}
              className="cookie-accept"
              style={{
                backgroundColor: "#D4A017",
                color: "#0D0805",
                border: "none",
                padding: "0.6rem 1.25rem",
                borderRadius: "2px",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "opacity 0.2s",
              }}
            >
              Accept
            </button>
            <button
              onClick={() => setAccepted(true)}
              style={{
                background: "transparent",
                color: "rgba(245,237,217,0.6)",
                border: "1px solid rgba(245,237,217,0.3)",
                padding: "0.6rem 1rem",
                borderRadius: "2px",
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
