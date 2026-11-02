"use client";

import { useState } from "react";

// A password box with a show / hide button inside it.
export default function PasswordInput({ className = "input", style, ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <span style={{ position: "relative", display: "block" }}>
      <input {...props} className={className} style={{ width: "100%", paddingRight: "3rem", ...style }} type={visible ? "text" : "password"} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        title={visible ? "Hide password" : "Show password"}
        style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "2.8rem", border: 0, background: "transparent", color: "inherit", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </span>
  );
}
