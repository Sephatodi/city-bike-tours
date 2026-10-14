"use client";

import { useEffect, useState } from "react";
import { DataGate, PageTop, api, money, useDash, useRun } from "./ui";

function RouteCard({ route, canEdit }) {
  const { refresh } = useDash();
  const [run, busy] = useRun();
  const [form, setForm] = useState({ routeName: route.routeName, priceBwp: route.priceBwp, scheduleSlots: route.scheduleSlots });
  useEffect(() => setForm({ routeName: route.routeName, priceBwp: route.priceBwp, scheduleSlots: route.scheduleSlots }), [route]);
  const dirty = form.routeName !== route.routeName || String(form.priceBwp) !== String(route.priceBwp) || form.scheduleSlots !== route.scheduleSlots;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    await run(async () => {
      await api(`/api/admin/routes-config/${encodeURIComponent(route.routeId)}`, { method: "PUT", body: form }, "Could not save this route.");
      await refresh();
    }, "Saved. The website shows the new details next time it loads.");
  }

  return (
    <form className="adm-card" onSubmit={save} style={{ display: "grid", gap: 14 }}>
      <div className="adm-card-head" style={{ marginBottom: 0 }}>
        <h3>{route.routeName}</h3>
        <span className="muted num">{money(route.priceBwp)}</span>
      </div>
      <label className="field">Route name<input className="input" required maxLength={100} value={form.routeName} onChange={set("routeName")} disabled={!canEdit} /></label>
      <div className="adm-form-grid">
        <label className="field">Price per rider (BWP)<input className="input num" required type="number" min="0" max="100000" step="0.01" value={form.priceBwp} onChange={set("priceBwp")} disabled={!canEdit} /></label>
        <label className="field">Start times<input className="input" required value={form.scheduleSlots} onChange={set("scheduleSlots")} disabled={!canEdit} /><span className="hint">24-hour times, comma separated</span></label>
      </div>
      {canEdit && <button className="btn btn-primary" type="submit" disabled={busy || !dirty}>Save changes</button>}
    </form>
  );
}

function Body() {
  const { data, can } = useDash();
  return (
    <>
      <PageTop title="Routes & prices">Name, price and start times for each ride. The booking site reads these live.</PageTop>
      <div className="adm-media-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {data.routesConfig.map((r) => <RouteCard key={r.routeId} route={r} canEdit={can("routes:write")} />)}
      </div>
      {!can("routes:write") && <p className="muted" style={{ marginTop: 16 }}>Your Viewer role can see routes but not change them.</p>}
    </>
  );
}

export default function RoutesPage() {
  return <DataGate><Body /></DataGate>;
}
