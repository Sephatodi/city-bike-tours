import { useState } from "react";

const Eye = ({ off }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

// A password box with a button inside it that shows or hides what was typed.
export default function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="pw-wrap">
      <input {...props} className={className} type={visible ? "text" : "password"} />
      <button type="button" className="pw-toggle" onClick={() => setVisible((current) => !current)} aria-label={visible ? "Hide password" : "Show password"} aria-pressed={visible} title={visible ? "Hide password" : "Show password"}>
        <Eye off={visible} />
      </button>
    </span>
  );
}
