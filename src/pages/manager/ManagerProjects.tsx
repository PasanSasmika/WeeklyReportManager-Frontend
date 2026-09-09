import { useEffect, useState } from "react";
import api from "../../api/client";
import ManagerNav from "../../components/ManagerNav";
import type { Project } from "../../types";

export default function ManagerProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state - shared between "add new" and "edit existing"
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await api.get("/projects", { params: { limit: 50, sortBy: "name", order: "asc" } });
      setProjects(res.data.data);
    } finally {
      setLoading(false);
    }
  }

  function startAdd() {
    setEditingId(null);
    setName("");
    setDescription("");
    setError("");
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description || "");
    setError("");
  }

  async function handleSave() {
    if (name.trim() === "") {
      setError("Project name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, { name, description });
      } else {
        await api.post("/projects", { name, description });
      }
      startAdd(); // reset form
      loadProjects();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this project? This cannot be undone.")) return;

    try {
      await api.delete(`/projects/${id}`);
      loadProjects();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || "Failed to delete project.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerNav />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-5">Projects</h1>

        {/* add / edit form */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            {editingId ? "Edit project" : "Add new project"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition disabled:opacity-50"
            >
              {editingId ? "Save changes" : "Add project"}
            </button>
            {editingId && (
              <button
                onClick={startAdd}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* project list */}
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2.5">Name</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition">
                    <td className="px-4 py-2.5 text-slate-900 font-medium">{p.name}</td>
                    <td className="px-4 py-2.5 text-slate-500">{p.description || "—"}</td>
                    <td className="px-4 py-2.5 text-right space-x-4">
                      <button
                        onClick={() => startEdit(p)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs font-medium text-rose-500 hover:text-rose-600"
                      >
                        Delete
                      </button>
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