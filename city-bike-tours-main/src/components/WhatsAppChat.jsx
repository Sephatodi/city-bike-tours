import { useState } from "react";
import Icon from "./Icon";

export default function WhatsAppChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="whatsapp-chat" style={{
      position: "fixed",
      bottom: "20px",
      left: "20px",
      zIndex: 1000,
      fontFamily: "Outfit, sans-serif",
    }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          backgroundColor: "#25D366",
          color: "#fff",
          border: "none",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: "28px",
          boxShadow: "0 4px 12px rgba(37, 211, 102, 0.4)",
          transition: "transform 0.2s",
        }}
      >
        <Icon name="phone" size={26} />
      </button>
      {open && (
        <div style={{
          position: "absolute",
          bottom: "70px",
          left: 0,
          backgroundColor: "#0D0805",
          border: "1px solid rgba(245,237,217,0.2)",
          borderRadius: "8px",
          padding: "1rem",
          minWidth: "260px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div style={{
              width: "36px", height: "36px", backgroundColor: "#25D366",
              borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon name="phone" size={18} style={{ color: "#fff" }} />
            </div>
            <div>
              <div style={{ color: "#F5EDD9", fontWeight: 700, fontSize: "0.9rem" }}>City Bike Tours</div>
              <div style={{ color: "rgba(245,237,217,0.6)", fontSize: "0.75rem" }}>Care to chat?</div>
            </div>
          </div>
          <p style={{ color: "rgba(245,237,217,0.7)", fontSize: "0.85rem", marginBottom: "0.75rem", lineHeight: 1.5 }}>
            Have questions about our rides, booking, or heritage trail? Message us on WhatsApp and we'll get back to you shortly.
          </p>
          <a
            href="https://wa.me/2677XXXXXXX"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#25D366",
              color: "#fff",
              textDecoration: "none",
              padding: "0.6rem 1rem",
              borderRadius: "4px",
              fontWeight: 700,
              fontSize: "0.875rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            <span>Chat on WhatsApp</span>
            <Icon name="externalLink" size={14} style={{ color: "#fff" }} />
          </a>
        </div>
      )}
    </div>
  );
}
