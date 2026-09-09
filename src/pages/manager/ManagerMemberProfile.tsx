import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";
import ManagerNav from "../../components/ManagerNav";
import StatusBadge from "../../components/StatusBadge";
import type { ReportStatus, User } from "../../types";

interface TeamReportRow {
  id: number;
  project_name: string;
  week_start: string;
  week_end: string;
  status: ReportStatus;
}

export default function ManagerMemberProfile() {
  const { id } = useParams();
  const [member, setMember] = useState<User | null>(null);
  const [reports, setReports] = useState<TeamReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    setLoading(true);
    const [userRes, reportsRes] = await Promise.all([
      api.get(`/users/${id}`),
      api.get("/report/team/all", { params: { userId: id, limit: 50, sortBy: "week_start", order: "desc" } }),
    ]);
    setMember(userRes.data.data);
    setReports(reportsRes.data.data);
    setLoading(false);
  }

  if (loading || !member) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManagerNav />
        <p className="p-6 text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  // basic stats computed from the report list
  const totalReports = reports.length;
  const approvedCount = reports.filter((r) => r.status === "approved").length;
  const needsCorrectionCount = reports.filter((r) => r.status === "needs_correction").length;
  const complianceRate = totalReports === 0 ? 0 : Math.round((approvedCount / totalReports) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerNav />

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold">
            {member.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{member.name}</h1>
            <p className="text-sm text-slate-500">{member.email}</p>
          </div>
        </div>

        {/* basic stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Total reports</p>
            <p className="text-2xl font-semibold text-slate-900">{totalReports}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Approved</p>
            <p className="text-2xl font-semibold text-emerald-600">{approvedCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Needs correction</p>
            <p className="text-2xl font-semibold text-amber-600">{needsCorrectionCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-1">Approval rate</p>
            <p className="text-2xl font-semibold text-indigo-600">{complianceRate}%</p>
          </div>
        </div>

        {/* full report history */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Report history</h2>
          </div>
          {reports.length === 0 ? (
            <p className="text-sm text-slate-500 p-4">No reports yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2.5">Project</th>
                  <th className="px-4 py-2.5">Week</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition">
                    <td className="px-4 py-2.5 text-slate-800">{r.project_name}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {r.week_start} - {r.week_end}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        to={`/manager/reports/${r.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}