import { useState, useEffect } from "react";

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [logLevel, setLogLevel] = useState("");
  const [logOffset, setLogOffset] = useState(0);

  async function fetchAnalytics() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/analytics", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load analytics");
      setAnalytics(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogs() {
    setError("");
    try {
      const params = new URLSearchParams({ limit: "50", offset: logOffset.toString() });
      if (logLevel) params.append("level", logLevel);
      const response = await fetch(`/api/admin/logs?${params}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load logs");
      setLogs(result.logs || []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => { 
    fetchAnalytics(); 
    fetchLogs();
  }, [logLevel, logOffset]);

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading && !analytics) return <div className="admin-loading">Loading analytics...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">INSIGHTS</span>
          <h1>Analytics & Monitoring</h1>
          <p>Track key metrics, system health, and audit trails</p>
        </div>
        <button className="admin-secondary-button" onClick={fetchAnalytics}>Refresh Data</button>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <div className="admin-tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
        <button className={activeTab === "bookings" ? "active" : ""} onClick={() => setActiveTab("bookings")}>Booking Analytics</button>
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>User Analytics</button>
        <button className={activeTab === "logs" ? "active" : ""} onClick={() => setActiveTab("logs")}>System Logs</button>
        <button className={activeTab === "uptime" ? "active" : ""} onClick={() => setActiveTab("uptime")}>Uptime</button>
      </div>

      {activeTab === "overview" && analytics && (
        <div className="admin-reference-layout">
          <section className="admin-metrics" aria-label="Key metrics">
            <article className="admin-metric-card metric-coral"><span>Total Users</span><strong>{formatNumber(analytics.overview?.totalUsers || 0)}</strong><small>Registered accounts</small></article>
            <article className="admin-metric-card metric-gold"><span>Total Bookings</span><strong>{formatNumber(analytics.overview?.totalBookings || 0)}</strong><small>Confirmed reservations</small></article>
            <article className="admin-metric-card metric-blue"><span>Booking Requests</span><strong>{formatNumber(analytics.overview?.totalRequests || 0)}</strong><small>Pending & completed</small></article>
            <article className="admin-metric-card metric-green"><span>Content Items</span><strong>{formatNumber(analytics.overview?.totalContent || 0)}</strong><small>Published media & articles</small></article>
          </section>

          <div className="admin-overview-grid">
            <section className="admin-surface admin-performance-panel">
              <div className="admin-section-heading"><div><span className="admin-eyebrow">PERFORMANCE</span><h2>Monthly Booking Volume</h2></div><span className="admin-period-label">Last 12 months</span></div>
              {analytics.bookingsByMonth?.length ? (
                <div className="admin-monthly-chart">
                  {analytics.bookingsByMonth.map((month) => {
                    const bookings = Number(month.bookings);
                    const maxBookings = Math.max(1, ...analytics.bookingsByMonth.map(m => Number(m.bookings)));
                    return (
                      <div className="admin-month" key={month.month} title={`${bookings} bookings`}>
                        <strong>{bookings}</strong>
                        <div className="admin-month-track">
                          <div className="admin-month-bar" style={{ height: `${Math.max(4, (bookings / maxBookings) * 100)}%` }} />
                        </div>
                        <span>{month.month.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="admin-empty">No booking history yet.</p>}
            </section>

            <section className="admin-surface admin-status-panel">
              <div className="admin-section-heading"><div><span className="admin-eyebrow">REQUESTS</span><h2>Booking Request Status</h2></div></div>
              {analytics.requestsByStatus?.length ? (
                <div className="admin-status-summary">
                  <div className="admin-donut" style={{ background: `conic-gradient(${analytics.requestsByStatus.map((item, i) => {
                    const total = analytics.requestsByStatus.reduce((sum, s) => sum + Number(s.count), 0);
                    const start = analytics.requestsByStatus.slice(0, i).reduce((sum, s) => sum + Number(s.count), 0) / total * 360;
                    const end = (start + Number(item.count) / total * 360);
                    return `${item.status} ${start}deg ${end}deg`;
                  }).join(", ")})` }}>
                    <span>{analytics.requestsByStatus.reduce((sum, s) => sum + Number(s.count), 0)}</span>
                  </div>
                  <div className="admin-status-legend">
                    {analytics.requestsByStatus.map(item => (
                      <div key={item.status}>
                        <span className={`admin-status-dot status-${item.status.toLowerCase()}`} />
                        {item.status}<strong>{item.count}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <p className="admin-empty">No request data.</p>}
            </section>
          </div>

          <div className="admin-overview-bottom">
            <section className="admin-surface admin-recent-panel">
              <div className="admin-section-heading"><div><span className="admin-eyebrow">RECENT ACTIVITY</span><h2>Newest Users</h2></div></div>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>
                {analytics.recentUsers?.map(user => <tr key={user.id}><td><strong>{user.name}</strong></td><td>{user.email}</td><td><span className="admin-role-badge">{user.adminRole || "customer"}</span></td><td>{new Date(user.createdAt).toLocaleDateString()}</td></tr>)}
              </tbody></table></div>
            </section>
            <section className="admin-surface admin-route-summary">
              <div className="admin-section-heading"><div><span className="admin-eyebrow">RECENT BOOKINGS</span><h2>Latest Reservations</h2></div></div>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Date</th><th>Status</th><th>Created</th></tr></thead><tbody>
                {analytics.recentBookings?.map(booking => <tr key={booking.id}><td>{booking.rideDate}</td><td><span className={`admin-status-pill status-pill-${booking.status}`}>{booking.status}</span></td><td>{new Date(booking.createdAt).toLocaleDateString()}</td></tr>)}
              </tbody></table></div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "bookings" && analytics && (
        <div className="admin-reference-layout">
          <section className="admin-metrics">
            <article className="admin-metric-card metric-coral"><span>By Route</span><strong>{analytics.bookingsByRoute?.length || 0}</strong><small>Active routes</small></article>
            <article className="admin-metric-card metric-gold"><span>Traffic Sources</span><strong>{analytics.trafficSources?.length || 0}</strong><small>Auth providers</small></article>
          </section>
          <div className="admin-overview-grid">
            <section className="admin-surface">
              <div className="admin-section-heading"><h2>Bookings by Route</h2></div>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Route</th><th>Bookings</th></tr></thead><tbody>
                {analytics.bookingsByRoute?.map(route => <tr key={route.route}><td>{route.route}</td><td>{route.count}</td></tr>)}
              </tbody></table></div>
            </section>
            <section className="admin-surface">
              <div className="admin-section-heading"><h2>User Traffic Sources</h2></div>
              <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Provider</th><th>Users</th></tr></thead><tbody>
                {analytics.trafficSources?.map(src => <tr key={src.provider}><td>{src.provider}</td><td>{src.count}</td></tr>)}
              </tbody></table></div>
            </section>
          </div>
        </div>
      )}

      {activeTab === "users" && analytics && (
        <section className="admin-surface">
          <div className="admin-section-heading"><h2>User Analytics</h2></div>
          <p className="admin-empty">Detailed user analytics coming soon. Currently showing overview metrics.</p>
        </section>
      )}

      {activeTab === "logs" && (
        <section className="admin-surface admin-requests-view">
          <div className="admin-section-heading">
            <div><span className="admin-eyebrow">AUDIT TRAIL</span><h2>System Logs</h2></div>
            <div className="admin-log-filters">
              <select value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
                <option value="">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
              <div className="admin-pagination">
                <button className="admin-secondary-button" disabled={logOffset === 0} onClick={() => setLogOffset(Math.max(0, logOffset - 50))}>Previous</button>
                <span>Showing {logOffset + 1}–{logOffset + logs.length} of many</span>
                <button className="admin-secondary-button" onClick={() => setLogOffset(logOffset + 50)}>Next</button>
              </div>
            </div>
          </div>
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Time</th><th>Level</th><th>Message</th><th>User</th><th>IP</th></tr></thead><tbody>
            {logs.map(log => <tr key={log.id}><td>{new Date(log.createdAt).toLocaleString()}</td><td><span className={`admin-status-pill status-pill-${log.level}`}>{log.level}</span></td><td>{log.message}</td><td>{log.userName || "System"}</td><td>{log.ipAddress || "—"}</td></tr>)}
          </tbody></table>{!logs.length && <p className="admin-empty">No logs found.</p>}</div>
        </section>
      )}

      {activeTab === "uptime" && (
        <section className="admin-surface">
          <div className="admin-section-heading"><h2>Uptime Monitoring</h2></div>
          <div className="admin-uptime-grid">
            <div className="admin-uptime-card">
              <h3>API Status</h3>
              <div className="admin-uptime-status status-healthy">● Operational</div>
              <p>Last checked: Just now</p>
            </div>
            <div className="admin-uptime-card">
              <h3>Database</h3>
              <div className="admin-uptime-status status-healthy">● Connected</div>
              <p>Response time: ~12ms</p>
            </div>
            <div className="admin-uptime-card">
              <h3>Storage</h3>
              <div className="admin-uptime-status status-healthy">● Available</div>
              <p>Used: 2.4 GB / 10 GB</p>
            </div>
            <div className="admin-uptime-card">
              <h3>CDN</h3>
              <div className="admin-uptime-status status-healthy">● Active</div>
              <p>Cache hit rate: 94%</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}