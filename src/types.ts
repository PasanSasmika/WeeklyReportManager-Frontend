export type Role = "team_member" | "manager";
export type ReportStatus = "draft" | "submitted" | "needs_correction" | "approved";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Project {
  id: number;
  name: string;
  description: string;
}

export interface TaskItem {
  task: string;
  priority: "low" | "medium" | "high";
  plannedPct: number;
  actualPct: number;
  status: "not_started" | "in_progress" | "done";
  timePlanned: number;
  timeSpent: number;
  output: string;
}

export interface BlockerItem {
  text: string;
  isKey: boolean;
}

export interface AchievementItem {
  text: string;
  isKey: boolean;
}

export interface HoursItem {
  type: string;
  hours: number;
}

export interface Report {
  id: number;
  user_id: number;
  project_id: number;
  project_name?: string;
  week_start: string;
  week_end: string;
  tasks_completed: string; 
  tasks_planned_next: string;
  blockers: string;
  achievements: string;
  hours_breakdown: string;
  notes: string;
  status: ReportStatus;
  current_version: number;
}

export interface ReviewComment {
  id: number;
  version_no: number;
  manager_name: string;
  action: "approved" | "changes_requested";
  comment: string;
  created_at: string;
}

export interface ManagerReportDetail {
  id: number;
  user_id: number;
  user_name: string;
  project_id: number;
  project_name: string;
  week_start: string;
  week_end: string;
  status: ReportStatus;
  current_version: number;
  tasks_completed: TaskItem[];
  tasks_planned_next: string;
  blockers: BlockerItem[];
  achievements: AchievementItem[];
  hours_breakdown: HoursItem[];
  notes: string;
  versions: { id: number; version_no: number; snapshot: any; submitted_at: string }[];
  comments: ReviewComment[];
}