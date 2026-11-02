import { useNow } from "../hooks/useNow";
import { formatDateTime, timeAgo } from "../lib/time";

// "29 Oct 2026, 21:28 · 5 min ago" in Gaborone time, kept current while the page is open.
export default function Stamp({ value, className = "", compact = false }) {
  const now = useNow(30000);
  if (!value) return null;
  const iso = new Date(value).toISOString();
  return (
    <time className={`stamp ${className}`} dateTime={iso} title={formatDateTime(value)}>
      {compact ? timeAgo(value, now) : `${formatDateTime(value)} · ${timeAgo(value, now)}`}
    </time>
  );
}
