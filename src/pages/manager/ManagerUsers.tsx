import { useEffect, useState } from "react";
import api from "../../api/client";
import ManagerNav from "../../components/ManagerNav";
import type { Role, User } from "../../types";
import { useAuth } from "../../context/authContext";
import { Link } from "react-router-dom";

export default function ManagerUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("team_member");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await api.get("/users", { params: { limit: 50 } });
      setUsers(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite() {
    if (!name || !email || !password) {
      setError("Name, email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await api.post("/users", { name, email, password, role });
      setName("");
      setEmail("");
      setPassword("");
      setRole("team_member");
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to add user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRoleChange(id: number, newRole: Role) {
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to update role.");
    }
  }

  async function handleRemove(id: number) {
    if (!confirm("Remove this user? Their reports will also be deleted. This cannot be undone.")) return;

    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to remove user.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerNav />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-5">User management</h1>

        {/* invite form */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Invite a new user</h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-3">
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <input
              placeholder="Temporary password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >
              <option value="team_member">Team member</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <button
            onClick={handleInvite}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition disabled:opacity-50"
          >
            Add user
          </button>
        </div>

        {/* user list */}
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        disabled={u.id === currentUser?.id}
                        className="border border-slate-300 rounded-lg px-2 py-1 text-xs disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="team_member">Team member</option>
                        <option value="manager">Manager</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleRemove(u.id)}
                          className="text-xs font-medium text-rose-500 hover:text-rose-600"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}