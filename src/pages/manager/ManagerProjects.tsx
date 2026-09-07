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
    <div className="min-h-screen bg-gray-50">
      <ManagerNav />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-lg font-semibold mb-4">Projects</h1>

        {/* add / edit form */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-medium mb-2">
            {editingId ? "Edit project" : "Add new project"}
          </h2>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-3">{error}</div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
            <input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
            >
              {editingId ? "Save changes" : "Add project"}
            </button>
            {editingId && (
              <button onClick={startAdd} className="text-sm text-gray-500 px-4 py-2">
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* project list */}
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100">
                    <td className="px-4 py-2">{p.name}</td>
                    <td className="px-4 py-2 text-gray-500">{p.description || "—"}</td>
                    <td className="px-4 py-2 text-right space-x-3">
                      <button
                        onClick={() => startEdit(p)}
                        className="text-xs text-blue-600 underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs text-red-500 underline"
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