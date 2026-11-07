"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Icon, PageTop, Skeleton, api, useDash, useRun } from "./ui";

const Count = ({ value = "", max }) => <span className="hint num">{(value || "").length} / {max}</span>;

function Section({ title, sub, children }) {
  return (
    <div className="adm-card">
      <div className="adm-card-head"><div><h2>{title}</h2>{sub && <div className="sub">{sub}</div>}</div></div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { can, staff } = useDash();
  const [run, busy] = useRun();
  const [error, setError] = useState("");

  // personal profile
  const [profile, setProfile] = useState(null);
  const [pform, setPform] = useState({ name: "", phone: "" });
  // password
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  // site settings (admins)
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    api("/api/admin/users/me/profile", {}, "Could not load your profile.")
      .then((r) => { setProfile(r.user); setPform({ name: r.user?.name || "", phone: r.user?.phone || "" }); })
      .catch((e) => setError(e.message));
    if (can("settings:read")) {
      api("/api/admin/settings", {}, "Could not load site settings.").then((r) => { setSaved(r.settings); setForm(r.settings); }).catch(() => {});
    }
  }, [can]);

  if (error) return <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>;
  if (!profile) return <Skeleton h={400} />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const dirtySite = form && saved ? Object.keys(form).some((k) => form[k] !== saved[k]) : false;
  const open = form?.bookingsOpen === "true";

  async function saveProfile(e) {
    e.preventDefault();
    const res = await run(() => api("/api/admin/users/me/profile", { method: "PATCH", body: pform }, "Could not save profile."), "Profile updated.");
    if (res?.user) setProfile(res.user);
  }
  async function changePassword(e) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return window.alert("New passwords do not match.");
    if (pw.newPassword.length < 12) return window.alert("Use at least 12 characters for the new password.");
    const res = await run(() => api("/api/admin/users/me/password", { method: "POST", body: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } }, "Could not change password."), "Password changed.");
    if (res) setPw({ currentPassword: "", newPassword: "", confirm: "" });
  }
  async function saveSite(e) {
    e.preventDefault();
    if (!form || !saved) return;
    const changes = Object.fromEntries(Object.keys(form).filter((k) => form[k] !== saved[k]).map((k) => [k, form[k]]));
    const res = await run(() => api("/api/admin/settings", { method: "PUT", body: changes }, "Could not save site settings."), "Site settings saved.");
    if (res) { setSaved(res.settings); setForm(res.settings); }
  }
  async function doSignOut() {
    try { await fetch("/api/admin/users/me/signout", { method: "POST" }); } catch {}
    signOut({ callbackUrl: "/admin/login" });
  }

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const tz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  const lang = typeof navigator !== "undefined" ? navigator.language : "";

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageTop title="Settings">Your account, security, and (for admins) site settings.</PageTop>

      <Section title="Profile" sub="Personal information for your staff account.">
        <form onSubmit={saveProfile} className="adm-form-grid">
          <label className="field">Full name<input className="input" required maxLength={120} value={pform.name} onChange={(e) => setPform((f) => ({ ...f, name: e.target.value }))} /></label>
          <label className="field">Email<input className="input" value={profile.email || ""} disabled /></label>
          <label className="field">Phone<input className="input" maxLength={30} value={pform.phone} onChange={(e) => setPform((f) => ({ ...f, phone: e.target.value }))} placeholder="+267…" /></label>
          <label className="field">Role<input className="input" value={profile.role || staff?.role || ""} disabled /></label>
          <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-primary" type="submit" disabled={busy}>Save profile</button></div>
        </form>
      </Section>

      <Section title="Password" sub={profile.provider !== "credentials" ? `This account signs in with ${profile.provider}; password change is not available here.` : "Change your password. Use at least 12 characters."}>
        {profile.provider === "credentials" && (
          <form onSubmit={changePassword} className="adm-form-grid">
            <label className="field wide">Current password<input className="input" type="password" autoComplete="current-password" required value={pw.currentPassword} onChange={(e) => setPw((f) => ({ ...f, currentPassword: e.target.value }))} /></label>
            <label className="field">New password<input className="input" type="password" autoComplete="new-password" required minLength={12} value={pw.newPassword} onChange={(e) => setPw((f) => ({ ...f, newPassword: e.target.value }))} /></label>
            <label className="field">Confirm new password<input className="input" type="password" autoComplete="new-password" required minLength={12} value={pw.confirm} onChange={(e) => setPw((f) => ({ ...f, confirm: e.target.value }))} /></label>
            <div style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-primary" type="submit" disabled={busy}>Change password</button></div>
          </form>
        )}
      </Section>

      <Section title="Account" sub="Sign out of this admin session.">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button type="button" className="btn" onClick={doSignOut}><Icon name="logout" size={16} /> Sign out</button>
        </div>
      </Section>

      <Section title="Technical information" sub="Helpful details for support and troubleshooting (not stored by this page).">
        <dl style={{ display: "grid", gridTemplateColumns: "minmax(140px,220px) 1fr", gap: "8px 12px", margin: 0, fontSize: 13 }}>
          <dt className="muted">Account ID</dt><dd style={{ margin: 0, wordBreak: "break-all" }}>{profile.id}</dd>
          <dt className="muted">Sign-in provider</dt><dd style={{ margin: 0 }}>{profile.provider}</dd>
          <dt className="muted">Team</dt><dd style={{ margin: 0 }}>{profile.team || "—"}</dd>
          <dt className="muted">Browser</dt><dd style={{ margin: 0, wordBreak: "break-word" }}>{ua || "—"}</dd>
          <dt className="muted">Time zone</dt><dd style={{ margin: 0 }}>{tz || "—"}</dd>
          <dt className="muted">Language</dt><dd style={{ margin: 0 }}>{lang || "—"}</dd>
        </dl>
      </Section>

      {can("settings:read") && form && (
        <form onSubmit={saveSite} style={{ display: "grid", gap: 16 }}>
          <Section title="Site settings" sub="Details shown on your website and booking rules. Only admins can save changes.">
            <fieldset disabled={!can("settings:write")} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 16, minWidth: 0 }}>
              <div className="adm-switch">
                <div><b>Accept online booking requests</b><small>Turn off to pause the booking form.</small></div>
                <button type="button" className="adm-toggle" role="switch" aria-checked={open} aria-label="Accept online booking requests" onClick={() => setForm((f) => ({ ...f, bookingsOpen: open ? "false" : "true" }))} />
              </div>
              <div className="adm-form-grid">
                <label className="field">Riders per day<input className="input num" type="number" min="1" max="500" value={form.dailyCapacity} onChange={set("dailyCapacity")} /></label>
                <label className="field">Cancellation window (hours)<input className="input" type="number" min="0" max="720" value={form.cancellationHours} onChange={set("cancellationHours")} /></label>
                <label className="field">Business name<input className="input" required maxLength={80} value={form.siteName} onChange={set("siteName")} /></label>
                <label className="field">Contact email<input className="input" type="email" maxLength={120} value={form.contactEmail} onChange={set("contactEmail")} /></label>
                <label className="field">Contact phone<input className="input" maxLength={30} value={form.contactPhone} onChange={set("contactPhone")} /></label>
                <label className="field">Meeting point<input className="input" maxLength={120} value={form.meetupName} onChange={set("meetupName")} /></label>
                <label className="field wide">Announcement<textarea className="textarea" rows={2} maxLength={300} value={form.announcement || ""} onChange={set("announcement")} /><Count value={form.announcement} max={300} /></label>
              </div>
              {can("settings:write") && <div><button className="btn btn-primary" type="submit" disabled={busy || !dirtySite}>Save site settings</button></div>}
            </fieldset>
          </Section>

          {can("export:read") && (
            <Section title="Export your data" sub="Downloads are recorded in the audit log.">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {[["booking-requests", "Website requests"], ["users", "Users"], ["audit", "Audit log"]].map(([type, label]) => (
                  <a key={type} className="btn" href={`/api/admin/export?type=${type}`}><Icon name="download" size={15} /> {label}</a>
                ))}
              </div>
            </Section>
          )}
        </form>
      )}
    </div>
  );
}
