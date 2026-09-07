import { useEffect, useState } from "react";
import api from "../../api/client";
import ManagerNav from "../../components/ManagerNav";
import type { Role, User } from "../../types";
import { useAuth } from "../../context/authContext";

export default function ManagerUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // invite form state
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
    <div className="min-h-screen bg-gray-50">
      <ManagerNav />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-lg font-semibold mb-4">User management</h1>

        {/* invite form */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium mb-2">Invite a new user</h2>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-3">{error}</div>
          )}

          <div className="grid grid-cols-4 gap-3 mb-3">
            <input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            <input
              placeholder="Temporary password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            >
              <option value="team_member">Team member</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <button
            onClick={handleInvite}
            disabled={saving}
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
          >
            Add user
          </button>
        </div>

        {/* user list */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100">
                    <td className="px-4 py-2">{u.name}</td>
                    <td className="px-4 py-2 text-gray-500">{u.email}</td>
                    <td className="px-4 py-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        disabled={u.id === currentUser?.id}
                        className="border border-gray-300 rounded-md px-2 py-1 text-xs disabled:opacity-50"
                      >
                        <option value="team_member">Team member</option>
                        <option value="manager">Manager</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleRemove(u.id)}
                          className="text-xs text-red-500 underline"
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