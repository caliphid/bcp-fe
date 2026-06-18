import { ImportBatchItem } from "../../../types/import";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { ImportStatusBadge } from "./import-status-badge";
import { useImportStore } from "../store/import-store";
import { Eye, PlayCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";

interface Props {
  data: ImportBatchItem[];
  meta?: PaginationMeta;
  loading: boolean;
  canMutate: boolean;
  onExecute: (batch: ImportBatchItem) => void;
  onCancel: (batch: ImportBatchItem) => void;
}

export function CashflowImportBatchTable({
  data,
  meta,
  loading,
  canMutate,
  onExecute,
  onCancel,
}: Props) {
  const { setBatchFilter } = useImportStore();

  const columns = [
    { 
      header: "File Name", 
      cell: (item: ImportBatchItem) => (
        <span className="font-medium text-slate-900" title={item.fileName}>
          {item.fileName.length > 25 ? item.fileName.substring(0, 25) + "..." : item.fileName}
        </span>
      )
    },
    { header: "Year", cell: (item: ImportBatchItem) => item.activeYear || "-" },
    { 
      header: "Default Account", 
      cell: (item: ImportBatchItem) => item.defaultAccount?.name || "-" 
    },
    { 
      header: "Default BU", 
      cell: (item: ImportBatchItem) => item.defaultBusinessUnit?.name || "-" 
    },
    {
      header: "Status",
      cell: (item: ImportBatchItem) => <ImportStatusBadge status={item.status} />,
    },
    { 
      header: "Progress", 
      cell: (item: ImportBatchItem) => (
        <div className="flex flex-col text-xs text-slate-500">
          <span>{item.importedRows} / {item.totalRows} imported</span>
          <span className="text-emerald-600">{item.validRows} valid</span>
        </div>
      )
    },
    {
      header: "Created By",
      cell: (item: ImportBatchItem) => (
        <div className="flex flex-col text-xs">
          <span>{item.createdBy?.name || "-"}</span>
          <span className="text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (item: ImportBatchItem) => (
        <div className="flex justify-end gap-2">
          {canMutate && (item.status === "PREVIEWED" || item.status === "PARTIAL_FAILED") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExecute(item)}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2"
              title="Execute Import"
            >
              <PlayCircle className="h-4 w-4 mr-1" /> Execute
            </Button>
          )}
          {canMutate && item.status === "PREVIEWED" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(item)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
              title="Cancel Batch"
            >
              <XCircle className="h-4 w-4 mr-1" /> Cancel
            </Button>
          )}
          <Link 
            href={`/dashboard/imports/cashflow/${item.id}`}
            className="inline-flex items-center justify-center rounded-lg px-2 h-8 text-indigo-600 hover:bg-indigo-50 transition-colors text-sm font-medium"
          >
            <Eye className="h-4 w-4 mr-1" /> Detail
          </Link>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      meta={meta}
      onPageChange={(page) => setBatchFilter("page", page)}
      isLoading={loading}
    />
  );
}
