import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/client";
import { getCurrentWeekRange } from "../../utils/dates";
import ManagerNav from "../../components/ManagerNav";

interface Summary {
  reportsSubmitted: number;
  totalTeamMembers: number;
  complianceRate: number;
  needsCorrectionCount: number;
  openBlockers: number;
}

interface ActivityItem {
  type: string;
  message: string;
  timestamp: string;
}

const PIE_COLORS = ["#6366F1", "#A5B4FC", "#C7D2FE", "#818CF8", "#4338CA"];

export default function ManagerDashboard() {
  const [weekRange, setWeekRange] = useState(getCurrentWeekRange());
  const [summary, setSummary] = useState<Summary | null>(null);
  const [tasksTrend, setTasksTrend] = useState<any[]>([]);
  const [statusByMember, setStatusByMember] = useState<any[]>([]);
  const [workloadByProject, setWorkloadByProject] = useState<any[]>([]);
  const [timeByType, setTimeByType] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    loadAll();
  }, [weekRange]);

  async function loadAll() {
    const params = { weekStart: weekRange.start, weekEnd: weekRange.end };

    const [summaryRes, trendRes, statusRes, workloadRes, timeRes, activityRes] = await Promise.all([
      api.get("/dashboard/summary", { params }),
      api.get("/dashboard/charts/tasks-trend", { params: { weeks: 6 } }),
      api.get("/dashboard/charts/status-by-member", { params }),
      api.get("/dashboard/charts/workload-by-project", { params }),
      api.get("/dashboard/charts/time-by-type", { params }),
      api.get("/dashboard/activity", { params: { limit: 8 } }),
    ]);

    setSummary(summaryRes.data.data);
    setTasksTrend(trendRes.data.data);
    setStatusByMember(statusRes.data.data);
    setWorkloadByProject(workloadRes.data.data);
    setTimeByType(timeRes.data.data);
    setActivity(activityRes.data.data);
  }

  // group status-by-member into counts per status, for a simple bar chart
  const statusCounts = ["draft", "submitted", "needs_correction", "approved", "not_started"].map(
    (status) => ({
      status,
      count: statusByMember.filter((m) => m.status === status).length,
    })
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <ManagerNav />

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold text-slate-900">Team dashboard</h1>
          <div className="flex items-center gap-2 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <input
              type="date"
              value={weekRange.start}
              onChange={(e) => setWeekRange((w) => ({ ...w, start: e.target.value }))}
              className="border-none text-slate-700 focus:outline-none"
            />
            <span className="text-slate-300">→</span>
            <input
              type="date"
              value={weekRange.end}
              onChange={(e) => setWeekRange((w) => ({ ...w, end: e.target.value }))}
              className="border-none text-slate-700 focus:outline-none"
            />
          </div>
        </div>

        {/* summary cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SummaryCard label="Reports submitted" value={summary.reportsSubmitted} />
            <SummaryCard label="Compliance rate" value={`${summary.complianceRate}%`} />
            <SummaryCard label="Needs correction" value={summary.needsCorrectionCount} accent="amber" />
            <SummaryCard label="Open blockers" value={summary.openBlockers} accent="rose" />
          </div>
        )}

        {/* charts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ChartCard title="Tasks completed trend">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={tasksTrend}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 13 }} />
                <Line type="monotone" dataKey="tasksCompleted" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Status by team member">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusCounts}>
                <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 13 }} />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Workload by project">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={workloadByProject}
                  dataKey="taskCount"
                  nameKey="project"
                  outerRadius={70}
                  label
                >
                  {workloadByProject.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Time by task type">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeByType}>
                <XAxis dataKey="type" tick={{ fontSize: 10, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: "#E2E8F0", fontSize: 13 }} />
                <Bar dataKey="hours" fill="#818CF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* activity feed */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-xs text-slate-400">No recent activity.</p>
          ) : (
            <ul className="text-sm space-y-2.5">
              {activity.map((a, i) => (
                <li key={i} className="flex justify-between border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-slate-700">{a.message}</span>
                  <span className="text-xs text-slate-400 whitespace-nowrap ml-3">
                    {new Date(a.timestamp).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = "indigo",
}: {
  label: string;
  value: string | number;
  accent?: "indigo" | "amber" | "rose";
}) {
  const accentStyles = {
    indigo: "text-indigo-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${accentStyles[accent]}`}>{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 mb-2">{title}</h2>
      {children}
    </div>
  );
}