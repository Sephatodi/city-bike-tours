"use client";

import { useEffect, useState } from "react";
import { Icon, PageTop, Skeleton, api, useCopy, useDash, useRun, useToast } from "./ui";

const FIELDS = ["gaId", "gtmId", "metaPixelId", "webhookUrl", "webhookSecret"];
const EVENTS = ["booking_request.created", "booking_request.confirmed", "booking_request.declined", "booking_request.cancelled", "enquiry.created", "review.created"];

export default function IntegrationsPage() {
  const { can } = useDash();
  const toast = useToast();
  const copy = useCopy();
  const [run, busy] = useRun();
  const [saved, setSaved] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const write = can("settings:write");

  useEffect(() => { api("/api/admin/settings", {}, "Could not load.").then((r) => { setSaved(r.settings); setForm(r.settings); }).catch((e) => setError(e.message)); }, []);
  if (error) return <div className="adm-alert bad" role="alert"><Icon name="alert" /><div>{error}</div></div>;
  if (!form) return <Skeleton h={320} />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const dirty = FIELDS.some((k) => form[k] !== saved[k]);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const snippet = `<script defer src="${origin}/track.js"></script>`;

  async function save(e) {
    e.preventDefault();
    const body = Object.fromEntries(FIELDS.filter((k) => form[k] !== saved[k]).map((k) => [k, form[k]]));
    const res = await run(() => api("/api/admin/settings", { method: "PUT", body }, "Could not save."), "Integrations saved.");
    if (res) { setSaved(res.settings); setForm(res.settings); }
  }
  const test = async () => {
    const res = await run(() => api("/api/admin/integrations/test-webhook", { method: "POST" }, "Could not send the test."));
    if (res) toast(res.ok ? "Test sent. The other system answered OK." : "The other system didn't accept the test. Check the address.", res.ok ? "ok" : "error");
  };

  return (
    <form onSubmit={save}>
      <PageTop title="Integrations" actions={write && <button className="btn btn-primary" disabled={busy || !dirty}>Save changes</button>}>
        Connect other tools to your website. Paste an ID, never code, so nothing can break your pages.
      </PageTop>
      <fieldset disabled={!write} style={{ border: 0, padding: 0, margin: 0, display: "grid", gap: 16, minWidth: 0 }}>
        <div className="adm-card">
          <div className="adm-card-head"><div><h2>Tracking on your pages</h2><div className="sub">Added automatically to the pages served by this backend. For your separate booking site, add the tags there too.</div></div></div>
          <div className="adm-form-grid">
            <label className="field">Google Analytics ID<input className="input" value={form.gaId} onChange={set("gaId")} placeholder="G-XXXXXXXXXX" /></label>
            <label className="field">Google Tag Manager ID<input className="input" value={form.gtmId} onChange={set("gtmId")} placeholder="GTM-XXXXXXX" /></label>
            <label className="field">Meta (Facebook) Pixel ID<input className="input" value={form.metaPixelId} onChange={set("metaPixelId")} placeholder="1234567890" /></label>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="muted" style={{ marginBottom: 6 }}>Built-in visitor counter (no cookies). Add this to every page of any website you want counted:</div>
            <div className="adm-secret" style={{ fontSize: 13 }}><span style={{ flex: 1 }}>{snippet}</span><button type="button" className="btn btn-sm" onClick={() => copy(snippet, "Copied.")}><Icon name="copy" size={13} /> Copy</button></div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><div><h2>Send events to another system</h2><div className="sub">Works with Zapier, Make, n8n, a CRM or your accounting tool. Each event is sent as signed JSON.</div></div></div>
          <div className="adm-form-grid">
            <label className="field wide">Webhook address<input className="input" type="url" value={form.webhookUrl} onChange={set("webhookUrl")} placeholder="https://hooks.zapier.com/…" /></label>
            <label className="field wide">Signing secret<input className="input" value={form.webhookSecret} onChange={set("webhookSecret")} autoComplete="off" /><span className="hint">Optional. We sign every message with this so the other system can check it came from you (header X-Signature, HMAC-SHA256).</span></label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button type="button" className="btn" disabled={busy || !saved.webhookUrl || dirty} onClick={test}><Icon name="send" size={14} /> Send a test</button>
          </div>
          <div className="muted" style={{ fontSize: 12.5, marginTop: 14 }}>Events sent: {EVENTS.map((e) => <code key={e} style={{ marginRight: 8 }}>{e}</code>)}</div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head"><h2>Payments and accounting</h2></div>
          <p className="muted">Your site doesn't take card payments yet. When you add a payment provider, connect it here by sending the booking events above to your accounting or payment tool.</p>
        </div>
      </fieldset>
      {!write && <p className="muted" style={{ marginTop: 16 }}>Only admins can change integrations.</p>}
    </form>
  );
}
