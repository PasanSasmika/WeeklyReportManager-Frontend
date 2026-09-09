import type { ReportStatus } from "../types";

const STATUS_STYLES: Record<ReportStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-blue-50 text-blue-700",
  needs_correction: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  needs_correction: "Needs correction",
  approved: "Approved",
};

export default function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}