"use client";

import Link from "next/link";
import { CapacityBars, DualAreaChart, LineMini } from "./charts";
import { useBookingActions, unifyBookings } from "./booking-actions";
import { Badge, DataGate, Empty, Icon, PageTop, money, monthLabel, niceDate, useDash } from "./ui";

function Delta({ now, before }) {
  if (!before) return null;
  const pct = Math.round(((now - before) / before) * 100);
  return <span className={`badge ${pct >= 0 ? "good" : "bad"}`}>{pct >= 0 ? "+" : ""}{pct}%</span>;
}

function Kpi({ icon, label, value, prefix, badge, href, hrefLabel }) {
  return (
    <div className="adm-card adm-kpi">
      <div className="adm-kpi-label">
        <Icon name={icon} size={16} /> {label}
        {href && <Link href={href} className="adm-kpi-go" aria-label={hrefLabel}><Icon name="arrow" size={14} /></Link>}
      </div>
      <div className="adm-kpi-row">
        <div className="adm-kpi-value num">{prefix && <small>{prefix}</small>}{value}</div>
        {badge}
      </div>
    </div>
  );
}

function Body() {
  const { data, staff, can } = useDash();
  const { setStatus, checkIn, busy } = useBookingActions();
  const s = data.summary;
  const m = data.monthly;
  const now = m[m.length - 1];
  const before = m[m.length - 2];
  const all = unifyBookings(data);
  const firstName = (staff.name || "").split(" ")[0] || "there";
  const latest = all.filter((b) => b.source === "request").slice(0, 6);
  const manifest = all.filter((b) => b.date === data.today && b.status === "confirmed");
  const totalRevenue = m.reduce((sum, x) => sum + x.revenue, 0);
  const maxRoute = Math.max(...data.byRoute.map((r) => r.riders), 1);
  const upcomingTotal = data.upcoming.reduce((sum, d) => sum + d.booked, 0);

  return (
    <>
      <PageTop
        title={`Dumela, ${firstName}`}
        actions={<>
          {can("export:read") && <a className="btn" href="/api/admin/export?type=booking-requests"><Icon name="download" size={16} /> Export data</a>}
          {can("bookings:read") && <Link className="btn btn-primary" href="/admin/bookings?status=pending"><Icon name="calendar" size={16} /> {s.pendingCount ? `Review ${s.pendingCount} request${s.pendingCount === 1 ? "" : "s"}` : "Open bookings"}</Link>}
        </>}
      >
        Here's how your rides are looking. {niceDate(data.today, { weekday: "long", day: "numeric", month: "long" })} in Gaborone.
      </PageTop>

      <section className="adm-grid-kpi" aria-label="Key numbers">
        <Kpi icon="bike" label="Riders today" value={s.ridersToday} href="/admin/check-in" hrefLabel="Open check-in"
          badge={s.ridersToday ? <span className="badge teal">{s.checkedInToday} in</span> : <span className="badge neutral">none</span>} />
        <Kpi icon="clock" label="Pending requests" value={s.pendingCount} href="/admin/bookings?status=pending" hrefLabel="Review pending requests"
          badge={s.pendingCount ? <span className="badge warn">needs reply</span> : <span className="badge good">all clear</span>} />
        <Kpi icon="users" label="Riders this month" value={s.ridersThisMonth} href="/admin/bookings" hrefLabel="Open bookings"
          badge={<Delta now={now.riders} before={before?.riders} />} />
        <Kpi icon="money" label="Revenue this month" prefix="P" value={Math.round(s.revenueThisMonth).toLocaleString("en-BW")} href="/admin/bookings" hrefLabel="Open bookings"
          badge={<Delta now={now.revenue} before={before?.revenue} />} />
      </section>

      <section className="adm-split">
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <div className="muted" style={{ fontSize: 13 }}>Total revenue</div>
              <div className="adm-big-row"><span className="adm-big num">{money(totalRevenue)}</span><Delta now={now.revenue} before={before?.revenue} /></div>
            </div>
            <div className="adm-legend">
              <span><i style={{ background: "#b567ff" }} />Revenue</span>
              <span><i style={{ background: "#22d3c0" }} />Riders</span>
              <span className="adm-pill">Last 6 months</span>
            </div>
          </div>
          <DualAreaChart
            labels={m.map((x) => monthLabel(x.month))}
            a={m.map((x) => x.revenue)} b={m.map((x) => x.riders)}
            aName="Revenue" bName="Riders"
            formatA={(v) => (v >= 1000 ? `P${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `P${v}`)} formatB={(v) => `${v} riders`}
            height={372}
          />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>Confirmed rides only, using each route's current price. Weekday and holiday account bookings without a set price count as P0.</p>
        </div>

        <div className="adm-stack">
          <div className="adm-card">
            <div className="adm-card-head" style={{ marginBottom: 6 }}>
              <div>
                <div className="muted" style={{ fontSize: 13 }}><Icon name="calendar" size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--violet)" }} />Riders booked, next 14 days</div>
                <div className="adm-big-row"><span className="adm-big num">{upcomingTotal}</span><span className="badge neutral">limit {data.capacity}/day</span></div>
              </div>
            </div>
            <CapacityBars capacity={data.capacity} height={170} items={data.upcoming.map((d) => ({ key: d.date, value: d.booked, label: niceDate(d.date, { day: "numeric", month: "short" }), full: niceDate(d.date, { weekday: "long", day: "numeric", month: "long" }) }))} />
            <div className="adm-card-foot"><span className="muted">Dashed line is your daily limit</span>{can("bookings:read") && <Link href="/admin/bookings" className="adm-link-quiet">View bookings</Link>}</div>
          </div>
          <div className="adm-card">
            <div className="adm-card-head" style={{ marginBottom: 6 }}>
              <div>
                <div className="muted" style={{ fontSize: 13 }}><Icon name="doc" size={14} style={{ verticalAlign: "-2px", marginRight: 6, color: "var(--violet)" }} />Total bookings</div>
                <div className="adm-big-row"><span className="adm-big num">{s.totalBookings}</span></div>
              </div>
            </div>
            <LineMini values={m.map((x) => x.rides)} labels={m.map((x) => monthLabel(x.month))} />
            <div className="adm-card-foot"><span className="muted">Confirmed rides per month</span></div>
          </div>
        </div>
      </section>

      <section className="adm-split-even">
        <div className="adm-card">
          <div className="adm-card-head">
            <h2>Latest requests</h2>
            {can("bookings:read") && <Link className="btn btn-sm" href="/admin/bookings">View all</Link>}
          </div>
          {latest.length ? (
            <div className="adm-table-wrap">
              <table>
                <thead><tr><th>Rider</th><th>Ride</th><th>Status</th>{can("bookings:write") && <th aria-label="Actions" />}</tr></thead>
                <tbody>
                  {latest.map((b) => (
                    <tr key={b.key}>
                      <td><span className="strong">{b.name}</span><small>{b.riders} rider{b.riders === 1 ? "" : "s"}</small></td>
                      <td>{b.route}<small>{niceDate(b.date)}</small></td>
                      <td><Badge status={b.status}>{b.status}</Badge></td>
                      {can("bookings:write") && (
                        <td>
                          {b.status === "pending" && (
                            <div className="row-actions">
                              <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => setStatus(b, "confirmed")}>Confirm</button>
                              <button className="btn btn-sm" disabled={busy} onClick={() => setStatus(b, "declined")}>Decline</button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <Empty title="No website requests yet">New requests from your booking form show up here.</Empty>}
        </div>

        <div className="adm-stack">
        <div className="adm-card">
          <div className="adm-card-head">
            <div><h2>Today's riders</h2><div className="sub">{manifest.length ? `${manifest.filter((b) => b.checkedInAt).length} of ${manifest.length} bookings checked in` : "Confirmed rides for today"}</div></div>
            {can("checkin:write") && <Link className="btn btn-sm" href="/admin/check-in"><Icon name="qr" size={14} /> Check-in</Link>}
          </div>
          {manifest.length ? (
            <ul className="adm-list">
              {manifest.map((b) => (
                <li key={b.key}>
                  <div className="line">
                    <span><span className="strong">{b.name}</span> <span className="muted">· {b.riders} rider{b.riders === 1 ? "" : "s"}{b.time ? ` · ${b.time}` : ""}</span></span>
                    {b.checkedInAt ? <Badge tone="good">Checked in</Badge> : can("checkin:write") ? <button className="btn btn-sm" disabled={busy} onClick={() => checkIn(b)}>Check in</button> : <Badge tone="neutral">Expected</Badge>}
                  </div>
                  <span className="muted" style={{ fontSize: 12.5 }}>{b.route}</span>
                </li>
              ))}
            </ul>
          ) : <Empty title="No rides today">Nothing is confirmed for today.</Empty>}
        </div>
        <div className="adm-card">
          <div className="adm-card-head"><h2>Riders by route</h2></div>
          {data.byRoute.length ? (
            <ul className="adm-list">
              {data.byRoute.slice(0, 4).map((r) => (
                <li key={r.routeId}>
                  <div className="line"><span>{r.name}</span><span className="num">{r.riders} riders · {money(r.revenue)}</span></div>
                  <div className="adm-meter teal"><i style={{ width: `${(r.riders / maxRoute) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          ) : <Empty title="No confirmed rides yet">Routes appear here once you confirm a booking.</Empty>}
        </div>
        </div>
      </section>
    </>
  );
}

export default function Overview() {
  return <DataGate><Body /></DataGate>;
}
