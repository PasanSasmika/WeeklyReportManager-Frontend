import { useEffect, useState } from "react";
import api from "../../api/client";
import ManagerNav from "../../components/ManagerNav";

interface AuditEntry {
  id: number;
  actor_name: string;
  action: string;
  target_type: string;
  target_id: number;
  details: string;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  report_submitted: "Submitted a report",
  report_approved: "Approved a report",
  report_changes_requested: "Requested changes on a report",
  project_created: "Created a project",
  project_updated: "Updated a project",
  project_deleted: "Deleted a project",
  user_created: "Added a user",
  user_role_changed: "Changed a user's role",
  user_removed: "Removed a user",
};

const ACTION_COLORS: Record<string, string> = {
  report_submitted: "bg-indigo-50 text-indigo-700",
  report_approved: "bg-emerald-50 text-emerald-700",
  report_changes_requested: "bg-amber-50 text-amber-700",
  project_created: "bg-indigo-50 text-indigo-700",
  project_updated: "bg-slate-100 text-slate-700",
  project_deleted: "bg-rose-50 text-rose-700",
  user_created: "bg-indigo-50 text-indigo-700",
  user_role_changed: "bg-slate-100 text-slate-700",
  user_removed: "bg-rose-50 text-rose-700",
};

export default function ManagerAuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 20;

  useEffect(() => {
    loadLog();
  }, [page]);

  async function loadLog() {
    setLoading(true);
    try {
      const res = await api.get("/audit", { params: { page, limit } });
      setEntries(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerNav />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-5">Audit log</h1>

        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-500">No activity recorded yet.</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <ul className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <li key={entry.id} className="px-4 py-3 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          ACTION_COLORS[entry.action] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {ACTION_LABELS[entry.action] || entry.action}
                      </span>
                      <span className="text-sm text-slate-700">{entry.actor_name}</span>
                    </div>
                    {entry.details && <p className="text-xs text-slate-500">{entry.details}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">
                      {entry.target_type} #{entry.target_id}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4 text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Previous
            </button>
            <span className="text-slate-500">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}