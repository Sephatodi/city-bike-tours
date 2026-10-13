import { useState, useEffect } from "react";

export default function AdminOverview() {
  const [data, setData] = useState({ summary: {}, monthlyStats: [], routesConfig: [], content: [], bookings: [], bookingRequests: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/dashboard-summary", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load dashboard data");
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const editableRouteIds = new Set(["complete", "loop", "own"]);
  const editableRoutes = data.routesConfig.filter((route) => editableRouteIds.has(route.routeId));
  const maxMonthlyBookings = Math.max(1, ...data.monthlyStats.map((item) => Number(item.booking_count)));
  const allReservations = [...data.bookingRequests, ...data.bookings];
  const reservationStatuses = [
    { label: "Confirmed", key: "confirmed", count: allReservations.filter((item) => item.status === "confirmed").length },
    { label: "Pending", key: "pending", count: allReservations.filter((item) => item.status === "pending").length },
    { label: "Cancelled", key: "cancelled", count: allReservations.filter((item) => item.status === "cancelled").length },
    { label: "Declined", key: "declined", count: allReservations.filter((item) => item.status === "declined").length },
  ];
  const statusTotal = reservationStatuses.reduce((total, item) => total + item.count, 0);
  let statusOffset = 0;
  const statusGradient = statusTotal
    ? `conic-gradient(${reservationStatuses.map((item) => {
      const start = statusOffset;
      statusOffset += (item.count / statusTotal) * 100;
      return `var(--admin-status-${item.key}) ${start}% ${statusOffset}%`;
    }).join(", ")})`
    : "conic-gradient(#e5e9e7 0 100%)";
  const recentRequests = [...data.bookingRequests]
    .sort((first, second) => new Date(second.createdAt || second.rideDate) - new Date(first.createdAt || first.rideDate))
    .slice(0, 5);

  if (loading) return <div className="admin-loading">Loading dashboard...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">OPERATIONS / GABORONE</span>
          <h1>Dashboard</h1>
          <p>A quick view of tour operations</p>
        </div>
        <button className="admin-secondary-button" onClick={fetchData}>Refresh Data</button>
      </header>

      {error && <div className="admin-alert is-error" role="alert">{error}</div>}

      <div className="admin-reference-layout">
        <section className="admin-metrics" aria-label="Booking summary">
          <article className="admin-metric-card metric-coral"><span>Total Bookings</span><strong>{data.summary.totalBookings ?? 0}</strong><small>Website and account reservations</small></article>
          <article className="admin-metric-card metric-gold"><span>Total Riders</span><strong>{data.summary.totalRiders ?? 0}</strong><small>Across all booking records</small></article>
          <article className="admin-metric-card metric-blue"><span>Pending Requests</span><strong>{data.summary.pendingCount ?? 0}</strong><small>Waiting for confirmation</small></article>
          <article className="admin-metric-card metric-green"><span>Active Routes</span><strong>{editableRoutes.length}</strong><small>Available to manage</small></article>
        </section>

        <div className="admin-overview-grid">
          <section className="admin-surface admin-performance-panel">
            <div className="admin-section-heading"><div><span className="admin-eyebrow">PERFORMANCE</span><h2>Monthly Booking Volume</h2></div><span className="admin-period-label">Last 12 months</span></div>
            {data.monthlyStats.length ? (
              <div className="admin-monthly-chart">
                {data.monthlyStats.map((month) => {
                  const bookings = Number(month.booking_count);
                  return (
                    <div className="admin-month" key={month.billing_month} title={`${bookings} bookings, ${month.total_riders} riders`}>
                      <strong>{bookings}</strong>
                      <div className="admin-month-track"><div className="admin-month-bar" style={{ height: `${Math.max(4, (bookings / maxMonthlyBookings) * 100)}%` }} /></div>
                      <span>{month.billing_month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p className="admin-empty">No booking history yet.</p>}
          </section>

          <section className="admin-surface admin-status-panel">
            <div className="admin-section-heading"><div><span className="admin-eyebrow">RESERVATIONS</span><h2>Booking Status</h2></div></div>
            <div className="admin-status-summary">
              <div className="admin-donut" style={{ background: statusGradient }}><span>{statusTotal}</span></div>
              <div className="admin-status-legend">
                {reservationStatuses.map((item) => (
                  <div key={item.key}><span className={`admin-status-dot status-${item.key}`} />{item.label}<strong>{item.count}</strong></div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="admin-overview-bottom">
          <section className="admin-surface admin-recent-panel">
            <div className="admin-section-heading"><div><span className="admin-eyebrow">LATEST ACTIVITY</span><h2>Recent Booking Requests</h2></div></div>
            <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Rider</th><th>Route</th><th>Date</th><th>Status</th></tr></thead><tbody>
              {recentRequests.map((request) => <tr key={request.id}><td><strong>{request.name}</strong><span>{request.phone}</span></td><td>{request.routeId}</td><td>{request.rideDate}</td><td><span className={`admin-status-pill status-pill-${request.status}`}>{request.status}</span></td></tr>)}
            </tbody></table>{!recentRequests.length && <p className="admin-empty">No booking requests yet.</p>}</div>
          </section>
          <section className="admin-surface admin-route-summary">
            <div className="admin-section-heading"><div><span className="admin-eyebrow">ROUTE CATALOG</span><h2>Routes to Manage</h2></div></div>
            {editableRoutes.map((route) => <div className="admin-mini-route" key={route.routeId}><span>{route.routeName}</span><strong>BWP {Number(route.priceBwp).toFixed(0)}</strong></div>)}
          </section>
        </div>
      </div>
    </div>
  );
}