"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Spark } from "./charts";
import { Badge, Icon, PageTop, Skeleton, api, niceTime, useDash, useRun, useToast } from "./ui";

const dur = (s) => (s > 86400 ? `${Math.floor(s / 86400)} d` : s > 3600 ? `${Math.floor(s / 3600)} h` : `${Math.max(1, Math.floor(s / 60))} min`);

function Backups() {
  const toast = useToast();
  const [run, busy] = useRun();
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);
  const input = useRef(null);

  async function restore() {
    if (!file) return;
    let parsed;
    try { parsed = JSON.parse(await file.text()); } catch { toast("That file isn't a valid backup.", "error"); return; }
    const counts = Object.entries(parsed?.tables || {}).filter(([k]) => ["siteContent", "companyRoutesConfig", "siteSettings", "seoPages", "bookingRequests", "bookings"].includes(k)).map(([k, v]) => `${v.length} ${k}`).join(", ");
    if (!window.confirm(`Restore from this backup?\n\nIt contains: ${counts || "nothing recognised"}.\n\nRoutes, settings, search settings and content with the same ID are overwritten. Bookings are only added back if they're missing; existing ones are never changed. User accounts and passwords are not restored.`)) return;
    const res = await run(() => api("/api/admin/backup/restore", { method: "POST", body: parsed }, "Restore failed."), "Restore finished.");
    if (res) { setReport(res.report); setFile(null); if (input.current) input.current.value = ""; }
  }

  return (
    <div className="adm-card">
      <div className="adm-card-head"><div><h2>Backups</h2><div className="sub">Your data in one file you can keep. It never contains passwords or two-step secrets.</div></div></div>
      <div className="adm-split-even" style={{ marginBottom: 0 }}>
        <div>
          <b>Download a backup</b>
          <p className="muted" style={{ margin: "4px 0 12px" }}>Bookings, content, routes, settings, enquiries, reviews, subscribers, search settings and a list of users.</p>
          <a className="btn btn-primary" href="/api/admin/backup"><Icon name="download" size={15} /> Download backup (JSON)</a>
        </div>
        <div>
          <b>Restore from a backup</b>
          <p className="muted" style={{ margin: "4px 0 12px" }}>Choose a file you downloaded earlier. You'll see what it contains and confirm before anything changes.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input ref={input} className="input" type="file" accept="application/json,.json" style={{ flex: "1 1 200px" }} onChange={(e) => setFile(e.target.files?.[0] || null)} aria-label="Backup file" />
            <button className="btn btn-danger" disabled={busy || !file} onClick={restore}>Restore</button>
          </div>
          {report && <ul className="adm-list muted" style={{ marginTop: 12, fontSize: 13 }}>{Object.entries(report).map(([k, v]) => <li key={k}><div className="line"><span>{k}</span><span className="num">{v.done} restored{v.skipped ? `, ${v.skipped} skipped` : ""}</span></div></li>)}</ul>}
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>Automatic daily backups and point-in-time recovery of the whole database are done by Neon, your database host. Open your Neon project, then Backup &amp; Restore, to use them.</p>
    </div>
  );
}

export default function SystemPage() {
  const { can } = useDash();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const load = useCallback(async () => {
    try {
      const r = await api("/api/admin/system", {}, "Could not run the checks.");
      setD(r); setError("");
      setHistory((h) => [...h.slice(-19), r.database.ms]);
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { void load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  if (error && !d) return <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>;
  if (!d) return <Skeleton h={320} />;
  const healthy = d.database.ok && d.services.filter((s) => !s.optional).every((s) => s.ok);

  return (
    <>
      <PageTop title="System & backups" actions={<button className="btn" onClick={load}><Icon name="refresh" size={15} /> Check again</button>}>
        Is everything running? Checked just now and again every 30 seconds while this page is open.
      </PageTop>

      <section className="adm-grid-kpi">
        <div className="adm-card adm-kpi"><div className="adm-kpi-label"><Icon name="server" size={16} /> Overall</div><div className="adm-kpi-row"><div className="adm-kpi-value" style={{ fontSize: 22 }}>{healthy ? "All good" : "Needs attention"}</div><Badge tone={healthy ? "good" : "bad"}>{healthy ? "healthy" : "check below"}</Badge></div></div>
        <div className="adm-card adm-kpi"><div className="adm-kpi-label"><Icon name="database" size={16} /> Database answer time</div><div className="adm-kpi-row"><div className="adm-kpi-value num">{d.database.ms}<small style={{ marginLeft: 4 }}>ms</small></div><Spark values={history.length > 1 ? history : [d.database.ms, d.database.ms]} color="#22d3c0" /></div></div>
        <div className="adm-card adm-kpi"><div className="adm-kpi-label"><Icon name="clock" size={16} /> Server running for</div><div className="adm-kpi-row"><div className="adm-kpi-value num" style={{ fontSize: 22 }}>{dur(d.runtime.uptimeSeconds)}</div></div></div>
        <div className="adm-card adm-kpi"><div className="adm-kpi-label"><Icon name="doc" size={16} /> Software</div><div className="adm-kpi-row"><div className="adm-kpi-value" style={{ fontSize: 18 }}>Node {d.runtime.node.replace("v", "")}</div><span className="badge neutral">Next {d.runtime.next || "?"}</span></div></div>
      </section>

      <section className="adm-split-even">
        <div className="adm-card">
          <div className="adm-card-head"><h2>Connected services</h2></div>
          <ul className="adm-list">{d.services.map((s) => (
            <li key={s.name}><div className="line"><span>{s.name}</span>{s.ok ? <Badge tone="good">Connected</Badge> : <Badge tone={s.optional ? "neutral" : "bad"}>{s.optional ? "Not set up" : "Missing"}</Badge>}</div></li>
          ))}</ul>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>Want an alert when the site goes down? Add <code>/api/health</code> to a free monitor such as UptimeRobot.</p>
        </div>
        <div className="adm-card">
          <div className="adm-card-head"><h2>Records stored</h2></div>
          <ul className="adm-list">{Object.entries(d.tables).map(([k, v]) => <li key={k}><div className="line"><span>{k}</span><span className="num">{v.toLocaleString()}</span></div></li>)}</ul>
          <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>Last checked {niceTime(d.checkedAt)}.</p>
        </div>
      </section>

      {can("backup:write") && <Backups />}

      <div className="adm-card" style={{ marginTop: 16 }}>
        <div className="adm-card-head"><div><h2>Software versions</h2><div className="sub">What this site is built on. Updates are applied by your developer or host, not from here.</div></div></div>
        <div className="adm-table-wrap"><table>
          <thead><tr><th>Package</th><th>Required</th><th>Installed</th></tr></thead>
          <tbody>{d.dependencies.map((p) => <tr key={p.name}><td className="strong">{p.name}</td><td className="num muted">{p.wanted}</td><td className="num">{p.installed || "—"}</td></tr>)}</tbody>
        </table></div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>To check for updates, run <code>npm outdated</code> in the project, or turn on GitHub's Dependabot for automatic update suggestions. Firewall and SSL certificates are managed by your host (for example Vercel).</p>
      </div>
    </>
  );
}
