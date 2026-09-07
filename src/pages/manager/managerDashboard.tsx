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
import ManagerNav from "../../components/ManagerNav";
import { getCurrentWeekRange } from "../../utils/dates";

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

const PIE_COLORS = ["#4B5563", "#9CA3AF", "#D1D5DB", "#6B7280", "#111827"];

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
    <div className="min-h-screen bg-gray-50">
      <ManagerNav />

      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold">Team dashboard</h1>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={weekRange.start}
              onChange={(e) => setWeekRange((w) => ({ ...w, start: e.target.value }))}
              className="border border-gray-300 rounded-md px-2 py-1"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={weekRange.end}
              onChange={(e) => setWeekRange((w) => ({ ...w, end: e.target.value }))}
              className="border border-gray-300 rounded-md px-2 py-1"
            />
          </div>
        </div>

        {/* summary cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <SummaryCard label="Reports submitted" value={summary.reportsSubmitted} />
            <SummaryCard label="Compliance rate" value={`${summary.complianceRate}%`} />
            <SummaryCard label="Needs correction" value={summary.needsCorrectionCount} />
            <SummaryCard label="Open blockers" value={summary.openBlockers} />
          </div>
        )}

        {/* charts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ChartCard title="Tasks completed trend">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={tasksTrend}>
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="tasksCompleted" stroke="#111827" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Status by team member">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusCounts}>
                <XAxis dataKey="status" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#374151" />
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Time by task type">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeByType}>
                <XAxis dataKey="type" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#4B5563" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* activity feed */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="text-sm font-medium mb-2">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-xs text-gray-400">No recent activity.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {activity.map((a, i) => (
                <li key={i} className="flex justify-between border-b border-gray-100 pb-1 last:border-0">
                  <span>{a.message}</span>
                  <span className="text-xs text-gray-400">
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

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h2 className="text-sm font-medium mb-2">{title}</h2>
      {children}
    </div>
  );
}