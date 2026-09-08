import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client";
import ManagerNav from "../../components/ManagerNav";
import StatusBadge from "../../components/StatusBadge";
import type { ManagerReportDetail as ReportDetailType } from "../../types";

export default function ManagerReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState<ReportDetailType | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    const res = await api.get(`/report/team/${id}`);
    setReport(res.data.data);
  }

  async function handleReview(action: "approved" | "changes_requested") {
    if (action === "changes_requested" && comment.trim() === "") {
      setError("Please add a comment describing what needs to change.");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await api.post(`/report/team/${id}/review`, { action, comment });
      navigate("/manager/reports");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to submit review.");
    } finally {
      setSaving(false);
    }
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ManagerNav />
        <p className="p-6 text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  // view either the live report, or a past version snapshot
  const viewData: any = selectedVersion ? selectedVersion.snapshot : report;
  const tasks = selectedVersion ? viewData.tasksCompleted || [] : report.tasks_completed || [];
  const blockers = selectedVersion ? viewData.blockers || [] : report.blockers || [];
  const achievements = selectedVersion ? viewData.achievements || [] : report.achievements || [];
  const hours = selectedVersion ? viewData.hoursBreakdown || [] : report.hours_breakdown || [];
  const notes = selectedVersion ? viewData.notes : report.notes;
  const tasksPlannedNext = selectedVersion ? viewData.tasksPlannedNext : report.tasks_planned_next;

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerNav />

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold text-slate-900">
            {report.user_name} — Week of {report.week_start} to {report.week_end}
          </h1>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-slate-500 mb-4">{report.project_name}</p>

        {selectedVersion && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
            <span>Viewing version {selectedVersion.version_no}</span>
            <button onClick={() => setSelectedVersion(null)} className=" font-medium">
              Back to current
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {/* tasks */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Tasks completed</h2>
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-400">No tasks recorded.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-1.5">Task</th>
                  <th>Priority</th>
                  <th>Planned %</th>
                  <th>Actual %</th>
                  <th>Status</th>
                  <th>Planned h</th>
                  <th>Spent h</th>
                  <th>Output</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-1.5 text-slate-800">{t.task}</td>
                    <td className="text-slate-600">{t.priority}</td>
                    <td className="text-slate-600">{t.plannedPct}%</td>
                    <td className="text-slate-600">{t.actualPct}%</td>
                    <td className="text-slate-600">{t.status}</td>
                    <td className="text-slate-600">{t.timePlanned}</td>
                    <td className="text-slate-600">{t.timeSpent}</td>
                    <td className="text-slate-600">{t.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Planned for next week</h2>
          <p className="text-sm text-slate-700">{tasksPlannedNext || "—"}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Blockers</h2>
          {blockers.length === 0 ? (
            <p className="text-xs text-slate-400">None reported.</p>
          ) : (
            <ul className="text-sm space-y-1.5 text-slate-700">
              {blockers.map((b: any, i: number) => (
                <li key={i}>
                  {b.isKey && <span className="text-amber-600 font-medium">Key: </span>}
                  {b.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Achievements</h2>
          {achievements.length === 0 ? (
            <p className="text-xs text-slate-400">None reported.</p>
          ) : (
            <ul className="text-sm space-y-1.5 text-slate-700">
              {achievements.map((a: any, i: number) => (
                <li key={i}>
                  {a.isKey && <span className="text-emerald-600 font-medium">Key: </span>}
                  {a.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {hours.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Hours by task type</h2>
            <ul className="text-sm space-y-1.5 text-slate-700">
              {hours.map((h: any, i: number) => (
                <li key={i}>
                  {h.type}: {h.hours}h
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Notes</h2>
            <p className="text-sm text-slate-700">{notes}</p>
          </div>
        )}

        {/* review action - only when submitted and viewing current version */}
        {report.status === "submitted" && !selectedVersion && (
          <div className="bg-white border border-indigo-200 rounded-xl p-4 mb-4 shadow-sm ring-1 ring-indigo-50">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Review this report</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment (required if requesting changes)"
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleReview("approved")}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleReview("changes_requested")}
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                Request changes
              </button>
            </div>
          </div>
        )}

        {/* comment history */}
        {report.comments.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Review comment history</h2>
            <ul className="text-sm space-y-2.5">
              {report.comments.map((c) => (
                <li key={c.id} className="border-t border-slate-100 pt-2.5 first:border-0 first:pt-0">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      {c.manager_name} — v{c.version_no} —{" "}
                      <span className={c.action === "approved" ? "text-emerald-600" : "text-amber-600"}>
                        {c.action === "approved" ? "Approved" : "Requested changes"}
                      </span>
                    </span>
                    <span>{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  {c.comment && <p className="text-sm text-slate-700 mt-1">{c.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* version history */}
        {report.versions.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Version history</h2>
            <ul className="text-sm space-y-2">
              {report.versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between text-slate-700">
                  <span>
                    Version {v.version_no} — submitted {new Date(v.submitted_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedVersion(v)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}