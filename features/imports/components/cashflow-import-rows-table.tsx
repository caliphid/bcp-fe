import { ImportRowItem } from "../../../types/import";
import { PaginationMeta } from "../../../types/common";
import { DataTable } from "../../../components/ui/data-table";
import { ImportStatusBadge } from "./import-status-badge";
import { useImportStore } from "../store/import-store";

interface Props {
  data: ImportRowItem[];
  meta?: PaginationMeta;
  loading: boolean;
}

export function CashflowImportRowsTable({
  data,
  meta,
  loading,
}: Props) {
  const { setRowFilter } = useImportStore();

  const formatCurrency = (val: string | null) => {
    if (!val) return "-";
    const num = Number(val);
    return isNaN(num) ? val : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
  };

  const columns = [
    { header: "Row", cell: (item: ImportRowItem) => item.rowNumber },
    { 
      header: "Sheet", 
      cell: (item: ImportRowItem) => (
        <span className="capitalize">{item.sheetName}</span>
      )
    },
    { 
      header: "Date", 
      cell: (item: ImportRowItem) => new Date(item.transactionDate).toLocaleDateString()
    },
    { 
      header: "Description", 
      cell: (item: ImportRowItem) => (
        <div className="max-w-[200px] truncate" title={item.rawDescription}>
          {item.rawDescription}
        </div>
      )
    },
    {
      header: "Type",
      cell: (item: ImportRowItem) => (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
          item.transactionType === "IN" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          {item.transactionType}
        </span>
      )
    },
    { 
      header: "Amount", 
      cell: (item: ImportRowItem) => (
        <span className="font-medium">{formatCurrency(item.amount)}</span>
      )
    },
    { 
      header: "Category", 
      cell: (item: ImportRowItem) => item.mappedCategory?.name || "-" 
    },
    {
      header: "Status",
      cell: (item: ImportRowItem) => <ImportStatusBadge status={item.status} />,
    },
    {
      header: "Notes",
      cell: (item: ImportRowItem) => (
        <div className="max-w-[150px] text-xs">
          {item.errorMessage && <span className="text-red-600 block truncate" title={item.errorMessage}>{item.errorMessage}</span>}
          {item.warningMessage && <span className="text-amber-600 block truncate" title={item.warningMessage}>{item.warningMessage}</span>}
          {!item.errorMessage && !item.warningMessage && <span className="text-slate-400">-</span>}
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      meta={meta}
      onPageChange={(page) => setRowFilter("page", page)}
      isLoading={loading}
    />
  );
}
