"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Empty, Icon, PageTop, Skeleton, ago, api, niceTime, useDash, useRun } from "./ui";
import PasswordInput from "./PasswordInput";

const REASONS = {
  wrong_password: "Wrong password", wrong_code: "Wrong authenticator code", unknown_account: "No such account", suspended: "Account suspended",
  blocked_ip: "Address blocked", locked_out: "Locked after too many tries",
};

function TwoStep() {
  const [run, busy] = useRun();
  const [state, setState] = useState(null);
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const load = useCallback(async () => { setState(await api("/api/admin/security/mfa")); }, []);
  useEffect(() => { load().catch(() => setState({ enabled: false, required: false })); }, [load]);
  if (!state) return <Skeleton h={120} />;

  const start = async () => { const r = await run(() => api("/api/admin/security/mfa", { method: "POST", body: { action: "start" } }, "Could not start setup.")); if (r) setSetup(r); };
  const confirm = async (e) => {
    e.preventDefault();
    const r = await run(() => api("/api/admin/security/mfa", { method: "POST", body: { action: "confirm", code } }, "Could not confirm."), "Two-step sign-in is on.");
    if (r) { setSetup(null); setCode(""); await load(); window.location.href = "/admin/security"; }
  };
  const disable = async (e) => {
    e.preventDefault();
    const r = await run(() => api("/api/admin/security/mfa", { method: "POST", body: { action: "disable", code } }, "Could not turn off."), "Two-step sign-in is off.");
    if (r) { setCode(""); await load(); }
  };

  return (
    <div className="adm-card">
      <div className="adm-card-head"><div><h2>Your two-step sign-in</h2><div className="sub">A 6-digit code from an app like Google Authenticator, asked for after your password.</div></div>
        <Badge tone={state.enabled ? "good" : "warn"}>{state.enabled ? "On" : "Off"}</Badge></div>
      {state.required && !state.enabled && <div className="adm-alert warn"><Icon name="lock" /><div>Your team requires two-step sign-in. Turn it on to keep using the dashboard.</div></div>}
      {!state.enabled && !setup && <button className="btn btn-primary" disabled={busy} onClick={start}><Icon name="lock" size={15} /> Set up two-step sign-in</button>}
      {setup && (
        <form onSubmit={confirm} style={{ display: "grid", gap: 14, maxWidth: 420 }}>
          <ol className="muted" style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
            <li>Open your authenticator app and scan this picture.</li>
            <li>Type the 6-digit code it shows.</li>
          </ol>
          <img src={setup.qr} alt="QR code to add this account to your authenticator app" width={180} height={180} style={{ background: "#fff", padding: 8, borderRadius: 12 }} />
          <div className="muted" style={{ fontSize: 12.5 }}>Can't scan? Type this key in the app: <span className="num" style={{ color: "var(--text)", overflowWrap: "anywhere" }}>{setup.secret}</span></div>
          <label className="field">6-digit code<input className="input num" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required value={code} onChange={(e) => setCode(e.target.value)} /></label>
          <div style={{ display: "flex", gap: 10 }}><button className="btn btn-primary" disabled={busy}>Turn on</button><button type="button" className="btn" onClick={() => setSetup(null)}>Cancel</button></div>
        </form>
      )}
      {state.enabled && !state.required && (
        <form onSubmit={disable} style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
          <label className="field">Current code to turn off<input className="input num" style={{ width: 160 }} inputMode="numeric" maxLength={7} required value={code} onChange={(e) => setCode(e.target.value)} /></label>
          <button className="btn btn-danger" disabled={busy}>Turn off</button>
        </form>
      )}
      {state.enabled && state.required && <p className="muted">Required for all staff, so it can't be turned off.</p>}
    </div>
  );
}

function ChangePassword() {
  const [run, busy] = useRun();
  const [form, setForm] = useState({ current: "", new: "", confirm: "" });
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setError("");
    if (form.new !== form.confirm) { setError("New passwords don't match."); return; }
    if (form.new.length < 12) { setError("Use at least 12 characters."); return; }
    const res = await run(() => api("/api/admin/users/me", { method: "PATCH", body: { changePassword: form.new } }, "Could not change password."), "Password changed. You'll need to sign in again.");
    if (res) { setForm({ current: "", new: "", confirm: "" }); }
  }

  return (
    <div className="adm-card">
      <div className="adm-card-head"><h2>Change your password</h2></div>
      <form onSubmit={save} style={{ display: "grid", gap: 14, maxWidth: 420 }}>
        {error && <div className="adm-alert bad" role="alert">{error}</div>}
        <label className="field">Current password<PasswordInput required value={form.current} onChange={set("current")} autoComplete="current-password" /></label>
        <label className="field">New password<PasswordInput required value={form.new} onChange={set("new")} autoComplete="new-password" minLength={12} /><span className="hint">At least 12 characters</span></label>
        <label className="field">Confirm new password<PasswordInput required value={form.confirm} onChange={set("confirm")} autoComplete="new-password" /></label>
        <button className="btn btn-primary" disabled={busy}><Icon name="key" size={15} /> Save new password</button>
      </form>
    </div>
  );
}

function Rules() {
  const { refresh } = useDash();
  const [run, busy] = useRun();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  useEffect(() => { api("/api/admin/settings").then((r) => { setSaved(r.settings); setForm(r.settings); }).catch(() => {}); }, []);
  if (!form) return <Skeleton h={160} />;
  const keys = ["requireMfa", "sessionMinutes", "maxFailedLogins"];
  const dirty = keys.some((k) => form[k] !== saved[k]);
  const save = async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(keys.filter((k) => form[k] !== saved[k]).map((k) => [k, form[k]]));
    const res = await run(() => api("/api/admin/settings", { method: "PUT", body }, "Could not save."), "Saved.");
    if (res) { setSaved(res.settings); setForm(res.settings); refresh(); }
  };
  const req = form.requireMfa === "true";
  return (
    <form className="adm-card" onSubmit={save}>
      <div className="adm-card-head"><h2>Sign-in rules</h2><button className="btn btn-primary btn-sm" disabled={busy || !dirty}>Save</button></div>
      <div className="adm-switch">
        <div><b>Require two-step sign-in for all staff</b><small>Staff who haven't set it up are sent to this page until they do. Set yours up first.</small></div>
        <button type="button" className="adm-toggle" role="switch" aria-checked={req} aria-label="Require two-step sign-in" onClick={() => setForm((f) => ({ ...f, requireMfa: req ? "false" : "true" }))} />
      </div>
      <div className="adm-form-grid" style={{ marginTop: 10 }}>
        <label className="field">Sign out after (minutes)<input className="input num" type="number" min="5" max="10080" value={form.sessionMinutes} onChange={(e) => setForm((f) => ({ ...f, sessionMinutes: e.target.value }))} /><span className="hint">480 = 8 hours</span></label>
        <label className="field">Lock sign-in after this many wrong tries<input className="input num" type="number" min="3" max="20" value={form.maxFailedLogins} onChange={(e) => setForm((f) => ({ ...f, maxFailedLogins: e.target.value }))} /><span className="hint">Locks that email for 15 minutes</span></label>
      </div>
    </form>
  );
}

function Activity() {
  const [run, busy] = useRun();
  const [d, setD] = useState(null);
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");
  const load = useCallback(async () => { setD(await api("/api/admin/security/attempts")); }, []);
  useEffect(() => { load().catch(() => setD({ attempts: [], blocked: [], summary: { failed24h: 0, success24h: 0 } })); }, [load]);
  if (!d) return <Skeleton h={260} />;
  const block = async (address, why) => { const r = await run(async () => { await api("/api/admin/security/blocked-ips", { method: "POST", body: { ip: address, reason: why } }, "Could not block."); await load(); return true; }, "Address blocked."); if (r) { setIp(""); setReason(""); } };

  return (
    <>
      <div className="adm-split-even">
        <div className="adm-card">
          <div className="adm-card-head"><div><h2>Last 24 hours</h2></div></div>
          <div style={{ display: "flex", gap: 28 }}>
            <div><div className="adm-big num">{d.summary.success24h}</div><div className="muted">successful sign-ins</div></div>
            <div><div className="adm-big num" style={{ color: d.summary.failed24h ? "var(--bad)" : undefined }}>{d.summary.failed24h}</div><div className="muted">failed attempts</div></div>
          </div>
        </div>
        <div className="adm-card">
          <div className="adm-card-head"><h2>Blocked addresses</h2></div>
          <form onSubmit={(e) => { e.preventDefault(); block(ip, reason); }} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <input className="input" style={{ flex: "1 1 140px" }} placeholder="203.0.113.7" required value={ip} onChange={(e) => setIp(e.target.value)} aria-label="IP address" />
            <input className="input" style={{ flex: "2 1 160px" }} placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason" />
            <button className="btn" disabled={busy}>Block</button>
          </form>
          {d.blocked.length ? <ul className="adm-list">{d.blocked.map((b) => (
            <li key={b.ip}><div className="line"><span className="num">{b.ip} <span className="muted">{b.reason}</span></span><button className="btn btn-sm" disabled={busy} onClick={() => run(async () => { await api(`/api/admin/security/blocked-ips?ip=${encodeURIComponent(b.ip)}`, { method: "DELETE" }); await load(); }, "Unblocked.")}>Unblock</button></div></li>
          ))}</ul> : <p className="muted">No addresses blocked. Blocked addresses can't sign in, use the dashboard or send booking requests.</p>}
        </div>
      </div>
      <div className="adm-card" style={{ marginTop: 16 }}>
        <div className="adm-card-head"><div><h2>Sign-in log</h2><div className="sub">Latest 150 attempts</div></div></div>
        {d.attempts.length ? (
          <div className="adm-table-wrap"><table>
            <thead><tr><th>When</th><th>Email</th><th>Address</th><th>Result</th><th aria-label="Actions" /></tr></thead>
            <tbody>{d.attempts.map((a) => (
              <tr key={a.id}>
                <td style={{ whiteSpace: "nowrap" }}><span className="strong">{ago(a.createdAt)}</span><small>{niceTime(a.createdAt)}</small></td>
                <td style={{ overflowWrap: "anywhere" }}>{a.email || "—"}</td>
                <td className="num">{a.ip || "—"}</td>
                <td>{a.success ? <Badge tone="good">Signed in</Badge> : <Badge tone="bad">{REASONS[a.reason] || "Failed"}</Badge>}</td>
                <td>{!a.success && a.ip && a.ip !== "unknown" && !d.blocked.some((b) => b.ip === a.ip) && <button className="btn btn-sm" disabled={busy} onClick={() => window.confirm(`Block ${a.ip}?`) && block(a.ip, "Failed sign-ins")}>Block</button>}</td>
              </tr>))}</tbody>
          </table></div>
        ) : <Empty title="No sign-ins recorded yet">Every attempt will be listed here.</Empty>}
      </div>
    </>
  );
}

export default function SecurityPage() {
  const { can } = useDash();
  return (
    <>
      <PageTop title="Security">Protect the dashboard: two-step sign-in, lock-outs, session length and blocked addresses.</PageTop>
      <div className="adm-stack">
        <TwoStep />
        <ChangePassword />
        {can("security:read") && <><Rules /><Activity /></>}
      </div>
    </>
  );
}
