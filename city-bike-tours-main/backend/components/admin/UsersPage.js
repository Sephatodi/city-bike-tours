"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ROLE_LABELS } from "@/lib/permissions";
import { Badge, Empty, Icon, Modal, PageTop, Skeleton, api, initials, niceDate, useCopy, useDash, useRun } from "./ui";

const ROLE_BLURB = {
  admin: ["Everything an Editor can do", "Manage users and roles", "Change site settings", "See the audit log and export data"],
  editor: ["Confirm, decline and cancel bookings", "Check riders in", "Edit routes, prices and content", "Message riders"],
  viewer: ["See bookings, routes and content", "See message history", "Can't change anything"],
};

function AddUser({ onClose, onDone }) {
  const [run, busy] = useRun();
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "editor", team: "", password: "" });
  const [secret, setSecret] = useState(null);
  const copy = useCopy();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    const res = await run(() => api("/api/admin/users", { method: "POST", body: form }, "Could not create the account."));
    if (!res) return;
    onDone();
    if (res.tempPassword) setSecret(res.tempPassword); else onClose();
  }

  if (secret) {
    return (
      <Modal title="Account created" lead="Share this temporary password privately. It won't be shown again." onClose={onClose}
        footer={<button className="btn btn-primary" onClick={onClose}>Done</button>}>
        <div className="adm-secret"><span style={{ flex: 1 }}>{secret}</span><button className="btn btn-sm" onClick={() => copy(secret, "Password copied.")}><Icon name="copy" size={13} /> Copy</button></div>
      </Modal>
    );
  }
  return (
    <Modal title="Add a user" lead="Create a staff member or a customer account." onClose={onClose}
      footer={<><button className="btn" type="button" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="user-form" disabled={busy}>Create account</button></>}>
      <form id="user-form" onSubmit={save} className="adm-form-grid">
        <label className="field">Full name<input className="input" required value={form.name} onChange={set("name")} /></label>
        <label className="field">Email<input className="input" type="email" required value={form.email} onChange={set("email")} /></label>
        <label className="field">Phone (optional)<input className="input" value={form.phone} onChange={set("phone")} placeholder="+267…" /></label>
        <label className="field">Role
          <select className="select" value={form.role} onChange={set("role")}>
            {["admin", "editor", "viewer", "customer"].map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </label>
        <label className="field wide">Team (optional)<input className="input" maxLength={60} value={form.team} onChange={set("team")} placeholder="Guides, Front desk…" /></label>
        <label className="field wide">Password<input className="input" type="text" minLength={12} value={form.password} onChange={set("password")} autoComplete="off" /><span className="hint">Leave blank to generate a temporary one.</span></label>
      </form>
    </Modal>
  );
}

function EditPassword({ user, onClose, onDone }) {
  const [run, busy] = useRun();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const copy = useCopy();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
    if (form.password.length < 12) { setError("Use at least 12 characters."); return; }
    const res = await run(() => api(`/api/admin/users/${user.id}`, { method: "PATCH", body: { changePassword: form.password } }, "Could not change password."), "Password updated.");
    if (res) { onDone(); onClose(); }
  }

  return (
    <Modal title={`Set password for ${user.name}`} lead="Enter a new password for this account." onClose={onClose}
      footer={<><button className="btn" type="button" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="edit-pass-form" disabled={busy}>Save password</button></>}>
      <form id="edit-pass-form" onSubmit={save} style={{ display: "grid", gap: 14, maxWidth: 420 }}>
        {error && <div className="adm-alert bad" role="alert">{error}</div>}
        <label className="field">New password<input className="input" type="password" required value={form.password} onChange={set("password")} autoComplete="new-password" minLength={12} /><span className="hint">At least 12 characters</span></label>
        <label className="field">Confirm password<input className="input" type="password" required value={form.confirm} onChange={set("confirm")} autoComplete="new-password" /></label>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const { staff, can } = useDash();
  const [list, setList] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("staff");
  const [q, setQ] = useState("");
  const [team, setTeam] = useState("");
  const [adding, setAdding] = useState(false);
  const [secret, setSecret] = useState(null);
  const [editingPass, setEditingPass] = useState(null);
  const [run, busy] = useRun();
  const copy = useCopy();
  const write = can("users:write");

  const load = useCallback(async () => {
    try { setList((await api("/api/admin/users", {}, "Could not load users.")).users); setError(""); } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (list || []).filter((u) => {
      if (tab === "staff" && u.role === "customer") return false;
      if (tab === "customers" && u.role !== "customer") return false;
      if (tab === "suspended" && u.status !== "suspended") return false;
      if (team && u.team !== team) return false;
      return !term || [u.name, u.email, u.phone].some((v) => String(v || "").toLowerCase().includes(term));
    });
  }, [list, tab, q, team]);
  const teams = [...new Set((list || []).map((u) => u.team).filter(Boolean))].sort();

  const counts = {
    staff: (list || []).filter((u) => u.role !== "customer").length,
    customers: (list || []).filter((u) => u.role === "customer").length,
    suspended: (list || []).filter((u) => u.status === "suspended").length,
  };

  const patch = (u, body, msg) => run(async () => {
    const res = await api(`/api/admin/users/${u.id}`, { method: "PATCH", body }, "Could not update the user.");
    await load();
    return res;
  }, msg);

  async function resetPassword(u) {
    if (!window.confirm(`Reset ${u.name}'s password? Their current password stops working immediately.`)) return;
    const res = await patch(u, { resetPassword: true });
    if (res?.tempPassword) setSecret({ name: u.name, value: res.tempPassword });
  }
  const remove = (u) => {
    if (!window.confirm(`Delete ${u.name}'s account? This can't be undone.`)) return;
    run(async () => { await api(`/api/admin/users/${u.id}`, { method: "DELETE" }, "Could not delete the account."); await load(); }, "Account deleted.");
  };

  return (
    <>
      <PageTop title="Users & roles" actions={write && <button className="btn btn-primary" onClick={() => setAdding(true)}><Icon name="plus" size={16} /> Add user</button>}>
        Control who can sign in and what they can do. Changes apply on the person's next click, with no need to sign out.
      </PageTop>

      <div className="adm-role-grid" style={{ marginBottom: 16 }}>
        {["admin", "editor", "viewer"].map((r) => (
          <div key={r} className="adm-card">
            <Badge status={r}>{ROLE_LABELS[r]}</Badge>
            <ul>{ROLE_BLURB[r].map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="tabs" role="group" aria-label="Filter users">
            {[["staff", "Staff"], ["customers", "Customers"], ["suspended", "Suspended"]].map(([id, label]) => (
              <button key={id} className="tab" aria-pressed={tab === id} onClick={() => setTab(id)}>{label} <span className="n num">{counts[id]}</span></button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {teams.length > 0 && <select className="select" style={{ width: 160 }} value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Filter by team"><option value="">All teams</option>{teams.map((t) => <option key={t} value={t}>{t}</option>)}</select>}
            <input className="input" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
          </div>
        </div>

        {error ? <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>
          : !list ? <Skeleton h={220} />
          : rows.length ? (
            <div className="adm-table-wrap">
              <table>
                <thead><tr><th>Person</th><th>Role</th><th>Team</th><th>2-step</th><th>Status</th><th>Bookings</th><th>Joined</th>{write && <th aria-label="Actions" />}</tr></thead>
                <tbody>
                  {rows.map((u) => {
                    const self = u.id === staff.id;
                    return (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span className="adm-avatar" style={{ width: 32, height: 32 }} aria-hidden="true">{initials(u.name)}</span>
                            <span><span className="strong">{u.name}{self && <span className="muted"> (you)</span>}</span><small>{u.email}</small></span>
                          </div>
                        </td>
                        <td>
                          {write && !self ? (
                            <select className="select" style={{ width: 130, minHeight: 34 }} value={u.role} disabled={busy} aria-label={`Role for ${u.name}`}
                              onChange={(e) => { if (window.confirm(`Change ${u.name} from ${ROLE_LABELS[u.role]} to ${ROLE_LABELS[e.target.value]}?`)) patch(u, { role: e.target.value }, "Role updated."); }}>
                              {["admin", "editor", "viewer", "customer"].map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                            </select>
                          ) : <Badge status={u.role}>{ROLE_LABELS[u.role]}</Badge>}
                        </td>
                        <td>{write && !self ? <button className="btn btn-sm" disabled={busy} onClick={() => { const t = window.prompt(`Team for ${u.name} (leave empty for none)`, u.team || ""); if (t !== null) patch(u, { team: t.trim() }, "Team updated."); }}>{u.team || "Set team"}</button> : (u.team || <span className="muted">—</span>)}</td>
                        <td>{u.role === "customer" ? <span className="muted">—</span> : <Badge tone={u.mfaEnabled ? "good" : "neutral"}>{u.mfaEnabled ? "On" : "Off"}</Badge>}</td>
                        <td><Badge status={u.status}>{u.status}</Badge></td>
                        <td className="num">{u.bookingCount}</td>
                        <td className="num">{niceDate(String(u.createdAt).slice(0, 10), { day: "numeric", month: "short", year: "numeric" })}</td>
                        {write && (
                          <td>
                            {!self && (
                              <div className="row-actions">
                                {u.status === "active"
                                  ? <button className="btn btn-sm" disabled={busy} onClick={() => window.confirm(`Suspend ${u.name}? They won't be able to sign in.`) && patch(u, { status: "suspended" }, "Account suspended.")}>Suspend</button>
                                  : <button className="btn btn-sm" disabled={busy} onClick={() => patch(u, { status: "active" }, "Account reactivated.")}>Reactivate</button>}
                                {u.mfaEnabled && <button className="btn btn-sm" disabled={busy} onClick={() => window.confirm(`Reset two-step sign-in for ${u.name}? They'll need to set it up again.`) && patch(u, { resetMfa: true }, "Two-step sign-in reset.")}>Reset 2-step</button>}
                                {u.provider === "credentials" && <button className="btn btn-sm" disabled={busy} onClick={() => resetPassword(u)}><Icon name="key" size={13} /> Reset password</button>}
                                {u.provider === "credentials" && <button className="btn btn-sm" disabled={busy} onClick={() => setEditingPass(u)}><Icon name="edit" size={13} /> Edit password</button>}
                                {u.bookingCount === 0 && <button className="btn btn-sm btn-danger btn-icon" disabled={busy} onClick={() => remove(u)} aria-label={`Delete ${u.name}`}><Icon name="trash" size={13} /></button>}
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : <Empty title="No one matches">Try another search or tab.</Empty>}
      </div>

      {adding && <AddUser onClose={() => setAdding(false)} onDone={load} />}
      {secret && (
        <Modal title={`New password for ${secret.name}`} lead="Share this temporary password privately. It won't be shown again." onClose={() => setSecret(null)} footer={<button className="btn btn-primary" onClick={() => setSecret(null)}>Done</button>}>
          <div className="adm-secret"><span style={{ flex: 1 }}>{secret.value}</span><button className="btn btn-sm" onClick={() => copy(secret.value, "Password copied.")}><Icon name="copy" size={13} /> Copy</button></div>
        </Modal>
      )}
      {editingPass && <EditPassword user={editingPass} onClose={() => setEditingPass(null)} onDone={load} />}
    </>
  );
}
