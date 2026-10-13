import { useState, useEffect } from "react";

const ROLE_LABELS = {
  super_admin: "Super Admin",
  editor: "Editor",
  viewer: "Viewer",
  customer: "Customer",
};

const ROLE_BADGES = {
  super_admin: "badge-purple",
  editor: "badge-blue",
  viewer: "badge-gray",
  customer: "badge-green",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [activeTab, setActiveTab] = useState("users");

  const userForm = {
    name: "",
    email: "",
    adminRole: "viewer",
    teamId: "",
    isActive: true,
    password: "",
  };
  const teamForm = {
    name: "",
    description: "",
    permissions: {},
  };

  async function fetchData() {
    setLoading(true);
    setError("");
    try {
      const [usersRes, teamsRes] = await Promise.all([
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/teams", { cache: "no-store" }),
      ]);
      const usersData = await usersRes.json();
      const teamsData = await teamsRes.json();
      if (!usersRes.ok) throw new Error(usersData.error || "Failed to load users");
      if (!teamsRes.ok) throw new Error(teamsData.error || "Failed to load teams");
      setUsers(usersData.users || []);
      setTeams(teamsData.teams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleUserSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
      const method = editingUser ? "PATCH" : "POST";
      const body = editingUser ? { ...userForm } : { ...userForm };
      if (editingUser && !body.password) delete body.password;
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to save user");
      setNotice(editingUser ? "User updated successfully" : "User created successfully");
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTeamSubmit(event) {
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
      setNotice(editingTeam ? "Team updated successfully" : "Team created successfully");
      setShowTeamModal(false);
      setEditingTeam(null);
      resetTeamForm();
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm("Delete this user permanently?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete user");
      setNotice("User deleted");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTeam(id) {
    if (!window.confirm("Delete this team permanently?")) return;
    setError("");
    try {
      const response = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete team");
      setNotice("Team deleted");
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  }

  function resetUserForm() {
    setUserForm({ name: "", email: "", adminRole: "viewer", teamId: "", isActive: true, password: "" });
  }

  function resetTeamForm() {
    setTeamForm({ name: "", description: "", permissions: {} });
  }

  function openEditUser(user) {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      adminRole: user.adminRole || "viewer",
      teamId: user.teamId || "",
      isActive: user.isActive !== false,
      password: "",
    });
    setShowUserModal(true);
  }

  function openEditTeam(team) {
    setEditingTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description || "",
      permissions: team.permissions || {},
    });
    setShowTeamModal(true);
  }

  function setUserForm(values) {
    setUserForm(prev => ({ ...prev, ...values }));
  }

  function setTeamForm(values) {
    setTeamForm(prev => ({ ...prev, ...values }));
  }

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">ADMINISTRATION</span>
          <h1>User Management</h1>
          <p>Manage administrator accounts, roles, and team assignments</p>
        </div>
        <div className="admin-page-actions">
          <button className="admin-secondary-button" onClick={() => { resetUserForm(); setEditingUser(null); setShowUserModal(true); }}>
            Add User
          </button>
          <button className="admin-secondary-button" onClick={() => { resetTeamForm(); setEditingTeam(null); setShowTeamModal(true); }}>
            Add Team
          </button>
        </div>
      </header>

      {(error || notice) && <div className={`admin-alert ${error ? "is-error" : "is-success"}`} role={error ? "alert" : "status"}>{error || notice}</div>}

      <div className="admin-tabs">
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>Users</button>
        <button className={activeTab === "teams" ? "active" : ""} onClick={() => setActiveTab("teams")}>Teams</button>
      </div>

      {activeTab === "users" && (
        <section className="admin-surface">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>MFA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </td>
                    <td>
                      <span className={`admin-role-badge ${ROLE_BADGES[user.adminRole] || ROLE_BADGES.customer}`}>
                        {ROLE_LABELS[user.adminRole] || ROLE_LABELS.customer}
                      </span>
                    </td>
                    <td>{user.teamName || "—"}</td>
                    <td>
                      <span className={user.isActive ? "status-active" : "status-inactive"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}</td>
                    <td>{user.mfaEnabled ? "✅ Enabled" : "❌ Disabled"}</td>
                    <td>
                      <button className="admin-action-button" onClick={() => openEditUser(user)}>Edit</button>
                      <button className="admin-action-button admin-danger-button" onClick={() => deleteUser(user.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!users.length && <p className="admin-empty">No admin users found.</p>}
          </div>
        </section>
      )}

      {activeTab === "teams" && (
        <section className="admin-surface">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Description</th>
                  <th>Members</th>
                  <th>Permissions</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team) => (
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
                      <button className="admin-action-button" onClick={() => openEditTeam(team)}>Edit</button>
                      <button className="admin-action-button admin-danger-button" onClick={() => deleteTeam(team.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!teams.length && <p className="admin-empty">No teams created yet.</p>}
          </div>
        </section>
      )}

      {showUserModal && (
        <div className="admin-modal-backdrop" onClick={() => { setShowUserModal(false); setEditingUser(null); resetUserForm(); }}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
            <header className="admin-modal-heading">
              <div>
                <span className="admin-eyebrow">USER MANAGEMENT</span>
                <h2 id="user-modal-title">{editingUser ? "Edit User" : "Add New User"}</h2>
                <p>{editingUser ? "Update user details and role assignments" : "Create a new administrator account"}</p>
              </div>
              <button className="admin-modal-close" onClick={() => { setShowUserModal(false); setEditingUser(null); resetUserForm(); }}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={handleUserSubmit}>
              <label>Full Name<input required maxLength={160} value={userForm.name} onChange={(e) => setUserForm({ name: e.target.value })} /></label>
              <label>Email<input required type="email" value={userForm.email} onChange={(e) => setUserForm({ email: e.target.value })} /></label>
              <label>Admin Role<select value={userForm.adminRole} onChange={(e) => setUserForm({ adminRole: e.target.value })}>
                <option value="super_admin">Super Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select></label>
              <label>Team<select value={userForm.teamId} onChange={(e) => setUserForm({ teamId: e.target.value })}>
                <option value="">No team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select></label>
              <label className="admin-checkbox"><input type="checkbox" checked={userForm.isActive} onChange={(e) => setUserForm({ isActive: e.target.checked })} /> Active account</label>
              <label>{editingUser ? "New Password (leave blank to keep current)" : "Password"}<input type="password" minLength={8} value={userForm.password} onChange={(e) => setUserForm({ password: e.target.value })} placeholder={editingUser ? "••••••••" : "Enter password"} /></label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => { setShowUserModal(false); setEditingUser(null); resetUserForm(); }}>Cancel</button>
                <button type="submit" className="admin-primary-button">{editingUser ? "Save Changes" : "Create User"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showTeamModal && (
        <div className="admin-modal-backdrop" onClick={() => { setShowTeamModal(false); setEditingTeam(null); resetTeamForm(); }}>
          <section className="admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="team-modal-title">
            <header className="admin-modal-heading">
              <div>
                <span className="admin-eyebrow">TEAM MANAGEMENT</span>
                <h2 id="team-modal-title">{editingTeam ? "Edit Team" : "Create New Team"}</h2>
                <p>{editingTeam ? "Update team details and permissions" : "Create a new team for grouping users"}</p>
              </div>
              <button className="admin-modal-close" onClick={() => { setShowTeamModal(false); setEditingTeam(null); resetTeamForm(); }}>×</button>
            </header>
            <form className="admin-edit-form" onSubmit={handleTeamSubmit}>
              <label>Team Name<input required maxLength={100} value={teamForm.name} onChange={(e) => setTeamForm({ name: e.target.value })} /></label>
              <label className="admin-full-field">Description<textarea maxLength={500} rows={3} value={teamForm.description} onChange={(e) => setTeamForm({ description: e.target.value })} /></label>
              <label className="admin-full-field">Permissions (JSON)<textarea maxLength={2000} rows={4} value={JSON.stringify(teamForm.permissions, null, 2)} onChange={(e) => { try { setTeamForm({ permissions: JSON.parse(e.target.value) }); } catch {} }} placeholder='{"content:create": true, "settings:read": true}' /></label>
              {error && <p className="admin-modal-error" role="alert">{error}</p>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => { setShowTeamModal(false); setEditingTeam(null); resetTeamForm(); }}>Cancel</button>
                <button type="submit" className="admin-primary-button">{editingTeam ? "Save Changes" : "Create Team"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}