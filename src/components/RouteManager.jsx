import { useState, useEffect } from "react";

const emptyData = { routesConfig: [] };
const editableRouteIds = new Set(["complete", "loop", "own"]);

export default function RouteManager() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editingRoute, setEditingRoute] = useState(null);

  async function fetchRoutes() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard-summary", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load routes");
      setData({ ...emptyData, ...result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRoutes(); }, []);

  async function saveRoute(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/routes-config/${encodeURIComponent(editingRoute.routeId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingRoute),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save route settings.");
      setEditingRoute(null);
      setNotice("Route settings saved.");
      fetchRoutes();
    } catch (reason) {
      setError(reason.message);
    }
  }

  const editableRoutes = data.routesConfig.filter((route) => editableRouteIds.has(route.routeId));

  if (loading) return <div className="admin-loading">Loading routes...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">ROUTE CATALOG</span>
          <h1>Routes & Pricing</h1>
          <p>Manage the tour routes available to riders</p>
        </div>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <section className="admin-surface">
        <div className="admin-section-heading">
          <div><span className="admin-eyebrow">ROUTE CATALOG</span><h2>Editable Routes</h2></div>
          <span className="admin-count">{editableRoutes.length} routes</span>
        </div>
        <div className="admin-route-list">
          {editableRoutes.map((route) => (
            <div className="admin-route-row" key={route.routeId}>
              <div className="admin-route-symbol" aria-hidden="true">{route.routeId === "complete" ? "01" : route.routeId === "loop" ? "02" : "03"}</div>
              <div className="admin-route-copy">
                <strong>{route.routeName}</strong>
                <span>{route.scheduleSlots || "Schedule not set"}</span>
              </div>
              <strong className="admin-route-price">BWP {Number(route.priceBwp).toFixed(2)}</strong>
              <button type="button" className="admin-action-button" onClick={() => setEditingRoute({ ...route })}>Edit route</button>
            </div>
          ))}
        </div>
        {!editableRoutes.length && <p className="admin-empty">Route settings have not been configured yet.</p>}
        {editingRoute && (
          <form className="admin-inline-form" onSubmit={saveRoute}>
            <h3>Edit {editingRoute.routeName}</h3>
            <label>Route name<input required maxLength={100} value={editingRoute.routeName} onChange={(event) => setEditingRoute({ ...editingRoute, routeName: event.target.value })} /></label>
            <label>Price (BWP)<input required type="number" min="0" max="100000" step="0.01" value={editingRoute.priceBwp} onChange={(event) => setEditingRoute({ ...editingRoute, priceBwp: event.target.value })} /></label>
            <label>Departure times<input required value={editingRoute.scheduleSlots} onChange={(event) => setEditingRoute({ ...editingRoute, scheduleSlots: event.target.value })} placeholder="09:00, 14:00" /></label>
            <div className="admin-form-actions"><button className="admin-primary-button" type="submit">Save changes</button><button className="admin-secondary-button" type="button" onClick={() => setEditingRoute(null)}>Cancel</button></div>
          </form>
        )}
      </section>
    </div>
  );
}