"use client";

import { useEffect, useMemo, useState } from "react";
import { useBookingActions, unifyBookings } from "./booking-actions";
import { Badge, DataGate, Empty, Icon, Modal, PageTop, api, niceDate, niceTime, useCopy, useDash, useToast } from "./ui";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "closed", label: "Declined or cancelled" },
];

// QR + link + a free WhatsApp click-to-chat button. Staff press Send in WhatsApp themselves, so no Twilio is needed.
function RidePass({ row, onAuto, busy }) {
  const copy = useCopy();
  const [pass, setPass] = useState(null);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const toast = useToast();
  
  const fetchPass = async () => {
    setPass(null); setError("");
    try {
      const r = await api(`/api/admin/ride-pass?type=${row.source === "account" ? "booking" : "request"}&id=${encodeURIComponent(row.id)}`, {}, "Could not load the ride pass.");
      setPass(r);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    fetchPass();
  }, [row.id, row.source, fetchKey]);

  if (error) return <p className="muted">{error}</p>;
  if (!pass) return <p className="muted">Loading ride pass…</p>;

  // Botswana E.164 normalization: strip non-digits, prepend 267 for local 8-digit numbers starting with 7
  const normalizePhone = (raw) => {
    let digits = (raw || "").replace(/\D/g, "");
    if (digits.length === 8 && digits.startsWith("7")) digits = "267" + digits;
    return digits;
  };
  const digits = normalizePhone(row.phone);
  const message =
    `Hi ${row.name}! 🚲 Your City Bike Tours booking is confirmed.\n\n` +
    `📅 ${niceDate(row.date, { weekday: "long", day: "numeric", month: "long" })}${row.time ? ` at ${row.time}` : ""}\n` +
    `🚴 ${row.route}\n👥 ${row.riders} rider${row.riders === 1 ? "" : "s"}\n\n` +
    `🎟️ Your ride pass. Show the QR code when you arrive:\n${pass.ticketUrl}\n\n` +
    `(QR code attached separately)`;

  const downloadQr = () => {
    const link = document.createElement("a");
    link.href = pass.qr;
    link.download = `ride-pass-${row.name.replace(/\s+/g, "-")}.png`;
    link.click();
  };

  const resendPass = async () => {
    setResending(true);
    try {
      await api(`/api/admin/booking-requests/${row.id}`, { method: "PATCH", body: { status: "confirmed", resendConfirmation: true } }, "Could not resend the ride pass.");
      // Refresh pass data to get updated waLink/QR
      await fetchPass();
      toast("Ride pass refreshed. Use the buttons below to send, copy, or download.");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 18, padding: 14, borderRadius: 12, background: "rgba(255,255,255,.04)", border: "1px solid var(--line)" }}>
      <img src={pass.qr} alt={`Ride pass QR code for ${row.name}`} width={120} height={120} style={{ background: "#fff", padding: 6, borderRadius: 10 }} />
      <div style={{ display: "grid", gap: 8 }}>
        <b>Ride pass</b>
        {digits
          ? <a className="btn btn-primary btn-sm" href={`https://wa.me/${digits}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer"><Icon name="send" size={13} /> Send via WhatsApp</a>
          : <span className="muted">No phone number on file.</span>}
        <button className="btn btn-sm" onClick={() => copy(pass.ticketUrl, "Pass link copied.")}><Icon name="copy" size={13} /> Copy link</button>
        <button className="btn btn-sm" onClick={downloadQr}><Icon name="download" size={13} /> Download QR</button>
        {row.source === "request" && row.status === "confirmed" && (
          <>
            <button className="btn btn-sm" onClick={resendPass} disabled={resending}>
              {resending ? "Resending…" : "Resend pass"}
            </button>
            {pass.messagingConfigured && (
              <button className="btn btn-sm" disabled={busy} onClick={onAuto}>Send automatically (Twilio)</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Body() {
  const { data, can } = useDash();
  const { setStatus, checkIn, busy } = useBookingActions();
  const [tab, setTab] = useState("all");
  const [when, setWhen] = useState("upcoming");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("q")) { setQ(params.get("q")); setWhen("all"); }
    if (TABS.some((t) => t.id === params.get("status"))) { setTab(params.get("status")); setWhen("all"); }
  }, []);

  const all = useMemo(() => unifyBookings(data), [data]);
  const counts = useMemo(() => ({
    all: all.length,
    pending: all.filter((b) => b.status === "pending").length,
    confirmed: all.filter((b) => b.status === "confirmed").length,
    closed: all.filter((b) => ["declined", "cancelled"].includes(b.status)).length,
  }), [all]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const filtered = all.filter((b) => {
      if (tab === "closed" ? !["declined", "cancelled"].includes(b.status) : tab !== "all" && b.status !== tab) return false;
      if (when === "upcoming" && b.date < data.today) return false;
      if (when === "past" && b.date >= data.today) return false;
      if (term && ![b.name, b.phone, b.email, b.id, b.route].some((v) => String(v || "").toLowerCase().includes(term))) return false;
      return true;
    });
    return filtered.sort((a, b) => (when === "past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)) || (a.status === "pending" ? -1 : 1));
  }, [all, tab, when, q, data.today]);

  const current = open && all.find((b) => b.key === open);
  const write = can("bookings:write");

  function Actions({ b, compact }) {
    const sz = compact ? "btn btn-sm" : "btn";
    return (
      <div className="row-actions">
        {b.status === "pending" && <>
          <button className={`${sz} btn-primary`} disabled={busy} onClick={async (e) => { e.stopPropagation(); const r = await setStatus(b, "confirmed"); if (r) setOpen(b.key); }}>Confirm</button>
          <button className={sz} disabled={busy} onClick={(e) => { e.stopPropagation(); setStatus(b, "declined"); }}>Decline</button>
        </>}
        {b.status === "confirmed" && <>
          {b.source === "request" && <button className={sz} disabled={busy} onClick={(e) => { e.stopPropagation(); setOpen(b.key); }}>Resend pass</button>}
          <button className={`${sz} btn-danger`} disabled={busy} onClick={(e) => { e.stopPropagation(); if (window.confirm(`Cancel ${b.name}'s booking? They'll be told by message.`)) setStatus(b, "cancelled"); }}>Cancel</button>
        </>}
      </div>
    );
  }

  return (
    <>
      <PageTop
        title="Bookings"
        actions={can("export:read") && <>
          <a className="btn" href="/api/admin/export?type=booking-requests"><Icon name="download" size={16} /> Website requests (CSV)</a>
          <a className="btn" href="/api/admin/export?type=account-bookings"><Icon name="download" size={16} /> Account bookings (CSV)</a>
        </>}
      >
        Website requests and account bookings in one list. Confirming a request sends the rider their ride pass on WhatsApp.
      </PageTop>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="tabs" role="group" aria-label="Filter by status">
            {TABS.map((t) => (
              <button key={t.id} className="tab" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>{t.label} <span className="n num">{counts[t.id]}</span></button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select className="select" style={{ width: 176 }} value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Ride date">
              <option value="upcoming">Today and later</option>
              <option value="past">Past rides</option>
              <option value="all">Any date</option>
            </select>
            <input className="input" placeholder="Search name, phone or ref" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search bookings" />
          </div>
        </div>

        {rows.length ? (
          <div className="adm-table-wrap">
            <table>
              <thead><tr><th>Rider</th><th>Ride</th><th>Date</th><th>Riders</th><th>Status</th>{write && <th aria-label="Actions" />}</tr></thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.key} className="click" onClick={() => setOpen(b.key)}>
                    <td><span className="strong">{b.name}</span><small>{b.phone || b.email || "No contact"}</small></td>
                    <td>{b.route}<small>{b.source === "account" ? "Account booking" : "Website request"}</small></td>
                    <td className="num">{niceDate(b.date)}{b.time && <small>{b.time}</small>}</td>
                    <td className="num">{b.riders}</td>
                    <td><Badge status={b.status}>{b.status}</Badge>{b.checkedInAt && <small>Checked in</small>}</td>
                    {write && <td><Actions b={b} compact /></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title="No bookings match">{q ? "Try a different name or number." : "Change the filters above to see more."}</Empty>}
      </div>

      {current && (
        <Modal title={current.name} lead={`${current.route} · ${niceDate(current.date, { weekday: "long", day: "numeric", month: "long" })}`} onClose={() => setOpen(null)}
          footer={<>
            {write && current.status === "confirmed" && current.date === data.today && !current.checkedInAt && can("checkin:write") && (
              <button className="btn btn-primary" disabled={busy} onClick={async () => { await checkIn(current); }}>Check in now</button>
            )}
            <button className="btn" onClick={() => setOpen(null)}>Close</button>
          </>}>
          <dl className="adm-kv">
            <dt>Status</dt><dd><Badge status={current.status}>{current.status}</Badge></dd>
            <dt>Riders</dt><dd className="num">{current.riders}</dd>
            {current.time && <><dt>Start time</dt><dd>{current.time}</dd></>}
            <dt>Phone</dt>
            <dd>{current.phone ? <>
              {current.phone} <a className="muted" href={`tel:${current.phone}`}>· Call</a>{" "}
              <a className="muted" href={`https://wa.me/${current.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">· WhatsApp</a>
            </> : "—"}</dd>
            {current.email && <><dt>Email</dt><dd>{current.email}</dd></>}
            {current.price != null && <><dt>Price</dt><dd className="num">P{Number(current.price)}</dd></>}
            <dt>Notes</dt><dd>{current.notes || "—"}</dd>
            <dt>Reference</dt><dd className="num">{current.id.slice(0, 8).toUpperCase()}</dd>
            {current.createdAt && <><dt>Requested</dt><dd>{niceTime(current.createdAt)}</dd></>}
            <dt>Checked in</dt><dd>{current.checkedInAt ? niceTime(current.checkedInAt) : "Not yet"}</dd>
          </dl>
          {current.status === "confirmed" && <RidePass row={current} busy={busy} onAuto={() => setStatus(current, "confirmed", true)} />}
          {write && current.status === "pending" && <div style={{ marginTop: 18 }}><Actions b={current} /></div>}
        </Modal>
      )}
    </>
  );
}

export default function Bookings() {
  return <DataGate><Body /></DataGate>;
}
