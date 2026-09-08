import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/client";
import TeamNav from "../../components/TeamNav";
import StatusBadge from "../../components/StatusBadge";
import type { AchievementItem, BlockerItem, HoursItem, ReportStatus, TaskItem } from "../../types";

interface ReportDetailData {
  id: number;
  project_name?: string;
  project_id: number;
  week_start: string;
  week_end: string;
  status: ReportStatus;
  current_version: number;
  tasks_completed: string;
  tasks_planned_next: string;
  blockers: string;
  achievements: string;
  hours_breakdown: string;
  notes: string;
  latestComment: { comment: string; action: string; created_at: string } | null;
}

interface VersionRow {
  id: number;
  version_no: number;
  snapshot: string;
  submitted_at: string;
}

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState<ReportDetailData | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
    loadVersions();
  }, [id]);

  async function loadReport() {
    setLoading(true);
    const res = await api.get(`/report/${id}`);
    setReport(res.data.data);
    setLoading(false);
  }

  async function loadVersions() {
    const res = await api.get(`/report/${id}/versions`);
    setVersions(res.data.data);
  }

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TeamNav />
        <p className="p-6 text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  const viewData: any = selectedVersion ? selectedVersion.snapshot : report;
  const tasks: TaskItem[] = (selectedVersion ? viewData.tasksCompleted : report.tasks_completed) || [];
  const blockers: BlockerItem[] = (selectedVersion ? viewData.blockers : report.blockers) || [];
  const achievements: AchievementItem[] =
    (selectedVersion ? viewData.achievements : report.achievements) || [];
  const hours: HoursItem[] = (selectedVersion ? viewData.hoursBreakdown : report.hours_breakdown) || [];
  const tasksPlannedNext = selectedVersion ? viewData.tasksPlannedNext : report.tasks_planned_next;
  const notes = selectedVersion ? viewData.notes : report.notes;

  return (
    <div className="min-h-screen bg-slate-50">
      <TeamNav />

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold text-slate-900">
            Week of {report.week_start} to {report.week_end}
          </h1>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-slate-500 mb-4">
          {report.project_name || `Project #${report.project_id}`}
        </p>

        {(report.status === "draft" || report.status === "needs_correction") && !selectedVersion && (
          <Link
            to={`/my-reports/${report.id}/edit`}
            className="inline-block mb-4 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition"
          >
            Edit report
          </Link>
        )}

        {report.latestComment && report.status === "needs_correction" && !selectedVersion && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4">
            <strong>Manager's comment:</strong> {report.latestComment.comment}
          </div>
        )}

        {selectedVersion && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-sm rounded-lg px-4 py-3 mb-4 flex items-center justify-between">
            <span>
              Viewing version {selectedVersion.version_no} (submitted{" "}
              {new Date(selectedVersion.submitted_at).toLocaleString()})
            </span>
            <button onClick={() => setSelectedVersion(null)} className="font-medium underline">
              Back to current
            </button>
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
                {tasks.map((t, i) => (
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

        {/* planned next */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Planned for next week</h2>
          <p className="text-sm text-slate-700">{tasksPlannedNext || "—"}</p>
        </div>

        {/* blockers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Blockers</h2>
          {blockers.length === 0 ? (
            <p className="text-xs text-slate-400">None reported.</p>
          ) : (
            <ul className="text-sm space-y-1.5 text-slate-700">
              {blockers.map((b, i) => (
                <li key={i}>
                  {b.isKey && <span className="text-amber-600 font-medium">Key: </span>}
                  {b.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* achievements */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Achievements</h2>
          {achievements.length === 0 ? (
            <p className="text-xs text-slate-400">None reported.</p>
          ) : (
            <ul className="text-sm space-y-1.5 text-slate-700">
              {achievements.map((a, i) => (
                <li key={i}>
                  {a.isKey && <span className="text-emerald-600 font-medium">Key: </span>}
                  {a.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* hours */}
        {hours.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Hours by task type</h2>
            <ul className="text-sm space-y-1.5 text-slate-700">
              {hours.map((h, i) => (
                <li key={i}>
                  {h.type}: {h.hours}h
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* notes */}
        {notes && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Notes</h2>
            <p className="text-sm text-slate-700">{notes}</p>
          </div>
        )}

        {/* version history */}
        {versions.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-2">Version history</h2>
            <ul className="text-sm space-y-2">
              {versions.map((v) => (
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