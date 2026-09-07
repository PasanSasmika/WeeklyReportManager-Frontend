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
      <div className="min-h-screen bg-gray-50">
        <TeamNav />
        <p className="p-6 text-sm text-gray-500">Loading...</p>
      </div>
    );
  }

  // when viewing a past version, show that snapshot's data instead of the live report
  const viewData: any = selectedVersion ? selectedVersion.snapshot : report;
  const tasks: TaskItem[] = (selectedVersion ? viewData.tasksCompleted : report.tasks_completed) || [];
  const blockers: BlockerItem[] = (selectedVersion ? viewData.blockers : report.blockers) || [];
  const achievements: AchievementItem[] =
    (selectedVersion ? viewData.achievements : report.achievements) || [];
  const hours: HoursItem[] = (selectedVersion ? viewData.hoursBreakdown : report.hours_breakdown) || [];
  const tasksPlannedNext = selectedVersion ? viewData.tasksPlannedNext : report.tasks_planned_next;
  const notes = selectedVersion ? viewData.notes : report.notes;

  return (
    <div className="min-h-screen bg-gray-50">
      <TeamNav />

      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-semibold">
            Week of {report.week_start} to {report.week_end}
          </h1>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {report.project_name || `Project #${report.project_id}`}
        </p>

        {(report.status === "draft" || report.status === "needs_correction") && !selectedVersion && (
          <Link
            to={`/my-reports/${report.id}/edit`}
            className="inline-block mb-4 text-sm bg-gray-900 text-white px-4 py-2 rounded-md"
          >
            Edit report
          </Link>
        )}

        {report.latestComment && report.status === "needs_correction" && !selectedVersion && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-md px-4 py-3 mb-4">
            <strong>Manager's comment:</strong> {report.latestComment.comment}
          </div>
        )}

        {selectedVersion && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-md px-4 py-3 mb-4 flex items-center justify-between">
            <span>
              Viewing version {selectedVersion.version_no} (submitted{" "}
              {new Date(selectedVersion.submitted_at).toLocaleString()})
            </span>
            <button onClick={() => setSelectedVersion(null)} className="underline">
              Back to current
            </button>
          </div>
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
                {tasks.map((t, i) => (
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

        {/* planned next */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-medium mb-2">Planned for next week</h2>
          <p className="text-sm text-gray-700">{tasksPlannedNext || "—"}</p>
        </div>

        {/* blockers */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-medium mb-2">Blockers</h2>
          {blockers.length === 0 ? (
            <p className="text-xs text-gray-400">None reported.</p>
          ) : (
            <ul className="text-sm space-y-1">
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-medium mb-2">Achievements</h2>
          {achievements.length === 0 ? (
            <p className="text-xs text-gray-400">None reported.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {achievements.map((a, i) => (
                <li key={i}>
                  {a.isKey && <span className="text-green-600 font-medium">Key: </span>}
                  {a.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* hours */}
        {hours.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-medium mb-2">Hours by task type</h2>
            <ul className="text-sm space-y-1">
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
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <h2 className="text-sm font-medium mb-2">Notes</h2>
            <p className="text-sm text-gray-700">{notes}</p>
          </div>
        )}

        {/* version history */}
        {versions.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-sm font-medium mb-2">Version history</h2>
            <ul className="text-sm space-y-2">
              {versions.map((v) => (
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