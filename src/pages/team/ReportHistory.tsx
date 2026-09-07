import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";
import TeamNav from "../../components/TeamNav";
import StatusBadge from "../../components/StatusBadge";
import type { ReportStatus } from "../../types";
import type { Report } from "../../types";

const STATUS_TABS: { label: string; value: ReportStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Needs correction", value: "needs_correction" },
  { label: "Approved", value: "approved" },
];

export default function ReportHistory() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const limit = 10;

  useEffect(() => {
    loadReports();
  }, [statusFilter, page]);

  async function loadReports() {
    setLoading(true);
    try {
      const res = await api.get("/reports", {
        params: { status: statusFilter, page, limit, sortBy: "week_start", order: "desc" },
      });
      setReports(res.data.data);
      setTotal(res.data.meta.total);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <TeamNav />

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">My weekly reports</h1>
          <Link
            to="/my-reports/new"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md"
          >
            New report
          </Link>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`text-xs px-3 py-1 rounded-full border ${
                statusFilter === tab.value
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-sm text-gray-500">No reports found for this filter.</p>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                to={`/my-reports/${report.id}`}
                className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-400"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Week of {report.week_start} to {report.week_end}
                  </span>
                  <StatusBadge status={report.status} />
                </div>
                <span className="text-xs text-gray-500">
                  {report.project_name || `Project #${report.project_id}`}
                </span>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6 text-sm">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}