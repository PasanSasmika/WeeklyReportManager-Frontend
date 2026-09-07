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