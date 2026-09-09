import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import ManagerNav from "../../components/ManagerNav";
import StatusBadge from "../../components/StatusBadge";
import type { Project, ReportStatus, User } from "../../types";

interface TeamReportRow {
  id: number;
  user_id: number;
  user_name: string;
  project_id: number;
  project_name: string;
  week_start: string;
  week_end: string;
  status: ReportStatus;
}

const STATUS_OPTIONS: { label: string; value: ReportStatus | "" }[] = [
  { label: "All statuses", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Needs correction", value: "needs_correction" },
  { label: "Approved", value: "approved" },
];

export default function ManagerReportsList() {
  const [reports, setReports] = useState<TeamReportRow[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  const [status, setStatus] = useState<ReportStatus | "">("");
  const [projectId, setProjectId] = useState("");
  const [userId, setUserId] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 10;

  useEffect(() => {
    api.get("/projects", { params: { limit: 50 } }).then((res) => setProjects(res.data.data));
    api.get("/users", { params: { role: "team_member", limit: 50 } }).then((res) =>
      setMembers(res.data.data)
    );
  }, []);

  useEffect(() => {
    loadReports();
  }, [status, projectId, userId, weekStart, weekEnd, page]);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await api.get("/report/team/all", {
        params: { status, projectId, userId, weekStart, weekEnd, page, limit, sortBy: "week_start", order: "desc" },
      });
      setReports(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setStatus("");
    setProjectId("");
    setUserId("");
    setWeekStart("");
    setWeekEnd("");
    setPage(1);
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerNav />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-5">Team reports</h1>

        {/* filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3 items-end shadow-sm">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Team member</label>
            <select
              value={userId}
              onChange={(e) => { setUserId(e.target.value); setPage(1); }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Project</label>
            <select
              value={projectId}
              onChange={(e) => { setProjectId(e.target.value); setPage(1); }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as ReportStatus | ""); setPage(1); }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Week start from</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => { setWeekStart(e.target.value); setPage(1); }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Week end to</label>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => { setWeekEnd(e.target.value); setPage(1); }}
              className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 pb-2"
          >
            Clear filters
          </button>
        </div>

        {/* results table */}
        {loading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-slate-500">No reports match these filters.</p>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2.5">Member</th>
                  <th className="px-4 py-2.5">Project</th>
                  <th className="px-4 py-2.5">Week</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                        {r.status === "submitted" ? "Review" : "View"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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