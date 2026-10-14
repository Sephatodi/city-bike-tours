"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge, Empty, Icon, PageTop, Skeleton, ago, api, niceTime } from "./ui";

const AREAS = [["", "Everything"], ["booking", "Bookings"], ["checkin", "Check-ins"], ["user", "Users"], ["content", "Content"], ["route", "Routes"], ["settings", "Settings"], ["message", "Messages"], ["inbox", "Inbox"], ["seo", "SEO"], ["media", "Media"], ["security", "Security"], ["backup", "Backups"], ["export", "Exports"]];

export default function AuditPage() {
  const [area, setArea] = useState("");
  const [logs, setLogs] = useState(null);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async (before) => {
    const qs = new URLSearchParams({ limit: "50" });
    if (area) qs.set("area", area);
    if (before) qs.set("before", String(before));
    try {
      const res = await api(`/api/admin/audit?${qs}`, {}, "Could not load the audit log.");
      setLogs((current) => (before ? [...(current || []), ...res.logs] : res.logs));
      setMore(res.hasMore);
      setError("");
    } catch (e) { setError(e.message); }
  }, [area]);

  useEffect(() => { setLogs(null); void load(); }, [load]);

  return (
    <>
      <PageTop title="Audit log" actions={<a className="btn" href="/api/admin/export?type=audit"><Icon name="download" size={16} /> Download CSV</a>}>
        A record of who changed what, and when. Entries can't be edited or removed from the dashboard.
      </PageTop>
      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="tabs" role="group" aria-label="Filter by area">
            {AREAS.map(([id, label]) => <button key={id} className="tab" aria-pressed={area === id} onClick={() => setArea(id)}>{label}</button>)}
          </div>
        </div>
        {error ? <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>
          : !logs ? <Skeleton h={260} />
          : logs.length ? (
            <>
              <div className="adm-table-wrap">
                <table>
                  <thead><tr><th>When</th><th>Who</th><th>What happened</th></tr></thead>
                  <tbody>
                    {logs.map((l) => (
                      <tr key={l.id}>
                        <td style={{ whiteSpace: "nowrap" }}><span className="strong">{ago(l.createdAt)}</span><small>{niceTime(l.createdAt)}</small></td>
                        <td style={{ whiteSpace: "nowrap" }}>{l.actorName} <Badge status={l.actorRole}>{l.actorRole}</Badge></td>
                        <td>{l.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {more && <div style={{ textAlign: "center", marginTop: 14 }}><button className="btn" disabled={loadingMore} onClick={async () => { setLoadingMore(true); await load(logs[logs.length - 1].id); setLoadingMore(false); }}>Show older</button></div>}
            </>
          ) : <Empty title="Nothing recorded yet">Actions like confirming a booking or changing a role appear here.</Empty>}
      </div>
    </>
  );
}
