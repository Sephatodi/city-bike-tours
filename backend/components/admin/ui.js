"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

/* ── icons (24px stroke set) ─────────────────────────────── */
const PATHS = {
  dashboard: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM20 14v3M14 20h3M20 20v1",
  route: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7",
  image: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 16l-5-5L5 21",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  message: "M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  plus: "M12 5v14M5 12h14",
  check: "M20 6 9 17l-5-5",
  x: "M18 6 6 18M6 6l12 12",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  menu: "M3 6h18M3 12h18M3 18h18",
  bike: "M5.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM18.5 21a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM15 6h3l-3.5 8H8l3-8h4zM12 14l-3.5 0",
  star: "M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z",
  trash: "M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  edit: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  eyeoff: "M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22",
  copy: "M9 9h11a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v1",
  refresh: "M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
  alert: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  money: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  key: "M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4",
  lock: "M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4",
  send: "M22 2 11 13M22 2l-7 20-4-9-9-4z",
  video: "M23 7l-7 5 7 5zM3 5h11a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  chart: "M3 3v18h18M7 15l4-4 3 3 5-6",
  inbox: "M22 12h-6l-2 3h-4l-2-3H2M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z",
  server: "M2 4h20v6H2zM2 14h20v6H2zM6 7h.01M6 17h.01",
  plug: "M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
  upload: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  database: "M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3zM21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5",
  chevron: "M6 9l6 6 6-6",
  arrow: "M5 12h14M12 5l7 7-7 7",
  sparkle: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
};

export function Icon({ name, size = 18, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={PATHS[name] || PATHS.dashboard} />
    </svg>
  );
}

/* ── api ─────────────────────────────────────────────────── */
export async function api(url, { method = "GET", body, form } = {}, fallback = "Something went wrong. Try again.") {
  const response = await fetch(url, {
    method,
    cache: "no-store",
    ...(form ? { body: form } : body !== undefined ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || fallback);
  if (!result) throw new Error(fallback);
  return result;
}

/* ── formatting ──────────────────────────────────────────── */
export const money = (n) => `P${Number(n || 0).toLocaleString("en-BW", { maximumFractionDigits: 0 })}`;

export function niceDate(iso, opts = { weekday: "short", day: "numeric", month: "short" }) {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
}

export function niceTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Gaborone" });
}

export function ago(value) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days < 8 ? `${days} d ago` : niceTime(value);
}

export const monthLabel = (ym, long = false) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: long ? "long" : "short", timeZone: "UTC" });

export const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "?";

/* ── status badges ───────────────────────────────────────── */
const STATUS_TONE = {
  pending: "warn", confirmed: "good", declined: "bad", cancelled: "bad", active: "good", suspended: "bad",
  SENT: "good", DELIVERED: "good", READ: "good", QUEUED: "warn", SENDING: "warn", FAILED: "bad", UNDELIVERED: "bad",
  admin: "violet", editor: "teal", viewer: "neutral", customer: "neutral",
};
export function Badge({ children, tone, status }) {
  const t = tone || STATUS_TONE[status ?? children] || "neutral";
  return <span className={`badge ${t}`}>{children}</span>;
}

export function Empty({ title, children }) {
  return <div className="adm-empty"><b>{title}</b>{children}</div>;
}

export function Skeleton({ h = 120 }) {
  return <div className="adm-skel" style={{ height: h }} />;
}

/* ── toasts ──────────────────────────────────────────────── */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, kind = "ok") => {
    const id = Math.random().toString(36).slice(2);
    setItems((list) => [...list, { id, message, kind }]);
    setTimeout(() => setItems((list) => list.filter((t) => t.id !== id)), kind === "error" ? 7000 : 4200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="adm-toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`adm-toast ${t.kind}`} role={t.kind === "error" ? "alert" : "status"}>
            <Icon name={t.kind === "error" ? "alert" : "check"} size={16} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ── modal ───────────────────────────────────────────────── */
export function Modal({ title, lead, onClose, children, footer, width }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    ref.current?.querySelector("input, select, textarea, button")?.focus();
    return () => { document.removeEventListener("keydown", onKey); previous?.focus?.(); };
  }, [onClose]);
  return (
    <div className="adm-modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal" role="dialog" aria-modal="true" aria-label={title} ref={ref} style={width ? { width } : undefined}>
        <h2>{title}</h2>
        {lead && <p className="lead">{lead}</p>}
        {children}
        {footer && <div className="adm-modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function useCopy() {
  const toast = useToast();
  return async (text, label = "Copied.") => {
    try { await navigator.clipboard.writeText(text); toast(label); } catch { toast("Couldn't copy. Select the text and copy it manually.", "error"); }
  };
}

/* ── shared dashboard data ───────────────────────────────── */
const DataCtx = createContext(null);
export const useDash = () => useContext(DataCtx);

export function DashProvider({ staff, can, children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setData(await api("/api/admin/dashboard-summary", {}, "Could not load dashboard data."));
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return <DataCtx.Provider value={{ staff, can, data, error, loading, refresh }}>{children}</DataCtx.Provider>;
}

export function useRun() {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(async (fn, success) => {
    setBusy(true);
    try {
      const result = await fn();
      if (success) toast(typeof success === "function" ? success(result) : success);
      return result;
    } catch (e) {
      toast(e.message || "Something went wrong.", "error");
      return null;
    } finally {
      setBusy(false);
    }
  }, [toast]);
  return [run, busy];
}

export function PageTop({ title, children, actions }) {
  return (
    <div className="adm-top">
      <div><h1>{title}</h1>{children && <p>{children}</p>}</div>
      {actions && <div className="adm-top-actions">{actions}</div>}
    </div>
  );
}

export function DataGate({ children }) {
  const { data, error, loading, refresh } = useDash();
  if (loading) return <div className="adm-stack"><Skeleton h={110} /><Skeleton h={320} /></div>;
  if (!data) {
    return (
      <div className="adm-alert bad" role="alert">
        <Icon name="alert" />
        <div>
          <b>{error || "Dashboard data is unavailable."}</b>
          <div className="muted">Check the database connection, then try again.</div>
          <button className="btn btn-sm" style={{ marginTop: 10 }} onClick={refresh}><Icon name="refresh" size={14} /> Try again</button>
        </div>
      </div>
    );
  }
  return children;
}
