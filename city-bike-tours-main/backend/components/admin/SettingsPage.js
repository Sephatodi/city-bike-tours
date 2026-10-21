"use client";

import { useEffect, useState } from "react";
import { Icon, PageTop, Skeleton, api, useDash, useRun } from "./ui";

const Count = ({ value, max }) => <span className="hint num">{value.length} / {max}</span>;

export default function SettingsPage() {
  const { can, refresh } = useDash();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [run, busy] = useRun();
  const write = can("settings:write");

  useEffect(() => {
    api("/api/admin/settings", {}, "Could not load settings.").then((r) => { setSaved(r.settings); setForm(r.settings); }).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>;
  if (!form) return <Skeleton h={400} />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const dirty = Object.keys(form).some((k) => form[k] !== saved[k]);
  const open = form.bookingsOpen === "true";

  async function save(e) {
    e.preventDefault();
    const changes = Object.fromEntries(Object.keys(form).filter((k) => form[k] !== saved[k]).map((k) => [k, form[k]]));
    const res = await run(() => api("/api/admin/settings", { method: "PUT", body: changes }, "Could not save settings."), "Settings saved.");
    if (res) { setSaved(res.settings); setForm(res.settings); refresh(); }
  }

  return (
    <form onSubmit={save}>
      <PageTop title="Site settings" actions={write && <button className="btn btn-primary" type="submit" disabled={busy || !dirty}>Save changes</button>}>
        Details shown on your website, and the rules for taking bookings.
      </PageTop>
      <fieldset disabled={!write} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 16, minWidth: 0 }}>
        <div className="adm-card">
          <div className="adm-card-head"><h2>Bookings</h2></div>
          <div className="adm-switch">
            <div><b>Accept online booking requests</b><small>Turn off to pause the booking form. Visitors are asked to call or message you instead.</small></div>
            <button type="button" className="adm-toggle" role="switch" aria-checked={open} aria-label="Accept online booking requests" onClick={() => setForm((f) => ({ ...f, bookingsOpen: open ? "false" : "true" }))} />
          </div>
          <div className="adm-switch" style={{ alignItems: "flex-end" }}>
            <div><b>Riders per day</b><small>The most riders you take across all routes on one date.</small></div>
            <input className="input num" style={{ width: 100 }} type="number" min="1" max="500" value={form.dailyCapacity} onChange={set("dailyCapacity")} aria-label="Riders per day" />
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h2>Business details</h2></div>
          <div className="adm-form-grid">
            <label className="field">Business name<input className="input" required maxLength={80} value={form.siteName} onChange={set("siteName")} /></label>
            <label className="field">Tagline<input className="input" maxLength={160} value={form.tagline} onChange={set("tagline")} /></label>
            <label className="field">Contact phone<input className="input" maxLength={30} value={form.contactPhone} onChange={set("contactPhone")} placeholder="+267…" /></label>
            <label className="field">Contact email<input className="input" type="email" maxLength={120} value={form.contactEmail} onChange={set("contactEmail")} /></label>
            <label className="field">Meeting point<input className="input" maxLength={120} value={form.meetupName} onChange={set("meetupName")} /></label>
            <label className="field">Meeting point note<input className="input" maxLength={160} value={form.meetupNote} onChange={set("meetupNote")} /></label>
            <label className="field">Website language<input className="input" maxLength={10} value={form.language} onChange={set("language")} placeholder="en" /><span className="hint">Language code, for example en or tn</span></label>
            <label className="field">Time zone<input className="input" value="Africa/Gaborone (fixed)" disabled /></label>
            <label className="field wide">Arrival note<input className="input" maxLength={200} value={form.arriveEarlyNote} onChange={set("arriveEarlyNote")} /></label>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h2>Announcement banner</h2></div>
          <label className="field">Message for visitors<textarea className="textarea" rows={2} maxLength={300} value={form.announcement} onChange={set("announcement")} placeholder="e.g. Rides are paused on 25 December" /><Count value={form.announcement} max={300} /></label>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h2>Look and search</h2></div>
          <div className="adm-form-grid">
            <label className="field">Logo link<input className="input" type="url" maxLength={2000} value={form.logoUrl} onChange={set("logoUrl")} placeholder="https://" /></label>
            <label className="field">Accent colour<input className="input" type="color" value={form.accentColor} onChange={set("accentColor")} /></label>
            <label className="field wide">Search title<input className="input" maxLength={70} value={form.seoTitle} onChange={set("seoTitle")} /><Count value={form.seoTitle} max={70} /></label>
            <label className="field wide">Search description<textarea className="textarea" rows={2} maxLength={170} value={form.seoDescription} onChange={set("seoDescription")} /><Count value={form.seoDescription} max={170} /></label>
          </div>
        </div>
      </fieldset>
      {!write && <p className="muted" style={{ marginTop: 16 }}>Only admins can change settings.</p>}

      {can("export:read") && (
        <div className="adm-card" style={{ marginTop: 16 }}>
          <div className="adm-card-head"><div><h2>Export your data</h2><div className="sub">Download a spreadsheet (CSV) of your records. Each download is recorded in the audit log.</div></div></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["booking-requests", "Website requests"], ["account-bookings", "Account bookings"], ["users", "Users"], ["content", "Content"], ["subscribers", "Subscribers"], ["enquiries", "Enquiries"], ["reviews", "Reviews"], ["audit", "Audit log"]].map(([type, label]) => (
              <a key={type} className="btn" href={`/api/admin/export?type=${type}`}><Icon name="download" size={15} /> {label}</a>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>For a full backup you can restore from, use System & backups.</p>
        </div>
      )}
    </form>
  );
}
