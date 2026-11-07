import { useState, useEffect } from "react";

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logLevel, setLogLevel] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 50;

  async function fetchLogs() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      if (logLevel) params.append("level", logLevel);
      const response = await fetch(`/api/admin/logs?${params}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load logs");
      setLogs(result.logs || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchLogs(); }, [logLevel, offset]);

  const levelColors = {
    info: "status-pill-info",
    warning: "status-pill-warning",
    error: "status-pill-error",
    critical: "status-pill-critical",
  };

  if (loading) return <div className="admin-loading">Loading logs...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">AUDIT TRAIL</span>
          <h1>System Logs</h1>
          <p>Monitor system activity, errors, and security events</p>
        </div>
      </header>

      {error && <div className="admin-alert is-error" role="alert">{error}</div>}

      <section className="admin-surface admin-requests-view">
        <div className="admin-section-heading">
          <div><span className="admin-eyebrow">SYSTEM LOGS</span><h2>Recent Activity</h2></div>
          <div className="admin-log-filters">
            <select value={logLevel} onChange={(e) => { setLogLevel(e.target.value); setOffset(0); }}>
              <option value="">All Levels</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
            <div className="admin-pagination">
              <button className="admin-secondary-button" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Previous</button>
              <span>Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}</span>
              <button className="admin-secondary-button" disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)}>Next</button>
            </div>
          </div>
        </div>
        <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Time</th><th>Level</th><th>Message</th><th>User</th><th>IP Address</th></tr></thead><tbody>
          {logs.map(log => <tr key={log.id}><td>{new Date(log.createdAt).toLocaleString()}</td><td><span className={`admin-status-pill ${levelColors[log.level] || ""}`}>{log.level}</span></td><td>{log.message}</td><td>{log.userName || "System"}</td><td>{log.ipAddress || "—"}</td></tr>)}
        </tbody></table>{!logs.length && <p className="admin-empty">No logs found.</p>}</div>
      </section>
    </div>
  );
}