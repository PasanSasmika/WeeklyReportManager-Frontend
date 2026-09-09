import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import TeamNav from "../../components/TeamNav";
import type { AchievementItem, BlockerItem, HoursItem, Project, TaskItem } from "../../types";

const EMPTY_TASK: TaskItem = {
  task: "",
  priority: "medium",
  plannedPct: 0,
  actualPct: 0,
  status: "not_started",
  timePlanned: 0,
  timeSpent: 0,
  output: "",
};

export default function ReportForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number | "">("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([{ ...EMPTY_TASK }]);
  const [tasksPlannedNext, setTasksPlannedNext] = useState("");
  const [blockers, setBlockers] = useState<BlockerItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [hours, setHours] = useState<HoursItem[]>([]);
  const [notes, setNotes] = useState("");

const [correctionComment, setCorrectionComment] = useState("");
const [reportStatus, setReportStatus] = useState<string>("draft");
const [error, setError] = useState("");
const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/projects", { params: { limit: 50 } }).then((res) => setProjects(res.data.data));
  }, []);

useEffect(() => {
  if (!isEditMode) return;
  api.get(`/report/${id}`).then((res) => {
    const r = res.data.data;
    setProjectId(r.project_id);
    setWeekStart(r.week_start.slice(0, 10));
    setWeekEnd(r.week_end.slice(0, 10));
    setTasks(r.tasks_completed || []);
    setTasksPlannedNext(r.tasks_planned_next || "");
    setBlockers(r.blockers || []);
    setAchievements(r.achievements || []);
    setHours(r.hours_breakdown || []);
    setNotes(r.notes || "");
    setReportStatus(r.status);
    if (r.latestComment && r.status === "needs_correction") {
      setCorrectionComment(r.latestComment.comment);
    }
  });
}, [id]);

  function buildPayload() {
    return {
      projectId,
      weekStart,
      weekEnd,
      tasksCompleted: tasks,
      tasksPlannedNext,
      blockers,
      achievements,
      hoursBreakdown: hours,
      notes,
    };
  }

  function validate(): string {
    if (!projectId) return "Please select a project.";
    if (!weekStart || !weekEnd) return "Please set the week start and end dates.";
    if (tasks.some((t) => t.task.trim() === "")) return "Every task row needs a task name.";
    return "";
  }

  async function handleSaveDraft() {
    const validationError = validate();
    if (validationError) return setError(validationError);

    setError("");
    setSaving(true);
    try {
      if (isEditMode) {
        await api.put(`/report/${id}`, buildPayload());
      } else {
        const res = await api.post("/report", buildPayload());
        navigate(`/my-reports/${res.data.data.id}/edit`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    const validationError = validate();
    if (validationError) return setError(validationError);

    setError("");
    setSaving(true);
    try {
      let reportId = id;
      if (isEditMode) {
        await api.put(`/report/${id}`, buildPayload());
      } else {
        const res = await api.post("/report", buildPayload());
        reportId = res.data.data.id;
      }
      await api.post(`/report/${reportId}/submit`);
      navigate("/my-reports");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to submit.");
    } finally {
      setSaving(false);
    }
  }

  function updateTask(index: number, field: keyof TaskItem, value: any) {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }
  function addTask() {
    setTasks((prev) => [...prev, { ...EMPTY_TASK }]);
  }
  function removeTask(index: number) {
    setTasks((prev) => prev.filter((_, i) => i !== index));
  }

  function addBlocker() {
    setBlockers((prev) => [...prev, { text: "", isKey: false }]);
  }
  function updateBlocker(index: number, field: keyof BlockerItem, value: any) {
    setBlockers((prev) => prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)));
  }
  function setKeyBlocker(index: number) {
    setBlockers((prev) => prev.map((b, i) => ({ ...b, isKey: i === index })));
  }
  function removeBlocker(index: number) {
    setBlockers((prev) => prev.filter((_, i) => i !== index));
  }

  function addAchievement() {
    setAchievements((prev) => [...prev, { text: "", isKey: false }]);
  }
  function updateAchievement(index: number, field: keyof AchievementItem, value: any) {
    setAchievements((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }
  function setKeyAchievement(index: number) {
    setAchievements((prev) => prev.map((a, i) => ({ ...a, isKey: i === index })));
  }
  function removeAchievement(index: number) {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  }

  function addHoursRow() {
    setHours((prev) => [...prev, { type: "Development", hours: 0 }]);
  }
  function updateHoursRow(index: number, field: keyof HoursItem, value: any) {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  }
  function removeHoursRow(index: number) {
    setHours((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TeamNav />

      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-900 mb-5">
          {isEditMode ? "Edit weekly report" : "New weekly report"}
        </h1>

        {correctionComment && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4">
            <strong>Manager's comment:</strong> {correctionComment}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2 mb-4">
            {error}
          </div>
        )}

        {/* week + project */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 grid grid-cols-3 gap-4 shadow-sm">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Week start</label>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Week end</label>
            <input
              type="date"
              value={weekEnd}
              onChange={(e) => setWeekEnd(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* tasks table */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900">Tasks completed</h2>
            <button onClick={addTask} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              + Add task
            </button>
          </div>
          {tasks.map((task, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-3 mb-2 bg-slate-50/40">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Task name</label>
                  <input
                    placeholder="Task name"
                    value={task.task}
                    onChange={(e) => updateTask(i, "task", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask(i, "priority", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium priority</option>
                    <option value="high">High priority</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-2">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Planned %</label>
                  <input
                    type="number"
                    value={task.plannedPct}
                    onChange={(e) => updateTask(i, "plannedPct", Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Actual %</label>
                  <input
                    type="number"
                    value={task.actualPct}
                    onChange={(e) => updateTask(i, "actualPct", Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                  <select
                    value={task.status}
                    onChange={(e) => updateTask(i, "status", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="not_started">Not started</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Time planned (h)</label>
                  <input
                    type="number"
                    value={task.timePlanned}
                    onChange={(e) => updateTask(i, "timePlanned", Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Time spent (h)</label>
                  <input
                    type="number"
                    value={task.timeSpent}
                    onChange={(e) => updateTask(i, "timeSpent", Number(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Output / deliverable</label>
                  <input
                    placeholder="Output / deliverable"
                    value={task.output}
                    onChange={(e) => updateTask(i, "output", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <button onClick={() => removeTask(i)} className="text-xs font-medium text-rose-500 hover:text-rose-600 pb-2">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* tasks planned next week */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Tasks planned for next week</h2>
          <textarea
            value={tasksPlannedNext}
            onChange={(e) => setTasksPlannedNext(e.target.value)}
            rows={3}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* blockers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">Blockers / challenges</h2>
            <button onClick={addBlocker} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              + Add blocker
            </button>
          </div>
          {blockers.map((b, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="keyBlocker"
                checked={b.isKey}
                onChange={() => setKeyBlocker(i)}
                title="Mark as key blocker"
                className="accent-indigo-600"
              />
              <input
                value={b.text}
                onChange={(e) => updateBlocker(i, "text", e.target.value)}
                placeholder="Describe the blocker"
                className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button onClick={() => removeBlocker(i)} className="text-xs font-medium text-rose-500 hover:text-rose-600">
                Remove
              </button>
            </div>
          ))}
          {blockers.length > 0 && (
            <p className="text-xs text-slate-400">Select the radio button to mark the key blocker.</p>
          )}
        </div>

        {/* achievements */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">Achievements / highlights</h2>
            <button onClick={addAchievement} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              + Add achievement
            </button>
          </div>
          {achievements.map((a, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <input
                type="radio"
                name="keyAchievement"
                checked={a.isKey}
                onChange={() => setKeyAchievement(i)}
                title="Mark as key achievement"
                className="accent-indigo-600"
              />
              <input
                value={a.text}
                onChange={(e) => updateAchievement(i, "text", e.target.value)}
                placeholder="Describe the achievement"
                className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button onClick={() => removeAchievement(i)} className="text-xs font-medium text-rose-500 hover:text-rose-600">
                Remove
              </button>
            </div>
          ))}
          {achievements.length > 0 && (
            <p className="text-xs text-slate-400">Select the radio button to mark the key achievement.</p>
          )}
        </div>

        {/* hours breakdown - optional */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-900">Hours by task type (optional)</h2>
            <button onClick={addHoursRow} className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
              + Add row
            </button>
          </div>
          {hours.map((h, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <select
                value={h.type}
                onChange={(e) => updateHoursRow(i, "type", e.target.value)}
                className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                <option>Development</option>
                <option>Testing</option>
                <option>Meetings</option>
                <option>Documentation</option>
              </select>
              <input
                type="number"
                value={h.hours}
                onChange={(e) => updateHoursRow(i, "hours", Number(e.target.value))}
                className="w-24 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button onClick={() => removeHoursRow(i)} className="text-xs font-medium text-rose-500 hover:text-rose-600">
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* notes */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Notes or links (optional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex gap-3 pb-8">
  {reportStatus !== "needs_correction" && (
    <button
      onClick={handleSaveDraft}
      disabled={saving}
      className="border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
    >
      Save as draft
    </button>
  )}
  <button
    onClick={handleSubmit}
    disabled={saving}
    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm shadow-indigo-200 transition disabled:opacity-50"
  >
    {reportStatus === "needs_correction" ? "Resubmit for review" : "Submit for review"}
  </button>
</div>
      </div>
    </div>
  );
}