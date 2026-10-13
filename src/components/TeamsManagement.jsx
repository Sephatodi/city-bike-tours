import { useState, useEffect } from "react";

export default function TeamsManagement() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const teamForm = {
    name: "",
    description: "",
    permissions: {},
  };

  async function fetchTeams() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/teams", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to load teams");
      setTeams(result.teams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchTeams(); }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const url = editingTeam ? `/api/admin/teams/${editingTeam.id}` : "/api/admin/teams";
      const method = editingTeam ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teamForm),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save team");
      setNotice(editingTeam ? "Team updated" : "Team created");
      setShowTeamModal(false);
      setEditingTeam(null);
      resetForm();
      fetchTeams();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTeam(id) {
    if (!window.confirm("Delete this team permanently?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      setNotice("Team deleted");
      fetchTeams();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setTeamForm({ name: "", description: "", permissions: {} });
  }

  function setTeamForm(data) {
    setTeamForm(prev => ({ ...prev, ...data }));
  }

  function openEdit(team) {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description || "",
      permissions: team.permissions || {},
    });
    setShowTeamModal(true);
  }

  if (loading) return <div className="admin-loading">Loading teams...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">ADMINISTRATION</span>
          <h1>Teams & Groups</h1>
          <p>Organize users into teams with shared permissions</p>
        </div>
        <button className="admin-primary-button" onClick={() => { resetForm(); setEditingTeam(null); setShowTeamModal(true); }}>Add Team</button>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <section className="admin-surface">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Team Name</th><th>Description</th><th>Members</th><th>Permissions</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id}>
                  <td><strong>{team.name}</strong></td>
                  <td>{team.description || "—"}</td>
                  <td>{team.memberCount || 0}</td>
                  <td>
                    <span className="admin-permissions-preview">
                      {Object.keys(team.permissions || {}).length > 0 
                        ? Object.keys(team.permissions).slice(0, 3).join(", ") + (Object.keys(team.permissions).length > 3 ? "..." : "")
                        : "No custom permissions"}
                    </span>
                  </td>
                  <td>{new Date(team.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="admin-action-button" onClick={() => openEdit(team)}>Edit</button>
                    <button className="admin-action-button admin-danger-button" onClick={() => deleteTeam(team.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!teams.length && <p className="admin-empty">No teams created yet.</p>}
        </div>
      </section>

      {showTeamModal && (
        <div className="admin-modal-backdrop" onClick={() => { setShowTeamModal(false); setEditingTeam(null); resetForm(); }}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="team-modal-title">
            <header className="admin-modal-heading">
              <div><span className="admin-eyebrow">TEAM MANAGEMENT</span><h2 id="team-modal-title">{editingTeam ? "Edit Team" : "Create New Team"}</h2></div>
              <button className="admin-modal-close" onClick={() => { setShowTeamModal(false); setEditingTeam(null); resetForm(); }}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={handleSubmit}>
              <label>Team Name<input required maxLength={100} value={teamForm.name} onChange={(e) => setTeamForm({ name: e.target.value })} /></label>
              <label className="admin-full-field">Description<textarea maxLength={500} rows={3} value={teamForm.description} onChange={(e) => setTeamForm({ description: e.target.value })} /></label>
              <label className="admin-full-field">Permissions (JSON)<textarea maxLength={2000} rows={4} value={JSON.stringify(teamForm.permissions, null, 2)} onChange={(e) => { try { setTeamForm({ permissions: JSON.parse(e.target.value) }); } catch {} }} placeholder='{"content:create": true, "settings:read": true}' /></label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => { setShowTeamModal(false); setEditingTeam(null); resetForm(); }}>Cancel</button>
                <button type="submit" className="admin-primary-button">{editingTeam ? "Save Changes" : "Create Team"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}