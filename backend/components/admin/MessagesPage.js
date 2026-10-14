"use client";

import { useEffect, useState } from "react";
import { Badge, DataGate, Empty, Icon, PageTop, api, niceDate, niceTime, useDash, useRun, useToast } from "./ui";

const TEMPLATES = [
  ["Weather delay", "Weather update: today's ride may start later than planned. We'll message you again if anything changes."],
  ["Meeting point", "Reminder: please arrive 15 minutes early at the meeting point for bikes and helmets."],
  ["Ride cancelled", "We're sorry, today's ride has been cancelled. Reply to this message and we'll help you pick another date."],
];

function Compose() {
  const { data, can, refresh } = useDash();
  const toast = useToast();
  const [run, busy] = useRun();
  const [audience, setAudience] = useState("riders");
  const [date, setDate] = useState(data.today);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(null);
  const [waLinks, setWaLinks] = useState([]);

  useEffect(() => {
    let live = true;
    setCount(null);
    api("/api/admin/messages/broadcast", { method: "POST", body: { audience, rideDate: date, message: "preview only", dryRun: true } })
      .then((r) => live && setCount(r.count)).catch(() => live && setCount(0));
    return () => { live = false; };
  }, [date, audience]);

  async function send(e) {
    e.preventDefault();
    if (!window.confirm(audience === "subscribers" ? `Send this message to ${count} subscriber${count === 1 ? "" : "s"}?` : `Send this message to ${count} rider${count === 1 ? "" : "s"} booked for ${niceDate(date)}?`)) return;
    const res = await run(() => api("/api/admin/messages/broadcast", { method: "POST", body: { audience, rideDate: date, message } }, "Could not send the message."),
      (r) => {
        if (r.waLinks) setWaLinks(r.waLinks);
        return r.failed ? `Sent to ${r.sent} of ${r.total}. ${r.failed} didn't go through. Check the history below.` : `Sent to all ${r.total} riders.`;
      });
    if (res) { setMessage(""); refresh(); }
  }

  if (!can("messages:send")) return <p className="muted">Your Viewer role can read message history but not send messages.</p>;

  return (
    <form onSubmit={send} style={{ display: "grid", gap: 14 }}>
      <div className="tabs" style={{ justifySelf: "start" }} role="group" aria-label="Who to message">
        <button type="button" className="tab" aria-pressed={audience === "riders"} onClick={() => setAudience("riders")}>Riders on a date</button>
        <button type="button" className="tab" aria-pressed={audience === "subscribers"} onClick={() => setAudience("subscribers")}>Subscribers</button>
      </div>
      {audience === "riders" ? (
        <label className="field">Riders booked for
          <input className="input" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          <span className="hint">{count === null ? "Counting riders…" : count === 0 ? "No confirmed riders with a phone number on this date." : `${count} rider${count === 1 ? "" : "s"} will get this message.`}</span>
        </label>
      ) : (
        <p className="muted">{count === null ? "Counting subscribers…" : count === 0 ? "No subscribed people with a phone number yet." : `${count} subscriber${count === 1 ? "" : "s"} with a phone number will get this message. Only people who agreed to updates are included. Emails are not sent from here; export them from Inbox.`}</p>
      )}
      <div className="tabs" style={{ justifySelf: "start" }} role="group" aria-label="Message templates">
        {TEMPLATES.map(([label, text]) => <button type="button" key={label} className="tab" onClick={() => setMessage(text)}>{label}</button>)}
      </div>
      <label className="field">Message
        <textarea className="textarea" required minLength={5} maxLength={600} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write what riders need to know" />
        <span className="hint num">{message.length} / 600 · Sent as “City Bike Tours: …” on WhatsApp.</span>
      </label>
      <button className="btn btn-primary" type="submit" disabled={busy || !count || message.trim().length < 5} style={{ justifySelf: "start" }}><Icon name="send" size={15} /> Send to {count || 0} {audience === "subscribers" ? "subscriber" : "rider"}{count === 1 ? "" : "s"}</button>
      {waLinks.length > 0 && (
        <div style={{ marginTop: 16, padding: 12, background: "rgba(255,255,255,.04)", borderRadius: 10, border: "1px solid var(--line)" }}>
          <b>WhatsApp links to send manually:</b>
          <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
            {waLinks.slice(0, 10).map((link, i) => link.waLink && (
              <a key={i} className="btn btn-sm" href={link.waLink} target="_blank" rel="noreferrer" style={{ textAlign: "left" }}>
                <Icon name="send" size={13} /> {link.name} ({link.phone})
              </a>
            ))}
            {waLinks.length > 10 && <span className="muted">…and {waLinks.length - 10} more</span>}
          </div>
        </div>
      )}
    </form>
  );
}

function Body() {
  const { data } = useDash();
  const nameFor = (log) => (data.bookingRequests.find((r) => r.id === log.bookingRequestId) || data.bookings.find((b) => b.id === log.bookingId))?.name || log.recipient;
  return (
    <>
      <PageTop title="Messages">Message riders about a ride, and see what's been sent to them.</PageTop>
      <div className="adm-split">
        <div className="adm-card">
          <div className="adm-card-head"><h2>Message today's or an upcoming ride</h2></div>
          <Compose />
        </div>
        <div className="adm-card">
          <div className="adm-card-head"><h2>How it works</h2></div>
          <ul className="adm-list muted" style={{ fontSize: 13.5 }}>
            <li>Only riders with a confirmed booking on the chosen date are included.</li>
            <li>Ride passes are sent automatically when you confirm a booking. You don't need to message them here.</li>
            <li>Every send is recorded in the history below and in the audit log.</li>
          </ul>
        </div>
      </div>
      <div className="adm-card">
        <div className="adm-card-head"><div><h2>Delivery history</h2><div className="sub">Latest 100 messages</div></div></div>
        {data.messageLogs.length ? (
          <div className="adm-table-wrap">
            <table>
              <thead><tr><th>Rider</th><th>Type</th><th>Status</th><th>Sent</th></tr></thead>
              <tbody>
                {data.messageLogs.map((log) => (
                  <tr key={log.id}>
                    <td><span className="strong">{nameFor(log)}</span><small>{log.recipient}</small></td>
                    <td>{log.channel === "broadcast" ? "Ride update" : log.channel === "whatsapp" ? "Ride pass (WhatsApp)" : log.channel}</td>
                    <td><Badge status={log.status}>{log.status.toLowerCase()}</Badge></td>
                    <td>{niceTime(log.statusUpdatedAt || log.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Empty title="Nothing sent yet">Messages appear here as soon as one goes out.</Empty>}
      </div>
    </>
  );
}

export default function MessagesPage() {
  return <DataGate><Body /></DataGate>;
}
