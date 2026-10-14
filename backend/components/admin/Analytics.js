"use client";

import { useCallback, useEffect, useState } from "react";
import { DualAreaChart } from "./charts";
import { Empty, Icon, PageTop, Skeleton, api, niceDate, useCopy } from "./ui";

const Stat = ({ icon, label, value, note }) => (
  <div className="adm-card adm-kpi">
    <div className="adm-kpi-label"><Icon name={icon} size={16} /> {label}</div>
    <div className="adm-kpi-row"><div className="adm-kpi-value num">{value}</div></div>
    {note && <div className="adm-kpi-note">{note}</div>}
  </div>
);

function Bars({ rows, nameKey = "name", valueKey = "views", empty }) {
  const max = Math.max(...rows.map((r) => r[valueKey]), 1);
  if (!rows.length) return <p className="muted">{empty}</p>;
  return (
    <ul className="adm-list">
      {rows.map((r) => (
        <li key={r[nameKey]}>
          <div className="line"><span style={{ overflowWrap: "anywhere" }}>{r[nameKey]}</span><span className="num">{r[valueKey]}</span></div>
          <div className="adm-meter"><i style={{ width: `${(r[valueKey] / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export default function Analytics() {
  const [days, setDays] = useState(30);
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const copy = useCopy();

  const load = useCallback(async () => {
    try { setD(await api(`/api/admin/analytics?days=${days}`, {}, "Could not load traffic.")); setError(""); } catch (e) { setError(e.message); }
  }, [days]);
  useEffect(() => { setD(null); void load(); }, [load]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = `<script defer src="${origin}/track.js"></script>`;

  return (
    <>
      <PageTop title="Website traffic" actions={
        <div className="tabs" role="group" aria-label="Time range">
          {[7, 30, 90].map((n) => <button key={n} className="tab" aria-pressed={days === n} onClick={() => setDays(n)}>{n} days</button>)}
        </div>}>
        Who visits your website and how many go on to book. Counted without cookies, and no one is identified.
      </PageTop>

      {error ? <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>
        : !d ? <div className="adm-stack"><Skeleton h={110} /><Skeleton h={300} /></div>
        : <>
          {d.totals.views === 0 && (
            <div className="adm-alert warn">
              <Icon name="alert" />
              <div>
                <b>No visits recorded yet.</b>
                <div className="muted" style={{ margin: "4px 0 10px" }}>Add this line inside the &lt;head&gt; of every page of your website (the booking site too), then visit a page.</div>
                <div className="adm-secret" style={{ fontSize: 13 }}><span style={{ flex: 1 }}>{snippet}</span><button className="btn btn-sm" onClick={() => copy(snippet, "Copied.")}><Icon name="copy" size={13} /> Copy</button></div>
                <div className="muted" style={{ marginTop: 8, fontSize: 12.5 }}>If your website is on another address, add that address to FRONTEND_ORIGIN in your backend settings.</div>
              </div>
            </div>
          )}
          <section className="adm-grid-kpi">
            <Stat icon="users" label="Visitors" value={d.totals.visitors.toLocaleString()} note={`Last ${d.days} days`} />
            <Stat icon="eye" label="Page views" value={d.totals.views.toLocaleString()} note={`${d.totals.viewsPerVisit} pages per visit`} />
            <Stat icon="refresh" label="Bounce rate" value={`${d.totals.bounceRate}%`} note="Left after one page" />
            <Stat icon="calendar" label="Booking requests" value={d.funnel[2].value} note={d.funnel[0].value ? `${Math.round((d.funnel[2].value / d.funnel[0].value) * 1000) / 10}% of visitors` : "—"} />
          </section>

          <section className="adm-split">
            <div className="adm-card">
              <div className="adm-card-head">
                <h2>Visitors and page views</h2>
                <div className="adm-legend"><span><i style={{ background: "#b567ff" }} />Page views</span><span><i style={{ background: "#22d3c0" }} />Visitors</span></div>
              </div>
              <DualAreaChart labels={d.series.map((x) => niceDate(x.day, { day: "numeric", month: "short" }))} a={d.series.map((x) => x.views)} b={d.series.map((x) => x.visitors)}
                aName="Page views" bName="Visitors" formatA={(v) => v} formatB={(v) => v} height={280} />
            </div>
            <div className="adm-stack">
              <div className="adm-card"><div className="adm-card-head"><h2>Devices</h2></div><Bars rows={d.devices} empty="No data yet." /></div>
              <div className="adm-card"><div className="adm-card-head"><h2>Where visitors come from</h2></div><Bars rows={d.referrers} empty="Mostly direct visits so far." /></div>
            </div>
          </section>

          <section className="adm-split-even">
            <div className="adm-card"><div className="adm-card-head"><h2>Most visited pages</h2></div><Bars rows={d.pages} nameKey="path" empty="No pages recorded yet." /></div>
            <div className="adm-card">
              <div className="adm-card-head"><div><h2>From visit to ride</h2><div className="sub">How far people get</div></div></div>
              <ul className="adm-list">
                {d.funnel.map((f, i) => (
                  <li key={f.label}>
                    <div className="line"><span>{f.label}</span><span className="num">{f.value}{i > 0 && d.funnel[i - 1].value ? ` · ${Math.round((f.value / d.funnel[i - 1].value) * 100)}%` : ""}</span></div>
                    <div className="adm-meter teal"><i style={{ width: `${d.funnel[0].value ? Math.min(100, (f.value / d.funnel[0].value) * 100) : 0}%` }} /></div>
                  </li>
                ))}
              </ul>
              <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>The last three steps count booking requests made in this period.</p>
            </div>
          </section>
        </>}
    </>
  );
}
