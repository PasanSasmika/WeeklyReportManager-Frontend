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
      <div className="min-h-screen bg-gray-50">
        <ManagerNav />
        <p className="p-6 text-sm text-gray-500">Loading...</p>
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
    <div className="min-h-screen bg-gray-50">
      <ManagerNav />

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold">
            {report.user_name} — Week of {report.week_start} to {report.week_end}
          </h1>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-gray-500 mb-4">{report.project_name}</p>

        {selectedVersion && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md px-4 py-3 mb-4 flex items-center justify-between">
            <span>Viewing version {selectedVersion.version_no}</span>
            <button onClick={() => setSelectedVersion(null)} className="underline">
              Back to current
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-md px-3 py-2 mb-4">{error}</div>
        )}

        {/* tasks */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-medium mb-2">Tasks completed</h2>
          {tasks.length === 0 ? (
            <p className="text-xs text-gray-400">No tasks recorded.</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-1">Task</th>
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
                  <tr key={i} className="border-t border-gray-100">
                    <td className="py-1">{t.task}</td>
                    <td>{t.priority}</td>
                    <td>{t.plannedPct}%</td>
                    <td>{t.actualPct}%</td>
                    <td>{t.status}</td>
                    <td>{t.timePlanned}</td>
                    <td>{t.timeSpent}</td>
                    <td>{t.output}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-medium mb-2">Planned for next week</h2>
          <p className="text-sm text-gray-700">{tasksPlannedNext || "—"}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-medium mb-2">Blockers</h2>
          {blockers.length === 0 ? (
            <p className="text-xs text-gray-400">None reported.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {blockers.map((b: any, i: number) => (
                <li key={i}>
                  {b.isKey && <span className="text-amber-600 font-medium">Key: </span>}
                  {b.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-medium mb-2">Achievements</h2>
          {achievements.length === 0 ? (
            <p className="text-xs text-gray-400">None reported.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {achievements.map((a: any, i: number) => (
                <li key={i}>
                  {a.isKey && <span className="text-green-600 font-medium">Key: </span>}
                  {a.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {hours.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-medium mb-2">Hours by task type</h2>
            <ul className="text-sm space-y-1">
              {hours.map((h: any, i: number) => (
                <li key={i}>
                  {h.type}: {h.hours}h
                </li>
              ))}
            </ul>
          </div>
        )}

        {notes && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-medium mb-2">Notes</h2>
            <p className="text-sm text-gray-700">{notes}</p>
          </div>
        )}

        {/* review action - only when submitted and viewing current version */}
        {report.status === "submitted" && !selectedVersion && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-medium mb-2">Review this report</h2>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment (required if requesting changes)"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm mb-3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleReview("approved")}
                disabled={saving}
                className="bg-green-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleReview("changes_requested")}
                disabled={saving}
                className="bg-amber-600 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50"
              >
                Request changes
              </button>
            </div>
          </div>
        )}

        {/* comment history */}
        {report.comments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-medium mb-2">Review comment history</h2>
            <ul className="text-sm space-y-2">
              {report.comments.map((c) => (
                <li key={c.id} className="border-t border-gray-100 pt-2 first:border-0 first:pt-0">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>
                      {c.manager_name} — v{c.version_no} —{" "}
                      {c.action === "approved" ? "Approved" : "Requested changes"}
                    </span>
                    <span>{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  {c.comment && <p className="text-sm mt-1">{c.comment}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* version history */}
        {report.versions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-medium mb-2">Version history</h2>
            <ul className="text-sm space-y-2">
              {report.versions.map((v) => (
                <li key={v.id} className="flex items-center justify-between">
                  <span>
                    Version {v.version_no} — submitted {new Date(v.submitted_at).toLocaleString()}
                  </span>
                  <button
                    onClick={() => setSelectedVersion(v)}
                    className="text-xs text-blue-600 underline"
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