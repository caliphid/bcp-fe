import { ImportBatchStatus, ImportRowStatus } from "../../../types/import";

interface ImportStatusBadgeProps {
  status: ImportBatchStatus | ImportRowStatus;
}

export function ImportStatusBadge({ status }: ImportStatusBadgeProps) {
  let colorClass = "bg-slate-100 text-slate-800";
  let dotClass = "bg-slate-400";
  let label = status.replace(/_/g, " ");

  switch (status) {
    case "COMPLETED":
    case "IMPORTED":
    case "VALID":
      colorClass = "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
      dotClass = "bg-emerald-500";
      break;
    case "PROCESSING":
      colorClass = "bg-blue-50 text-blue-700 ring-blue-600/20";
      dotClass = "bg-blue-500 animate-pulse";
      break;
    case "FAILED":
    case "INVALID":
      colorClass = "bg-red-50 text-red-700 ring-red-600/20";
      dotClass = "bg-red-500";
      break;
    case "PARTIAL_FAILED":
    case "SKIPPED":
      colorClass = "bg-amber-50 text-amber-700 ring-amber-600/20";
      dotClass = "bg-amber-500";
      break;
    case "PREVIEWED":
      colorClass = "bg-indigo-50 text-indigo-700 ring-indigo-600/20";
      dotClass = "bg-indigo-500";
      break;
    case "CANCELLED":
      colorClass = "bg-slate-50 text-slate-700 ring-slate-600/20";
      dotClass = "bg-slate-500";
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colorClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}
